import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock only the actual email transport - sending a real email every test
// run doesn't add confidence and does add noise/slowness. Redis rate-limit
// state and the OTP itself are kept 100% real (this project's own dev
// Upstash instance, reached over its REST API - no local infra needed).
vi.mock('../../src/config/nodemailer.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(true)
}));

const app = (await import('../../src/app.js')).default;
const User = (await import('../../src/schema/userSchema.js')).default;
const redis = (await import('../../src/libs/redisConfig.js')).default;
const { sendEmail } = await import('../../src/config/nodemailer.js');

const testEmail = () => `signup-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;

const cleanupRedis = async (email) => {
  await redis.del(
    `otp:${email}`,
    `otp_cooldown:${email}`,
    `otp_request_count:${email}`,
    `otp_spam_lock:${email}`,
    `otp_lock:${email}`,
    `otp_attempts:${email}`
  );
};

describe('signup + email verification', () => {
  let email;

  afterEach(async () => {
    await User.deleteMany({ email });
    await cleanupRedis(email);
    sendEmail.mockClear();
  });

  const signupPayload = () => ({
    email,
    firstName: 'Signup',
    lastName: 'Test',
    password: 'test-pass'
  });

  it('POST /signup sends an OTP and does not create a user yet', async () => {
    email = testEmail();

    const res = await request(app).post('/api/v1/users/signup').send(signupPayload());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const storedOtp = await redis.get(`otp:${email}`);
    expect(storedOtp).toBeTruthy();
    expect(String(storedOtp)).toMatch(/^\d{6}$/);

    const user = await User.findOne({ email });
    expect(user).toBeNull();
  });

  it('rejects signup for an email that is already a verified user', async () => {
    email = testEmail();
    await User.create({
      ...signupPayload(),
      password: 'irrelevant-hash'
    });

    const res = await request(app).post('/api/v1/users/signup').send(signupPayload());

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /verify-email with the real OTP creates a verified user with a hashed password', async () => {
    email = testEmail();
    const payload = signupPayload();

    await request(app).post('/api/v1/users/signup').send(payload);
    const otp = await redis.get(`otp:${email}`);

    const res = await request(app)
      .post('/api/v1/users/verify-email')
      .send({ ...payload, otp: String(otp) });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email });
    expect(user).not.toBeNull();
    expect(user.isVerified).toBe(true);
    expect(user.password).not.toBe(payload.password); // hashed, not plaintext
  });

  it('rejects verify-email with an incorrect OTP', async () => {
    email = testEmail();
    const payload = signupPayload();

    await request(app).post('/api/v1/users/signup').send(payload);

    const res = await request(app)
      .post('/api/v1/users/verify-email')
      .send({ ...payload, otp: '000000' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);

    const user = await User.findOne({ email });
    expect(user).toBeNull();
  });
});
