import nodemailer from 'nodemailer';
import { Notification } from '@task-management/interfaces';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(userId: string, notification: Notification): Promise<void> {
    // In production, fetch user email from user service
    const userEmail = process.env.DEFAULT_EMAIL || `user${userId}@example.com`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@taskmanagement.com',
      to: userEmail,
      subject: notification.title,
      html: `
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        <p>Type: ${notification.type}</p>
        <p>Time: ${notification.createdAt.toISOString()}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${userEmail}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

