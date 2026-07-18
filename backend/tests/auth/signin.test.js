import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import app from '../../src/app.js';
import { JWT_SECRET } from '../../src/config/serverConfig.js';
import redis from '../../src/libs/redisConfig.js';
import User from '../../src/schema/userSchema.js';
import { hashedPassword } from '../../src/utils/common/authUtils.js';

const PASSWORD = 'correct-horse';

const testEmail = () =>
  `signin-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

const createVerifiedUser = async (overrides = {}) =>
  User.create({
    firstName: 'Test',
    lastName: 'User',
    email: testEmail(),
    password: await hashedPassword(PASSWORD),
    isVerified: true,
    role: 'STUDENT',
    ...overrides
  });

const cleanupSigninRedis = async (email) => {
  await redis.del(`signin_attempts:${email}`, `signin_lock:${email}`);
};

describe('POST /api/v1/users/signin', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('signs in with correct credentials and returns a working token', async () => {
    const user = await createVerifiedUser();

    const res = await request(app).post('/api/v1/users/signin').send({
      email: user.email,
      password: PASSWORD
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: String(user._id),
      firstName: 'Test',
      lastName: 'User',
      email: user.email,
      role: 'STUDENT'
    });
    expect(res.body.data.password).toBeUndefined();

    // the token isn't just present - it actually decodes to the right user
    const decoded = jwt.verify(res.body.data.token, JWT_SECRET);
    expect(decoded.id).toBe(String(user._id));
    expect(decoded.role).toBe('STUDENT');

    await cleanupSigninRedis(user.email);
  });

  it('rejects an incorrect password with 401', async () => {
    const user = await createVerifiedUser();

    const res = await request(app).post('/api/v1/users/signin').send({
      email: user.email,
      password: 'wrong-password'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);

    await cleanupSigninRedis(user.email);
  });

  it('rejects an unknown email with 404', async () => {
    const email = testEmail();
    const res = await request(app).post('/api/v1/users/signin').send({
      email,
      password: PASSWORD
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);

    await cleanupSigninRedis(email);
  });

  it('rejects a malformed request body with 400 before touching the DB', async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'not-an-email',
      password: PASSWORD
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('signin rate limiting', () => {
  let email;

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await cleanupSigninRedis(email);
  });

  it('locks the account after repeated failed attempts, even for a subsequent correct password', async () => {
    const user = await createVerifiedUser();
    email = user.email;

    // Exactly MAX_SIGNIN_ATTEMPTS (5) wrong passwords - each still a plain
    // 401, since the lock only takes effect starting with the *next* call.
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/v1/users/signin').send({
        email,
        password: 'wrong-password'
      });
      expect(res.status).toBe(401);
    }

    // The 6th call is locked out regardless of whether the password this
    // time is actually correct - proves this is a lockout, not just "still
    // guessing wrong".
    const lockedRes = await request(app).post('/api/v1/users/signin').send({
      email,
      password: PASSWORD
    });

    expect(lockedRes.status).toBe(429);
    expect(lockedRes.body.success).toBe(false);
  });

  it('resets the failed-attempt counter after a successful signin', async () => {
    const user = await createVerifiedUser();
    email = user.email;

    // 4 failures - one below the lockout threshold.
    for (let i = 0; i < 4; i++) {
      const res = await request(app).post('/api/v1/users/signin').send({
        email,
        password: 'wrong-password'
      });
      expect(res.status).toBe(401);
    }

    // A correct signin should reset the counter back to zero...
    const successRes = await request(app).post('/api/v1/users/signin').send({
      email,
      password: PASSWORD
    });
    expect(successRes.status).toBe(200);

    // ...so another 4 failures right after should still not be locked out
    // (if the counter hadn't reset, this would be attempts 5-8 and would
    // have locked on the first one of this batch).
    for (let i = 0; i < 4; i++) {
      const res = await request(app).post('/api/v1/users/signin').send({
        email,
        password: 'wrong-password'
      });
      expect(res.status).toBe(401);
    }
  });
});
