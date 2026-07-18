import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import app from '../../src/app.js';
import { JWT_SECRET } from '../../src/config/serverConfig.js';
import User from '../../src/schema/userSchema.js';
import { hashedPassword } from '../../src/utils/common/authUtils.js';

const PASSWORD = 'correct-horse';

describe('POST /api/v1/users/signin', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  const createVerifiedUser = async (overrides = {}) => {
    return User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'signin-test@example.test',
      password: await hashedPassword(PASSWORD),
      isVerified: true,
      role: 'STUDENT',
      ...overrides
    });
  };

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
  });

  it('rejects an incorrect password with 401', async () => {
    const user = await createVerifiedUser();

    const res = await request(app).post('/api/v1/users/signin').send({
      email: user.email,
      password: 'wrong-password'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects an unknown email with 404', async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'nobody-here@example.test',
      password: PASSWORD
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
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
