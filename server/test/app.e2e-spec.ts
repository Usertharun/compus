import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { EmailService } from '../src/modules/email/email.service';
import { PrismaService } from '../src/database/prisma.service';

// This suite creates only its own unique account, and refuses a non-test database.
describe('Database-backed authentication lifecycle', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let otp = '';
  let resetToken = '';
  const email = `compus-test-${Date.now()}@srmist.edu.in`;
  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test' || new URL(process.env.DATABASE_URL || '').pathname !== '/compus_test') {
      throw new Error('E2E tests require NODE_ENV=test and a dedicated compus_test database.');
    }
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(EmailService).useValue({
      assertConfigured: () => undefined,
      sendOtpEmail: async (_email: string, value: string) => { otp = value; },
      sendWelcomeEmail: async () => undefined,
      sendPasswordResetEmail: async (_email: string, value: string) => { resetToken = value; },
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);
  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({ where: { email } });
      await prisma.emailVerification.deleteMany({ where: { email } });
    }
    if (app) await app.close();
  });
  it('checks health, verifies signup, persists onboarding, rotates tokens and revokes access', async () => {
    const http = app.getHttpServer();
    await request(http).get('/api/v1/health').expect(200).expect(r => expect(r.body.data.status).toBe('ok'));
    await request(http).post('/api/v1/auth/request-otp').send({ email }).expect(200);
    expect(otp).toMatch(/^\d{6}$/);
    await request(http).post('/api/v1/auth/register-with-otp').send({ email, otp: '1234', password: 'Password1!', name: 'Student' }).expect(400);
    await request(http).post('/api/v1/auth/register-with-otp').send({ email, otp, password: 'Password1!' }).expect(400);
    const registered = await request(http).post('/api/v1/auth/register-with-otp').send({ email, otp, password: 'Password1!', name: 'Student' }).expect(201);
    let { accessToken, refreshToken } = registered.body.data;
    await request(http).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(200).expect(r => expect(r.body.data.onboardingCompleted).toBe(false));
    await request(http).post('/api/v1/users/onboarding/complete').set('Authorization', `Bearer ${accessToken}`).send({ name: 'Test Student', department: 'CS', year: '2027', goals: ['mentors'] }).expect(201);
    await request(http).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(200).expect(r => {
      expect(r.body.data.onboardingCompleted).toBe(true); expect(r.body.data.profile.name).toBe('Test Student');
    });
    const refreshed = await request(http).post('/api/v1/auth/refresh').send({ refreshToken }).expect(200);
    await request(http).post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);
    await request(http).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(401);
    ({ accessToken, refreshToken } = refreshed.body.data);
    await request(http).post('/api/v1/auth/logout').set('Authorization', `Bearer ${accessToken}`).send({}).expect(200);
    await request(http).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(401);
    await request(http).post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);
    const login = await request(http).post('/api/v1/auth/login').send({ email, password: 'Password1!' }).expect(200);
    await request(http).post('/api/v1/auth/forgot-password').send({ email }).expect(200);
    await request(http).post('/api/v1/auth/reset-password').send({ token: resetToken, newPassword: 'Replacement2!' }).expect(200);
    await request(http).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.data.accessToken}`).expect(401);
    await request(http).post('/api/v1/auth/refresh').send({ refreshToken: login.body.data.refreshToken }).expect(401);
    await request(http).post('/api/v1/auth/login').send({ email, password: 'Password1!' }).expect(401);
    await request(http).post('/api/v1/auth/login').send({ email, password: 'Replacement2!' }).expect(200);
  }, 30000);
});
