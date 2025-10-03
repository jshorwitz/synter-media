import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TeamRole } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // TODO: Get current user ID from session
    const userId = 1; // Placeholder

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.id === userId) {
      return NextResponse.json(
        { error: 'Cannot invite yourself' },
        { status: 400 }
      );
    }

    // Check if already a team member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        user_id_email: {
          user_id: userId,
          email,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      );
    }

    // Check for existing pending invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        email,
        invited_by: userId,
        accepted_at: null,
        expires_at: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invite already sent to this email' },
        { status: 400 }
      );
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    // Create invite
    const invite = await prisma.teamInvite.create({
      data: {
        email,
        role: role as TeamRole,
        invited_by: userId,
        token,
        expires_at: expiresAt,
      },
    });

    // TODO: Send invite email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

    console.log(`Invite sent to ${email}: ${inviteUrl}`);

    return NextResponse.json({
      success: true,
      inviteUrl,
      message: 'Invite sent successfully',
    });
  } catch (error) {
    console.error('Team invite error:', error);
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    );
  }
}
