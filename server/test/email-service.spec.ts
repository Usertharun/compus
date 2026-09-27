import { ConfigService } from '@nestjs/config';
import { EmailService } from '../src/modules/email/email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));
const sendMail = jest.fn();
const logger = { log: jest.fn(), warn: jest.fn() };
beforeEach(() => { jest.clearAllMocks(); (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail }); });
const config = { SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: 465, SMTP_USER: 'compus-sender@gmail.com', SMTP_PASS: 'test-app-password', SMTP_FROM: 'Compus <compus-sender@gmail.com>', APP_URL: 'https://compus-ashy.vercel.app' };

describe('Verification email delivery', () => {
  it('requires sender credentials and never pretends delivery succeeded', async () => {
    const service = new EmailService(new ConfigService({ SMTP_HOST: 'smtp.gmail.com' }), logger as any);
    await expect(service.sendOtpEmail('student@srmist.edu.in', '654321')).rejects.toThrow('not available');
    expect(sendMail).not.toHaveBeenCalled();
  });
  it('propagates delivery failures without logging the OTP or provider error', async () => {
    sendMail.mockRejectedValueOnce(new Error('secret provider information 654321'));
    const service = new EmailService(new ConfigService(config), logger as any);
    await expect(service.sendOtpEmail('student@srmist.edu.in', '654321')).rejects.toThrow('Unable to deliver');
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain('654321');
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain('secret provider');
  });
  it('uses the configured production URL and sender for password recovery', async () => {
    sendMail.mockResolvedValueOnce({});
    const service = new EmailService(new ConfigService(config), logger as any);
    await service.sendPasswordResetEmail('student@srmist.edu.in', 'reset-token');
    expect(sendMail.mock.calls[0][0].from).toBe(config.SMTP_FROM);
    expect(sendMail.mock.calls[0][0].html).toContain('https://compus-ashy.vercel.app/reset-password?token=reset-token');
    expect(sendMail.mock.calls[0][0].html).not.toContain('localhost');
  });
});
