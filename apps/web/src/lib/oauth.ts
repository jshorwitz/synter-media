import { db } from '@/lib/db';
import { AuthService } from '@/lib/auth';
import { Role } from '@prisma/client';

const authService = new AuthService(process.env.JWT_SECRET!);

interface OAuthUserData {
  provider: string;
  providerId: string;
  email: string;
  name?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export async function handleOAuthCallback(userData: OAuthUserData) {
  try {
    // Check if OAuth account already exists
    let oauthAccount = await db.oAuthAccount.findUnique({
      where: {
        provider_provider_user_id: {
          provider: userData.provider,
          provider_user_id: userData.providerId,
        },
      },
      include: {
        user: true,
      },
    });

    let user;

    if (oauthAccount) {
      // User exists, update tokens if provided
      user = oauthAccount.user;
      
      if (userData.accessToken) {
        await db.oAuthAccount.update({
          where: { id: oauthAccount.id },
          data: {
            access_token: userData.accessToken,
            refresh_token: userData.refreshToken,
            expires_at: userData.expiresAt,
          },
        });
      }
    } else {
      // Check if user exists by email
      let existingUser = await db.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        // Link OAuth account to existing user
        user = existingUser;
        await db.oAuthAccount.create({
          data: {
            user_id: user.id,
            provider: userData.provider,
            provider_user_id: userData.providerId,
            access_token: userData.accessToken,
            refresh_token: userData.refreshToken,
            expires_at: userData.expiresAt,
          },
        });
      } else {
        // Create new user
        user = await db.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            role: Role.VIEWER, // Default role
            password_hash: null, // OAuth users don't have passwords
          },
        });

        // Create OAuth account
        await db.oAuthAccount.create({
          data: {
            user_id: user.id,
            provider: userData.provider,
            provider_user_id: userData.providerId,
            access_token: userData.accessToken,
            refresh_token: userData.refreshToken,
            expires_at: userData.expiresAt,
          },
        });
      }
    }

    // Create session
    const sessionToken = authService.generateSessionToken();
    const expiresAt = authService.getSessionExpiry();

    const session = await db.session.create({
      data: {
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt,
        user_agent: null, // Will be set by the calling function
        ip: null, // Will be set by the calling function
      },
    });

    return {
      user,
      sessionToken,
      session,
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw new Error('Failed to process OAuth callback');
  }
}

export async function createSessionCookie(sessionToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    name: 'synter_session',
    value: sessionToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    path: '/',
  };
}
