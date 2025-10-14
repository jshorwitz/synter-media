import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scanId = searchParams.get('scan_id');

    if (!scanId) {
      return NextResponse.json({ error: 'scan_id is required' }, { status: 400 });
    }

    const scan = await prisma.onboardingScan.findUnique({
      where: { scan_id: scanId },
      select: {
        status: true,
        progress: true,
        error: true,
      },
    });

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: scan.status,
      progress: scan.progress,
      error: scan.error,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
