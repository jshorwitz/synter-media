// Authentication middleware and utilities for Settings panel
import { NextRequest } from 'next/server';
import { z } from 'zod';

export type Role = 'OWNER' | 'BILLING_ADMIN' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface RequestContext {
  userId: string;
  workspaceId: string;
  role: Role;
  email: string;
  name?: string;
}

export interface AuthenticatedRequest extends NextRequest {
  context: RequestContext;
}

// Mock authentication context for development
// In production, this would validate JWT tokens and sessions
export async function getRequestContext(request: NextRequest): Promise<RequestContext | null> {
  try {
    // Check for Authorization header
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('synter-session')?.value;
    
    if (!authHeader && !sessionCookie) {
      return null;
    }

    // For development, return mock context for sourcegraph.com
    // In production, validate JWT/session and get user data from database
    return {
      userId: 'user_1',
      workspaceId: 'workspace_sourcegraph',
      role: 'OWNER',
      email: 'admin@sourcegraph.com',
      name: 'Sourcegraph Admin'
    };
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const context = await getRequestContext(request);
    
    if (!context) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const authRequest = request as AuthenticatedRequest;
    authRequest.context = context;

    return handler(authRequest);
  };
}

export function requireRole(allowedRoles: Role[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<Response>) => {
    return requireAuth(async (request: AuthenticatedRequest): Promise<Response> => {
      if (!allowedRoles.includes(request.context.role)) {
        return new Response(
          JSON.stringify({ 
            error: 'Forbidden', 
            message: `Required role: ${allowedRoles.join(' or ')}` 
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return handler(request);
    });
  };
}

export const roleHierarchy: Record<Role, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  BILLING_ADMIN: 2,
  OWNER: 3,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  // Owner can manage all roles except cannot demote themselves
  if (actorRole === 'OWNER') {
    return true;
  }
  
  // Admin can manage Member and Viewer
  if (actorRole === 'ADMIN') {
    return ['MEMBER', 'VIEWER'].includes(targetRole);
  }
  
  // Other roles cannot manage roles
  return false;
}

// Validation schemas
export const roleSchema = z.enum(['OWNER', 'BILLING_ADMIN', 'ADMIN', 'MEMBER', 'VIEWER']);
export const userStatusSchema = z.enum(['ACTIVE', 'DISABLED']);

export const contextSchema = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  role: roleSchema,
  email: z.string().email(),
  name: z.string().optional(),
});
