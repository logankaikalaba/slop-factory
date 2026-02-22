import type { Script, AdSection } from './types'

interface Props {
  scripts: Script[]
  onApprove: (id: string) => void
}

const SECTION_COLORS: Record<AdSection, { color: string }> = {
  hook:         { color: '#FF6B8A' },
  problem:      { color: '#FB923C' },
  solution:     { color: '#00FFA3' },
  social_proof: { color: '#00C3FF' },
  cta:          { color: '#A78BFA' },
}

const SECTION_LABELS: Record<AdSection, string> = {
  hook:         'Hook',
  problem:      'Problem',
  solution:     'Solution',
  social_proof: 'Social Proof',
  cta:          'CTA',
}

export function ScriptCards({ scripts, onApprove }: Props) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, justifyContent: 'center', maxWidth: 820 }}>
      {scripts.map((script) => {
        const { color } = SECTION_COLORS[script.section]
        const approved = script.status === 'approved'
        return (
          <div
            key={script._id}
            className="af-card"
            style={{
              width: 152, padding: 14, position: 'relative',
              border: approved
                ? '1px solid rgba(0,255,163,0.3)'
                : '1px solid rgba(255,255,255,0.07)',
              boxShadow: approved ? '0 0 24px rgba(0,255,163,0.08)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {approved && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 16, height: 16,
                background: '#00FFA3',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: '#020A06', fontWeight: 800,
                boxShadow: '0 0 8px rgba(0,255,163,0.5)',
              }}>
                ✓
              </div>
            )}
            {/* Section badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 9 }}>
              <div style={{ width: 2, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{
                fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const,
                letterSpacing: '0.07em', color,
                fontFamily: 'var(--font-mono, monospace)',
              }}>
                {SECTION_LABELS[script.section]}
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: 8,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#3A3A50',
              }}>
                {script.durationSeconds}s
              </span>
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.65, color: '#D0D0E8', marginBottom: 12 }}>
              {script.copyText}
            </div>
            {!approved && (
              <button
                onClick={() => onApprove(script._id)}
                className="af-btn af-btn-ghost"
                style={{ width: '100%', justifyContent: 'center', fontSize: 9, padding: '5px 0', borderRadius: 8 }}
              >
                Approve ✓
              </button>
            )}
          </div>
        )
      })}
      {scripts.length === 0 && (
        <div style={{
          color: '#3A3A50', fontSize: 11,
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          Ask the copilot to generate scripts.
        </div>
      )}
    </div>
  )
}
