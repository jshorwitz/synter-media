import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

export async function sendMagicLinkEmail(email: string, magicUrl: string): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@synter.com',
      to: email,
      subject: 'Sign in to Synter - Magic Link',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Sign in to Synter</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: medium; }
            .button:hover { background: #1d4ed8; }
            .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #666; }
            .security-note { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Synter</div>
              <h1>Sign in to your account</h1>
            </div>
            
            <p>Click the button below to securely sign in to your Synter account:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${magicUrl}" class="button">Sign in to Synter</a>
            </p>
            
            <div class="security-note">
              <strong>Security note:</strong> This link will expire in 10 minutes for your security. 
              If you didn't request this email, you can safely ignore it.
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-family: monospace; background: #f1f5f9; padding: 10px; border-radius: 4px;">${magicUrl}</p>
            
            <div class="footer">
              <p>Need help? Contact us at support@synter.com</p>
              <p>&copy; ${new Date().getFullYear()} Synter. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Sign in to Synter
        
        Click this link to securely sign in to your Synter account:
        ${magicUrl}
        
        This link will expire in 10 minutes for your security.
        If you didn't request this email, you can safely ignore it.
        
        Need help? Contact us at support@synter.com
        
        © ${new Date().getFullYear()} Synter. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending magic link email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  try {
    const displayName = name || email.split('@')[0];
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@synter.com',
      to: email,
      subject: 'Welcome to Synter!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Synter</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: medium; margin: 10px 0; }
            .footer { text-align: center; margin-top: 40px; font-size: 14px; color: #666; }
            .feature-list { list-style: none; padding: 0; }
            .feature-list li { padding: 8px 0; }
            .feature-list li::before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Synter</div>
              <h1>Welcome to Synter, ${displayName}!</h1>
            </div>
            
            <p>Thanks for joining Synter, the unified cross-channel ads platform. You're now ready to:</p>
            
            <ul class="feature-list">
              <li>Run warehouse-centric campaigns across Google Ads, Reddit, and X/Twitter</li>
              <li>Track attribution and performance with advanced analytics</li>
              <li>Automate campaign optimization with AI-powered agents</li>
              <li>Scale your advertising with data-driven insights</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="button">Get Started</a>
            </p>
            
            <p>Need help getting started? Check out our documentation or reach out to our support team.</p>
            
            <div class="footer">
              <p>Questions? Reply to this email or contact support@synter.com</p>
              <p>&copy; ${new Date().getFullYear()} Synter. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw here - welcome email is not critical
  }
}
