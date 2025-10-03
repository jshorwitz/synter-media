import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { captureServer } from '@/lib/posthog/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tracking_id, event, properties } = body;

    if (!tracking_id || !event) {
      return NextResponse.json(
        { error: 'tracking_id and event are required' },
        { status: 400 }
      );
    }

    // Extract user ID from tracking ID (format: syn_123_abc123)
    const userIdMatch = tracking_id.match(/^syn_(\d+)_/);
    const userId = userIdMatch ? parseInt(userIdMatch[1]) : null;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid tracking ID' },
        { status: 400 }
      );
    }

    // Capture attribution parameters from cookies
    const cookies = req.cookies;
    const attributionData = {
      gclid: cookies.get('synter_gclid')?.value,
      utm_source: cookies.get('synter_utm_source')?.value,
      utm_medium: cookies.get('synter_utm_medium')?.value,
      utm_campaign: cookies.get('synter_utm_campaign')?.value,
      utm_term: cookies.get('synter_utm_term')?.value,
      utm_content: cookies.get('synter_utm_content')?.value,
      landing_page: cookies.get('synter_landing_page')?.value,
    };

    // Save conversion to database
    await prisma.conversion.create({
      data: {
        user_id: `user_${userId}`,
        timestamp: new Date(),
        action: event,
        value: properties?.value ? parseFloat(properties.value) : null,
        currency: properties?.currency || 'USD',
      },
    });

    // Track in PostHog if configured
    await captureServer({
      distinctId: tracking_id,
      event: `conversion.${event}`,
      properties: {
        ...properties,
        ...attributionData,
        user_id: userId,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    );
  }
}
