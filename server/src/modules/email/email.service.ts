import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<number>('SMTP_PORT', 465));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  assertConfigured(): void {
    if (!this.configService.get<string>('SMTP_HOST') || !this.configService.get<string>('SMTP_FROM') || (['smtp.resend.com', 'smtp.gmail.com'].includes(this.configService.get<string>('SMTP_HOST') || '') && (!this.configService.get<string>('SMTP_PASS') || !this.configService.get<string>('SMTP_USER')))) {
      throw new ServiceUnavailableException('Email delivery is not available yet. Please try again later.');
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    this.assertConfigured();
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Compus - Verification OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">Compus Verification Code</h2>
          <p>Hello,</p>
          <p>Your one-time security OTP verification code for registering your Compus college account is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111827;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 OTP email dispatched successfully to: ${email}`, 'EmailService');
    } catch {
      this.logger.warn('Verification email delivery failed', 'EmailService');
      throw new ServiceUnavailableException('Unable to deliver your verification code. Please try again later.');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Welcome to Compus!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Welcome to Compus, ${name}!</h2>
          <p>Your official campus account has been successfully verified.</p>
          <p>You can now connect with fellow students, join communities, track campus events, and discover opportunities.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.warn('Welcome email delivery failed', 'EmailService');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    this.assertConfigured();
    const resetUrl = new URL('/reset-password', this.configService.get<string>('APP_URL', 'http://localhost:5173'));
    resetUrl.searchParams.set('token', resetToken);
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: 'Compus - Password Reset Instructions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>We received a request to reset your Compus account password.</p>
          <p><a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 15 minutes.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.warn('Password reset email delivery failed', 'EmailService');
      throw new ServiceUnavailableException('Unable to send the reset link. Please try again later.');
    }
  }
}
