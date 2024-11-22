import nodemailer from 'nodemailer';
import { env } from '@/env.ts';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
}

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
        }
    });
    
    static async sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
        const changedSubject = env.VERCEL_ENV === 'production' ? subject : `[DEV] ${subject}`;
        const mailOptions = {
            from: env.EMAIL_FROM,
            to: to,
            subject: changedSubject,
            html: html,
          };
      
          try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email ${mailOptions.subject} send to ${to}`);
          } catch (error) {
            console.error("Error sending email: ", error);
            throw error;
          }
      
    }
}