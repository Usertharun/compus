import { AuthService } from '../src/modules/auth/auth.service';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from '@node-rs/argon2';
import { UsersService } from '../src/modules/users/users.service';
import { validateEnvironment } from '../src/config/env.config';

jest.mock('@node-rs/argon2', () => ({ hash: jest.fn().mockResolvedValue('hashed'), verify: jest.fn().mockResolvedValue(true) }));
const logger = { log: jest.fn(), warn: jest.fn() };
const user = { id: 'user-1', email: 'student@srmist.edu.in', passwordHash: 'hashed', role: 'VERIFIED_USER', isActive: true, isVerified: true, deletedAt: null, onboardingCompleted: false, profile: { name: 'Student' } };
function setup() {
  const db: any = {
    user: { findUnique: jest.fn().mockResolvedValue(user), create: jest.fn().mockResolvedValue(user), update: jest.fn().mockResolvedValue(user) },
    emailVerification: { findFirst: jest.fn().mockResolvedValue({ id: 'otp-1', otpHash: 'hashed' }), updateMany: jest.fn().mockResolvedValue({ count: 1 }), deleteMany: jest.fn(), create: jest.fn().mockResolvedValue({ id: 'otp-1' }) },
    permission: { findMany: jest.fn().mockResolvedValue([]) }, userPermission: { findMany: jest.fn().mockResolvedValue([]) },
    session: { create: jest.fn().mockResolvedValue({ id: 'session-1' }), update: jest.fn(), updateMany: jest.fn(), findUnique: jest.fn() },
    refreshToken: { create: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
  };
  db.$transaction = jest.fn(async (work: any) => typeof work === 'function' ? work(db) : Promise.all(work));
  const config = new ConfigService({ JWT_SECRET: 'a'.repeat(40), JWT_REFRESH_SECRET: 'b'.repeat(40) });
  const email = { assertConfigured: jest.fn(), sendOtpEmail: jest.fn(), sendWelcomeEmail: jest.fn().mockResolvedValue(undefined) };
  const service = new AuthService(db, new JwtService(), config, email as any, logger as any);
  return { db, config, email, service };
}
beforeEach(() => jest.clearAllMocks());

describe('Server authentication and onboarding', () => {
  it('only grants administrator privileges to the configured owner after a valid OTP', async () => {
    const { db, config, service } = setup();
    config.set('OWNER_EMAIL', 'tharunrajr2007@gmail.com');
    await service.registerWithOtp({ email: 'THARUNRAJR2007@gmail.com', password: 'Password1!', otp: '123456', name: 'Owner' });
    expect(db.user.create.mock.calls[0][0].data).toMatchObject({ email: 'tharunrajr2007@gmail.com', role: 'SUPER_ADMIN', isVerified: true, onboardingCompleted: true });
    db.user.create.mockClear();
    await service.registerWithOtp({ email: user.email, password: 'Password1!', otp: '123456', name: 'Student' });
    expect(db.user.create.mock.calls[0][0].data.role).toBe('VERIFIED_USER');
  });
  it('rejects every other Gmail address before registration or sending email', async () => {
    const { db, config, service, email } = setup();
    config.set('OWNER_EMAIL', 'tharunrajr2007@gmail.com');
    await expect(service.requestRegistrationOtp({ email: 'someone@gmail.com' })).rejects.toThrow('@srmist.edu.in');
    await expect(service.registerWithOtp({ email: 'someone@gmail.com', password: 'Password1!', otp: '123456', name: 'Other' })).rejects.toThrow('@srmist.edu.in');
    expect(email.sendOtpEmail).not.toHaveBeenCalled();
    expect(db.user.create).not.toHaveBeenCalled();
  });
  it('never creates an owner account for an incorrect verification code', async () => {
    const { db, config, service } = setup();
    config.set('OWNER_EMAIL', 'tharunrajr2007@gmail.com');
    (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
    await expect(service.registerWithOtp({ email: 'tharunrajr2007@gmail.com', password: 'Password1!', otp: '000000', name: 'Owner' })).rejects.toThrow('Invalid verification');
    expect(db.user.create).not.toHaveBeenCalled();
  });
  it('requires both the configured owner email and administrator role to restore an external-email session', async () => {
    const { db, config } = setup();
    config.set('OWNER_EMAIL', 'tharunrajr2007@gmail.com');
    db.session.findUnique.mockResolvedValue({ userId: user.id, isRevoked: false, expiresAt: new Date(Date.now() + 60000) });
    const strategy = new JwtStrategy(config, db);
    const request = { headers: { authorization: 'Bearer token' } } as any;
    const payload = { sub: user.id, email: 'tharunrajr2007@gmail.com', role: 'SUPER_ADMIN' };
    db.user.findUnique.mockResolvedValue({ ...user, email: payload.email, role: 'VERIFIED_USER' });
    await expect(strategy.validate(request, payload)).rejects.toThrow();
    db.user.findUnique.mockResolvedValue({ ...user, email: 'other@gmail.com', role: 'SUPER_ADMIN' });
    await expect(strategy.validate(request, payload)).rejects.toThrow();
    db.user.findUnique.mockResolvedValue({ ...user, email: payload.email, role: 'SUPER_ADMIN' });
    await expect(strategy.validate(request, payload)).resolves.toMatchObject({ role: 'SUPER_ADMIN', email: payload.email });
  });
  it('cannot reuse a reset token consumed by a concurrent request', async () => {
    const { db, service } = setup();
    db.passwordResetToken = { findUnique: jest.fn().mockResolvedValue({ id: 'reset-1', userId: user.id, user, isUsed: false, expiresAt: new Date(Date.now() + 60000) }), updateMany: jest.fn().mockResolvedValue({ count: 0 }) };
    db.passwordHistory = { findMany: jest.fn().mockResolvedValue([]), create: jest.fn() };
    await expect(service.resetPassword({ token: 'reset-token', newPassword: 'Replacement2!' })).rejects.toThrow('already been used');
    expect(db.user.update).not.toHaveBeenCalled();
  });
  it('blocks non-SRM login before looking up the account', async () => {
    const { db, service } = setup();
    await expect(service.login({ email: 'student@mit.edu', password: 'Password1!' })).rejects.toThrow('@srmist.edu.in');
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
  it('blocks non-SRM accounts from restoring existing sessions', async () => {
    const { db, config } = setup();
    db.session.findUnique.mockResolvedValue({ userId: user.id, isRevoked: false, expiresAt: new Date(Date.now() + 60000) });
    db.user.findUnique.mockResolvedValue({ ...user, email: 'student@mit.edu' });
    await expect(new JwtStrategy(config, db).validate({ headers: { authorization: 'Bearer token' } } as any, { sub: user.id, email: 'student@mit.edu', role: user.role })).rejects.toThrow();
  });
  it('blocks non-SRM password recovery before sending mail', async () => {
    const { db, email, service } = setup();
    await expect(service.forgotPassword({ email: 'student@mit.edu' })).rejects.toThrow('@srmist.edu.in');
    expect(email.assertConfigured).not.toHaveBeenCalled(); expect(db.user.findUnique).not.toHaveBeenCalled();
  });
  it('refuses disabled users without issuing sessions', async () => {
    const { db, service } = setup(); db.user.findUnique.mockResolvedValue({ ...user, isActive: false });
    await expect(service.login({ email: user.email, password: 'Password1!' })).rejects.toThrow();
    expect(db.session.create).not.toHaveBeenCalled();
  });
  it('issues distinct tokens for logins within the same second', async () => {
    const { service } = setup();
    const a = await service.login({ email: user.email, password: 'Password1!' });
    const b = await service.login({ email: user.email, password: 'Password1!' });
    expect(a.accessToken).not.toBe(b.accessToken); expect(a.refreshToken).not.toBe(b.refreshToken);
  });
  it('enforces the OTP attempt limit on direct registration calls', async () => {
    const { db, service } = setup(); db.emailVerification.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.registerWithOtp({ email: user.email, password: 'Password1!', otp: '123456', name: 'Student' })).rejects.toThrow('Too many');
    expect(db.user.create).not.toHaveBeenCalled();
  });
  it('does not create an account for an incorrect OTP', async () => {
    const { db, service } = setup(); (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
    await expect(service.registerWithOtp({ email: user.email, password: 'Password1!', otp: '000000', name: 'Student' })).rejects.toThrow('Invalid verification');
    expect(db.user.create).not.toHaveBeenCalled();
  });
  it('consumes the OTP and creates identity and tokens inside one transaction', async () => {
    const { db, service } = setup();
    const response = await service.registerWithOtp({ email: user.email, password: 'Password1!', otp: '123456', name: ' Student ' });
    expect(response.user.id).toBe(user.id); expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.user.create.mock.calls[0][0].data.profile.create.name).toBe('Student');
    expect(db.emailVerification.updateMany.mock.calls[1][0].data.isUsed).toBe(true);
  });
  it('invalidates an OTP whose email could not be delivered', async () => {
    const { db, email, service } = setup(); db.user.findUnique.mockResolvedValue(null); db.emailVerification.findFirst.mockResolvedValue(null);
    email.sendOtpEmail.mockRejectedValue(new Error('Delivery unavailable'));
    await expect(service.requestRegistrationOtp({ email: user.email })).rejects.toThrow('Delivery unavailable');
    expect(db.emailVerification.deleteMany).toHaveBeenLastCalledWith({ where: { id: 'otp-1' } });
  });
  it('rejects refresh from a revoked session', async () => {
    const { db, config, service } = setup();
    const token = new JwtService().sign({ sub: user.id }, { secret: config.get('JWT_REFRESH_SECRET') });
    db.refreshToken.findUnique.mockResolvedValue({ userId: user.id, isRevoked: false, expiresAt: new Date(Date.now() + 60000), session: { isRevoked: true } });
    await expect(service.refreshToken(token)).rejects.toThrow('Session expired'); expect(db.session.create).not.toHaveBeenCalled();
  });
  it('revokes both access sessions and refresh tokens on logout', async () => {
    const { db, service } = setup(); await service.logout(user.id);
    expect(db.session.updateMany).toHaveBeenCalledWith({ where: { userId: user.id, isRevoked: false }, data: { isRevoked: true } });
    expect(db.refreshToken.updateMany).toHaveBeenCalled();
  });
  it('denies a cryptographically valid access token after session revocation', async () => {
    const { db, config } = setup(); db.session.findUnique.mockResolvedValue({ userId: user.id, isRevoked: true });
    const strategy = new JwtStrategy(config, db);
    await expect(strategy.validate({ headers: { authorization: 'Bearer token' } } as any, { sub: user.id, email: user.email, role: user.role })).rejects.toThrow('revoked');
  });
  it('does not mark onboarding complete when profile saving fails', async () => {
    const { db } = setup(); db.profile = { update: jest.fn().mockRejectedValue(new Error('DB unavailable')) };
    const service = new UsersService({} as any, logger as any, db);
    await expect(service.completeOnboarding(user.id, { name: 'Student', department: 'CS', year: '2027', goals: [] })).rejects.toThrow('DB unavailable');
    expect(db.user.update).not.toHaveBeenCalled();
  });
  it('rejects insecure production configuration without printing secrets', () => {
    const secret = 'sensitive-short';
    expect(() => validateEnvironment({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://private:password@localhost/db', JWT_SECRET: secret, JWT_REFRESH_SECRET: 'b'.repeat(40) })).toThrow('JWT_SECRET');
    try { validateEnvironment({ JWT_SECRET: 123 }); } catch (error) { expect(String(error)).not.toContain('private:password'); }
  });
});
