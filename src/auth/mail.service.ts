import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: this.configService.get('MAILTRAP_USERNAME'),
        pass: this.configService.get('MAILTRAP_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationLink = `http://localhost:3000/verify/email/${verificationToken}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'kayyungx@gmail.com',
      to,
      subject: 'Account Verification',
      html: `
        <p>Thank you for registering. Please click the following link to verify your account:</p>
        <a href="${verificationLink}">Verify Account</a>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: 'kayyungx@gmail.com',
      to,
      subject: 'Password Reset',
      html: `
        <p>We received a request to reset your password. Click the following link to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
