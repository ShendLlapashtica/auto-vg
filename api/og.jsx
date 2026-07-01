import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(145deg, #060612 0%, #0a0a1f 50%, #060a1c 100%)',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow circles */}
        <div style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(91,134,229,0.12) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '200px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(188,78,156,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Top: Logo + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '80px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-2px', fontFamily: 'monospace' }}>
              X
            </span>
            <span style={{ fontSize: '80px', fontWeight: 900, color: '#3b82f6', letterSpacing: '-2px', fontFamily: 'monospace' }}>
              K
            </span>
            <span style={{ fontSize: '80px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-2px', fontFamily: 'monospace' }}>
              OR
            </span>
          </div>

          {/* Accent line */}
          <div style={{
            width: '80px', height: '3px', borderRadius: '2px',
            background: 'linear-gradient(90deg, #5b86e5, #bc4e9c)',
            display: 'flex',
          }} />

          <div style={{ fontSize: '26px', color: '#64748b', marginTop: '4px', fontWeight: 400, letterSpacing: '0.2px' }}>
            nga WEBORA.KS
          </div>
        </div>

        {/* Middle: Main value prop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '44px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Makina Koreane
          </div>
          <div style={{ fontSize: '44px', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px', display: 'flex', gap: '12px' }}>
            <span style={{ color: '#f1f5f9' }}>për</span>
            <span style={{ color: '#3b82f6' }}>Shqipëri</span>
            <span style={{ color: '#94a3b8' }}>&</span>
            <span style={{ color: '#60a5fa' }}>Kosovë</span>
          </div>
          <div style={{ fontSize: '22px', color: '#475569', marginTop: '4px', fontWeight: 400 }}>
            🇰🇷 → 🇦🇱 🇽🇰  ·  Çmim all-in · Inspektim Encar · Dorëzim 30–45 ditë
          </div>
        </div>

        {/* Bottom: Stats */}
        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '42px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-1px', fontFamily: 'monospace' }}>200,000+</span>
            <span style={{ fontSize: '16px', color: '#475569', fontWeight: 500 }}>listëzime live · drejtpërdrejt nga Encar</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '18px', color: '#334155', fontWeight: 600 }}>xkor.vercel.app</span>
            <span style={{ fontSize: '14px', color: '#1e3a5f', fontWeight: 400 }}>+383 49 644 168</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
