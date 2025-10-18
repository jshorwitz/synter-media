import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getWaitlistPositionByEmail } from '@/lib/waitlist';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');

    console.log('OG Image request for code:', code);

    if (!code) {
      console.error('No code provided');
      return new Response('Missing code parameter', { status: 400 });
    }

    // Find user by referral code
    const lead = await db.waitlistLead.findFirst({
      where: { referral_code: code },
    });

    console.log('Found lead:', lead?.id, lead?.email);

    if (!lead || !lead.email) {
      console.error('Lead not found for code:', code);
      return new Response('Invalid code', { status: 404 });
    }

    // Get position
    const positionData = await getWaitlistPositionByEmail(lead.email);
    
    console.log('Position data:', positionData);

    if (!positionData || !positionData.position || !positionData.total) {
      console.error('Position data incomplete:', positionData);
      return new Response('Position not found', { status: 404 });
    }

    const { position, total, referralCode, referralsCount } = positionData;

    // Generate gradient based on position
    const hue = (position * 137.5) % 360;
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, hsl(${hue}, 70%, 15%) 0%, hsl(${(hue + 60) % 360}, 60%, 10%) 100%)`,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              borderRadius: '999px',
              border: '2px solid rgba(77, 214, 255, 0.3)',
              background: 'rgba(77, 214, 255, 0.1)',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '999px',
                background: '#4DD6FF',
              }}
            />
            <div
              style={{
                fontSize: '20px',
                color: '#4DD6FF',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Synter Waitlist
            </div>
          </div>

          {/* Position Number */}
          <div
            style={{
              fontSize: '180px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #4DD6FF 0%, #9CFF5A 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '24px',
              textShadow: '0 4px 40px rgba(77, 214, 255, 0.3)',
            }}
          >
            #{position}
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '48px',
            }}
          >
            of {total.toLocaleString()} waiting
          </div>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '32px 48px',
              borderRadius: '16px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(11, 14, 18, 0.6)',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: 'white',
                fontWeight: 600,
              }}
            >
              Help me jump the line
            </div>
            <div
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Each invite = 7 spots 🚀
            </div>
          </div>

          {/* Referral stats */}
          {referralsCount > 0 && (
            <div
              style={{
                marginTop: '32px',
                fontSize: '24px',
                color: '#9CFF5A',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div>🎯</div>
              <div>{referralsCount} referrals • {referralsCount * 7} spots gained</div>
            </div>
          )}

          {/* URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'monospace',
            }}
          >
            syntermedia.ai/r/{code}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
