import * as argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import nodemailer from 'nodemailer'

export interface JWTPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export class AuthService {
  private jwtSecret: string
  private sessionExpiryHours: number

  constructor(jwtSecret: string, sessionExpiryHours: number = 24) {
    this.jwtSecret = jwtSecret
    this.sessionExpiryHours = sessionExpiryHours
  }

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64MB
      timeCost: 3,
      parallelism: 4
    })
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password)
    } catch (error) {
      return false
    }
  }

  generateSessionToken(): string {
    return nanoid(64)
  }

  generateMagicToken(): string {
    return nanoid(64)
  }

  signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: `${this.sessionExpiryHours}h`,
      issuer: 'synter',
      audience: 'synter-app'
    })
  }

  verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'synter',
        audience: 'synter-app'
      }) as JWTPayload
    } catch (error) {
      return null
    }
  }

  getSessionExpiry(): Date {
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + this.sessionExpiryHours)
    return expiry
  }

  getMagicLinkExpiry(): Date {
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 10)
    return expiry
  }
}

// Cookie utilities
export interface CookieOptions {
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  maxAge: number
  path: string
  domain?: string
}

export function getSessionCookieOptions(isProduction: boolean = false): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  }
}

export const SYNTER_SESSION_COOKIE = 'synter_session'

// Email service
// Database functions (stub implementations)
export async function getSessionUser(sessionToken: string) {
  // TODO: Implement session lookup in database
  return null
}

export async function deleteSession(sessionToken: string) {
  // TODO: Implement session deletion in database
  return true
}

export async function getUserByEmail(email: string) {
  // TODO: Implement user lookup by email in database
  return null
}

export async function createUser(email: string, name?: string, role: string = 'viewer') {
  // TODO: Implement user creation in database
  return { id: 1, email, name, role }
}

export async function createMagicLink(userId: number, token: string, expiresAt: Date) {
  // TODO: Implement magic link creation in database
  return { id: 1, userId, token, expiresAt }
}

export async function getMagicLinkUser(token: string) {
  // TODO: Implement magic link lookup in database
  return null
}

export async function markMagicLinkAsUsed(token: string) {
  // TODO: Implement magic link usage marking in database
  return true
}

export async function createSession({
  userId,
  sessionToken,
  userAgent,
  ip,
}: {
  userId: number
  sessionToken: string
  userAgent?: string
  ip?: string
}) {
  const auth = new AuthService(process.env.JWT_SECRET!)
  const expiresAt = auth.getSessionExpiry()
  
  // TODO: Implement session creation in database
  // For now, return mock data - replace with actual DB insert when Prisma is wired up
  return {
    sessionToken,
    expiresAt,
  }
}

export class EmailService {
  private transporter: nodemailer.Transporter
  private from: string
  private baseUrl: string

  constructor(config: {
    smtp: { host: string; port: number; secure: boolean; auth: { user: string; pass: string } }
    from: string
    baseUrl: string
  }) {
    this.transporter = nodemailer.createTransporter(config.smtp)
    this.from = config.from
    this.baseUrl = config.baseUrl
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    const magicUrl = `${this.baseUrl}/auth/magic?token=${token}`
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sign in to Synter</title>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .header { background: linear-gradient(135deg, #0066CC 0%, #004499 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 32px; font-weight: bold; letter-spacing: -0.025em; }
        .content { padding: 40px 20px; }
        .button { display: inline-block; background: #0066CC; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Synter</div>
        </div>
        <div class="content">
          <h1>Sign in to your account</h1>
          <p>Click the button below to sign in to your Synter account. This link will expire in 10 minutes.</p>
          <p><a href="${magicUrl}" class="button">Sign in to Synter</a></p>
          <p>If you can't click the button, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${magicUrl}</p>
          <p>If you didn't request this email, you can safely ignore it.</p>
        </div>
        <div class="footer">
          <p>© 2024 Synter. Cross-channel advertising made simple.</p>
        </div>
      </div>
    </body>
    </html>
    `

    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Sign in to Synter',
      html
    })
  }
}
