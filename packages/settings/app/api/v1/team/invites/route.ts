// Team invite management - POST (send invites) and GET (list pending)
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRole, roleSchema } from '../../../../../lib/auth';
import { db, generateToken } from '../../../../../lib/db';

const inviteSchema = z.object({
  invites: z.array(z.object({
    email: z.string().email(),
    role: roleSchema,
  })).min(1).max(50), // Allow bulk invites up to 50
  message: z.string().optional(),
});

export const POST = requireRole(['OWNER', 'ADMIN'])(async (request) => {
  const { workspaceId, userId, role: actorRole } = request.context;

  try {
    const body = await request.json();
    const data = inviteSchema.parse(body);

    const results = [];
    const duplicates = [];

    for (const invite of data.invites) {
      // Check if user already exists
      const existingUser = await db.user.findFirst({
        where: {
          email: invite.email,
          workspaceId,
        },
      });

      if (existingUser) {
        duplicates.push({
          email: invite.email,
          reason: 'User already exists in workspace',
          suggestion: 'Update their role instead',
        });
        continue;
      }

      // Check role permissions
      if (actorRole === 'ADMIN' && ['OWNER', 'BILLING_ADMIN'].includes(invite.role)) {
        duplicates.push({
          email: invite.email,
          reason: 'Insufficient permissions to assign this role',
          suggestion: 'Contact workspace owner',
        });
        continue;
      }

      // Check for existing pending invite
      const existingInvite = await db.invite.findFirst({
        where: {
          email: invite.email,
          workspaceId,
          status: 'PENDING',
        },
      });

      if (existingInvite) {
        // Update existing invite
        const updatedInvite = await db.invite.update({
          where: { id: existingInvite.id },
          data: {
            role: invite.role,
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          },
        });

        results.push({
          email: invite.email,
          role: invite.role,
          status: 'PENDING',
          inviteId: updatedInvite.id,
          action: 'updated',
        });
      } else {
        // Create new invite
        const newInvite = await db.invite.create({
          data: {
            workspaceId,
            email: invite.email,
            role: invite.role,
            token: generateToken(),
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
            message: data.message,
          },
        });

        results.push({
          email: invite.email,
          role: invite.role,
          status: 'PENDING',
          inviteId: newInvite.id,
          action: 'created',
        });

        // TODO: Send invite email
        // await sendInviteEmail(invite.email, newInvite.token, data.message);
      }

      // TODO: Create audit event
      // await createAuditEvent(workspaceId, userId, 'team.invite_sent', ...)
    }

    return new Response(
      JSON.stringify({
        invites: results,
        duplicates,
        total: results.length,
        duplicateCount: duplicates.length,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Failed to send invites:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to send invites' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

export const GET = requireAuth(async (request) => {
  const { workspaceId } = request.context;

  try {
    const invites = await db.invite.findMany({
      where: { 
        workspaceId,
        status: 'PENDING',
        expiresAt: { gt: new Date() }, // Only non-expired
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(invites), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Failed to get invites:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get pending invites' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
