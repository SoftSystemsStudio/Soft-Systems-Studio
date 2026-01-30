import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Never Miss Another $400 Job Again';
    const subtitle = searchParams.get('subtitle') || 'AI Receptionist for Local Service Businesses';

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          padding: '40px 80px',
        }}
      >
        {/* Background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(132, 204, 22, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Logo placeholder - SS initials */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#9CA3AF',
              letterSpacing: '-0.05em',
            }}
          >
            SOFT SYSTEMS
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginBottom: '16px',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '32px',
              color: '#84CC16',
              marginTop: '16px',
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            color: '#6B7280',
            fontSize: '24px',
          }}
        >
          <span>24/7 AI Phone Answering</span>
          <span style={{ color: '#374151' }}>•</span>
          <span>Bilingual Support</span>
          <span style={{ color: '#374151' }}>•</span>
          <span>30-Day Guarantee</span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error('OG Image generation failed:', e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
