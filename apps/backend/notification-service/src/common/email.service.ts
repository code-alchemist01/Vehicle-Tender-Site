import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get('SMTP_HOST', 'localhost'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: this.configService.get('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM', 'noreply@vehicleauction.com'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}`, result.messageId);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendTemplateEmail(
    to: string | string[],
    template: string,
    variables: Record<string, any> = {},
  ): Promise<boolean> {
    // Template rendering logic would go here
    // For now, we'll use a simple placeholder replacement
    const subject = this.renderTemplate(template + '_subject', variables);
    const html = this.renderTemplate(template + '_html', variables);
    
    return this.sendEmail({
      to,
      subject,
      html,
    });
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
    // Simple template rendering - in production, use a proper template engine
    let rendered = this.getTemplate(template);
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, variables[key]);
    });
    
    return rendered;
  }

  private getTemplate(templateName: string): string {
    // Template storage - in production, load from database or files
    const templates: Record<string, string> = {
      'auction_created_subject': 'New Auction: {{vehicleTitle}}',
      'auction_created_html': `
        <h2>New Auction Created</h2>
        <p>A new auction has been created for: <strong>{{vehicleTitle}}</strong></p>
        <p>Starting Price: $\${startingPrice}</p>
        <p>Auction ends: {{endDate}}</p>
        <a href="{{auctionUrl}}">View Auction</a>
      `,
      'bid_placed_subject': 'New Bid on {{vehicleTitle}}',
      'bid_placed_html': `
        <h2>New Bid Placed</h2>
        <p>A new bid of $\${bidAmount} has been placed on: <strong>{{vehicleTitle}}</strong></p>
        <a href="{{auctionUrl}}">View Auction</a>
      `,
      'auction_won_subject': 'Congratulations! You won {{vehicleTitle}}',
      'auction_won_html': `
        <h2>Auction Won!</h2>
        <p>Congratulations! You have won the auction for: <strong>{{vehicleTitle}}</strong></p>
        <p>Winning Bid: $\${winningBid}</p>
        <p>Please proceed with payment within 24 hours.</p>
        <a href="{{paymentUrl}}">Make Payment</a>
      `,
    };
    
    return templates[templateName] || '';
  }
}