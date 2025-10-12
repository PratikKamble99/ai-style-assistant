import nodemailer from 'nodemailer';
import { createError } from '../middleware/errorHandler';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}

export interface WelcomeEmailData {
  name: string;
  email: string;
}

export interface StyleSuggestionEmailData {
  name: string;
  occasion: string;
  outfitDescription: string;
  imageUrl?: string;
  productLinks: Array<{
    name: string;
    url: string;
    price: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter(): void {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured - missing SMTP credentials');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      this.isConfigured = true;
      console.log('Email service configured successfully');
    } catch (error) {
      console.error('Failed to configure email service:', error);
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.transporter) {
        console.warn('Email service not configured - skipping email send');
        return false;
      }

      const mailOptions = {
        from: `"AI Stylist" <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI Stylist</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AI Stylist! ✨</h1>
            <p>Your personal AI-powered fashion assistant</p>
          </div>
          <div class="content">
            <h2>Hi ${data.name}!</h2>
            <p>We're thrilled to have you join our community of fashion enthusiasts. AI Stylist is here to help you discover your perfect style with personalized recommendations powered by artificial intelligence.</p>
            
            <h3>What you can do with AI Stylist:</h3>
            <ul>
              <li>🤖 Get AI-powered style recommendations based on your photos</li>
              <li>👗 Discover outfits for any occasion</li>
              <li>🛍️ Shop curated products from top fashion brands</li>
              <li>💄 Receive personalized grooming and beauty tips</li>
              <li>📱 Access your style assistant on web and mobile</li>
            </ul>

            <p>Ready to get started? Complete your profile and upload your photos to receive your first personalized style suggestions!</p>
            
            <a href="${process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000'}/profile" class="button">Complete Your Profile</a>
            
            <p>If you have any questions, feel free to reach out to our support team. We're here to help you look and feel your best!</p>
            
            <p>Happy styling!<br>The AI Stylist Team</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Stylist. All rights reserved.</p>
            <p>You received this email because you signed up for AI Stylist.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: data.email,
      subject: 'Welcome to AI Stylist - Your Fashion Journey Begins! 🎉',
      html
    });
  }

  /**
   * Send style suggestion email
   */
  async sendStyleSuggestionEmail(email: string, data: StyleSuggestionEmailData): Promise<boolean> {
    const productLinksHtml = data.productLinks.map(product => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0;">
        <h4 style="margin: 0 0 5px 0;">${product.name}</h4>
        <p style="margin: 0 0 10px 0; color: #ec4899; font-weight: bold;">${product.price}</p>
        <a href="${product.url}" style="background: #ec4899; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">View Product</a>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Style Suggestions Are Ready!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #f472b6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .outfit-image { width: 100%; max-width: 300px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your ${data.occasion} Style is Ready! ✨</h1>
            <p>Personalized recommendations just for you</p>
          </div>
          <div class="content">
            <h2>Hi ${data.name}!</h2>
            <p>We've created the perfect ${data.occasion.toLowerCase()} look based on your style preferences and body type. Here's what we recommend:</p>
            
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Your style suggestion" class="outfit-image">` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Your Outfit Recommendation:</h3>
              <p>${data.outfitDescription}</p>
            </div>

            ${data.productLinks.length > 0 ? `
              <h3>Shop These Curated Products:</h3>
              ${productLinksHtml}
            ` : ''}
            
            <p>Love this look? Save it to your favorites and share it with friends! Don't forget to rate your suggestions to help us learn your style better.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000'}/suggestions" style="background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Suggestions</a>
            </div>
            
            <p>Happy styling!<br>The AI Stylist Team</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Stylist. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: `Your ${data.occasion} Style Suggestions Are Ready! 👗`,
      html
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f3f4f6; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>We received a request to reset your password for your AI Stylist account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The AI Stylist Team</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Stylist. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your AI Stylist Password',
      html
    });
  }

  /**
   * Send feedback thank you email
   */
  async sendFeedbackThankYouEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Feedback!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You! 🙏</h1>
            <p>Your feedback helps us improve</p>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Thank you for taking the time to provide feedback on your style suggestions. Your input is invaluable in helping us improve our AI recommendations and create better experiences for you and our community.</p>
            
            <p>We're constantly learning from your preferences to provide more accurate and personalized style suggestions. The more you interact with our recommendations, the better we get at understanding your unique style!</p>
            
            <p>Keep exploring and discovering new looks with AI Stylist. We're excited to be part of your fashion journey!</p>
            
            <p>Happy styling!<br>The AI Stylist Team</p>
          </div>
          <div class="footer">
            <p>© 2024 AI Stylist. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Thank You for Your Feedback! 💝',
      html
    });
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConfigured || !this.transporter) {
        return false;
      }

      await this.transporter.verify();
      console.log('Email service connection test successful');
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();