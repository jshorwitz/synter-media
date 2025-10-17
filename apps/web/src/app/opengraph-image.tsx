import { ImageResponse } from 'next/og';

export const alt = 'Synter - AI Media Agent for Cross-Channel Ads';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OGImage() {
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
          background: '#0B0E12',
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(77, 214, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(156, 255, 90, 0.15) 0%, transparent 50%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #3EE08F 0%, #4DD6FF 100%)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3EE08F 0%, #4DD6FF 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Synter
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 2,
                color: '#8B94A3',
              }}
            >
              AI MEDIA AGENT
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            textAlign: 'center',
            color: '#E6E9EF',
            maxWidth: 900,
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          AI Media Agent for Cross-Channel Ads
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 28,
            color: '#B8C0CC',
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Stop paying 10% agency fees. Let AI optimize your campaigns.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
