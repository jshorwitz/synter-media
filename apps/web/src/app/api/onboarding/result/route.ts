import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Synter pricing (example - adjust based on your actual pricing)
const SYNTER_FLAT_FEE = 49900; // $499/mo in cents
const SYNTER_CREDITS_VALUE = 30000; // $300 worth of included credits

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const scanId = searchParams.get('scan_id');

    if (!scanId) {
      return NextResponse.json({ error: 'scan_id is required' }, { status: 400 });
    }

    const scan = await prisma.onboardingScan.findUnique({
      where: { scan_id: scanId },
      include: {
        platforms: true,
      },
    });

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    if (scan.status !== 'done') {
      return NextResponse.json({ error: 'Scan not complete' }, { status: 400 });
    }

    // Calculate total estimated spend
    const totalEstimatedSpend = scan.platforms.reduce(
      (sum, p) => sum + (p.detected ? p.estimated_spend : 0),
      0
    );

    // Calculate ROI
    const agencyFeeLow = Math.round(totalEstimatedSpend * 0.10); // 10%
    const agencyFeeHigh = Math.round(totalEstimatedSpend * 0.15); // 15%
    const synterEffectiveFee = Math.max(0, SYNTER_FLAT_FEE - SYNTER_CREDITS_VALUE);
    const savingsLow = Math.max(0, agencyFeeLow - synterEffectiveFee);
    const savingsHigh = Math.max(0, agencyFeeHigh - synterEffectiveFee);

    // Format platforms for response
    const platforms = scan.platforms.map((p) => ({
      platform: p.platform,
      detected: p.detected,
      confidence: p.confidence,
      tags: p.tags as string[],
      estimated_monthly_spend: p.estimated_spend,
    }));

    return NextResponse.json({
      scan_id: scanId,
      analysis: {
        domain: scan.domain,
        scanned_at: scan.created_at,
      },
      platforms,
      totals: {
        estimated_monthly_spend: totalEstimatedSpend,
        platforms_detected: platforms.filter((p) => p.detected).length,
      },
      roi: {
        agency_fee_low: agencyFeeLow,
        agency_fee_high: agencyFeeHigh,
        synter_flat_fee: SYNTER_FLAT_FEE,
        synter_credits_value: SYNTER_CREDITS_VALUE,
        synter_effective_fee: synterEffectiveFee,
        savings_low: savingsLow,
        savings_high: savingsHigh,
      },
    });
  } catch (error) {
    console.error('Result fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 });
  }
}
