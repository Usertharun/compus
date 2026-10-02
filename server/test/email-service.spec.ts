import { ConfigService } from '@nestjs/config';
import { EmailService } from '../src/modules/email/email.service';
import { AppLoggerService } from '../src/logger/logger.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));
const sendMail = jest.fn();
const logger = { log: jest.fn(), warn: jest.fn() };
const originalFetch = global.fetch;
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
  (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
});
afterAll(() => { global.fetch = originalFetch; });
const config = { SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: 465, SMTP_USER: 'compus-sender@gmail.com', SMTP_PASS: 'test-app-password', SMTP_FROM: 'Compus <compus-sender@gmail.com>', APP_URL: 'https://compus-ashy.vercel.app' };
const brevoConfig = { BREVO_API_KEY: 'test-api-key', BREVO_SENDER_EMAIL: 'compus-sender@gmail.com', BREVO_SENDER_NAME: 'Compus' };

describe('Verification email delivery', () => {
  it('requires sender credentials and never pretends delivery succeeded', async () => {
    const service = new EmailService(new ConfigService({ SMTP_HOST: 'smtp.gmail.com' }), logger as unknown as AppLoggerService);
    await expect(service.sendOtpEmail('student@srmist.edu.in', '654321')).rejects.toThrow('not available');
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('propagates delivery failures without logging the OTP or provider error', async () => {
    sendMail.mockRejectedValueOnce(new Error('secret provider information 654321'));
    const service = new EmailService(new ConfigService(config), logger as unknown as AppLoggerService);
    await expect(service.sendOtpEmail('student@srmist.edu.in', '654321')).rejects.toThrow('Unable to deliver');
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain('654321');
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain('secret provider');
  });
  it('uses the configured production URL and sender for password recovery', async () => {
    sendMail.mockResolvedValueOnce({});
    const service = new EmailService(new ConfigService(config), logger as unknown as AppLoggerService);
    await service.sendPasswordResetEmail('student@srmist.edu.in', 'reset-token');
    expect(sendMail.mock.calls[0][0].from).toBe(config.SMTP_FROM);
    expect(sendMail.mock.calls[0][0].html).toContain('https://compus-ashy.vercel.app/reset-password?token=reset-token');
    expect(sendMail.mock.calls[0][0].html).not.toContain('localhost');
  });
  it('prefers the Brevo HTTPS API and sends the OTP to the requested address', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201 }) as jest.Mock;
    const service = new EmailService(new ConfigService(brevoConfig), logger as unknown as AppLoggerService);
    await service.sendOtpEmail('student@srmist.edu.in', '654321');

    expect(global.fetch).toHaveBeenCalledWith('https://api.brevo.com/v3/smtp/email', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'api-key': 'test-api-key' }),
    }));
    const request = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(request.body);
    expect(body.sender).toEqual({ email: 'compus-sender@gmail.com', name: 'Compus' });
    expect(body.to).toEqual([{ email: 'student@srmist.edu.in' }]);
    expect(body.htmlContent).toContain('654321');
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('does not expose the API key, OTP, or provider response when Brevo rejects a request', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as jest.Mock;
    const service = new EmailService(new ConfigService(brevoConfig), logger as unknown as AppLoggerService);
    await expect(service.sendOtpEmail('student@srmist.edu.in', '654321')).rejects.toThrow('Unable to deliver');
    const logged = JSON.stringify(logger.warn.mock.calls);
    expect(logged).toContain('BREVO_API_ERROR');
    expect(logged).toContain('401');
    expect(logged).not.toContain('test-api-key');
    expect(logged).not.toContain('654321');
  });
});
