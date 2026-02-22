import type { Conversation } from './types'

interface Props {
  conversation: Conversation
}

export function ExportCard({ conversation }: Props) {
  const duration = conversation.storyboard?.totalDuration ?? 60

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 74, height: 74, margin: '0 auto 22px',
        background: 'linear-gradient(135deg, #00FFA3, #00C3FF)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
        boxShadow: '0 0 32px rgba(0,255,163,0.35), 0 0 64px rgba(0,195,255,0.15)',
      }}>
        ⬇
      </div>
      <h2 style={{
        fontSize: 20, fontWeight: 800, marginBottom: 6,
        color: '#FAF8F5', letterSpacing: '-0.03em',
      }}>
        Your Ad Is Ready
      </h2>
      <p style={{ color: '#8A8A93', fontSize: 12, marginBottom: 24 }}>
        {duration}s {conversation.adFormat === 'ugc' ? 'UGC Ad' : 'Story Movie Ad'}
      </p>
      <button
        className="af-btn af-btn-primary"
        style={{ fontSize: 13, padding: '12px 32px', borderRadius: 14, margin: '0 auto' }}
        onClick={() => alert('FFmpeg stitching coming in v2! Download segments individually from the Review phase.')}
      >
        ⬇ Export MP4
      </button>
      <div style={{ marginTop: 20, display: 'flex', gap: 20, justifyContent: 'center' }}>
        {['1080p', `${duration}s`, '5 seg', '15 kf'].map((label) => (
          <div key={label} style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono, monospace)',
            color: '#3A3A50',
            padding: '4px 10px',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 6,
          }}>
            <span style={{ color: '#FAF8F5', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
