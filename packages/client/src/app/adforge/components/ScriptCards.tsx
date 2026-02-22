import type { Script, AdSection } from './types'

interface Props {
  scripts: Script[]
  onApprove: (id: string) => void
}

const SECTION_COLORS: Record<AdSection, { color: string }> = {
  hook:         { color: '#f87171' },
  problem:      { color: '#fb923c' },
  solution:     { color: '#4ade80' },
  social_proof: { color: '#60a5fa' },
  cta:          { color: '#c084fc' },
}

const SECTION_LABELS: Record<AdSection, string> = {
  hook: 'Hook',
  problem: 'Problem',
  solution: 'Solution',
  social_proof: 'Social Proof',
  cta: 'CTA',
}

export function ScriptCards({ scripts, onApprove }: Props) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, justifyContent: 'center', maxWidth: 800 }}>
      {scripts.map((script) => {
        const { color } = SECTION_COLORS[script.section]
        const approved = script.status === 'approved'
        return (
          <div
            key={script._id}
            className="af-card"
            style={{
              width: 148, padding: 14, position: 'relative',
              border: `1px solid ${approved ? 'rgba(32,212,160,0.35)' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: approved ? '0 0 24px rgba(32,212,160,0.1)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {approved && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 16, height: 16, background: '#20d4a0',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#0b1a12', fontWeight: 800,
              }}>✓</div>
            )}
            {/* Section badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <div style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color }}>{SECTION_LABELS[script.section]}</span>
              <span style={{ marginLeft: 'auto', fontSize: 8, fontFamily: 'monospace', color: '#40405f' }}>{script.durationSeconds}s</span>
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.6, color: '#d0d0e8', marginBottom: 12, fontWeight: 400 }}>
              {script.copyText}
            </div>
            {!approved && (
              <button
                onClick={() => onApprove(script._id)}
                className="af-btn af-btn-ghost"
                style={{ width: '100%', justifyContent: 'center', fontSize: 9, padding: '5px 0' }}
              >
                Approve ✓
              </button>
            )}
          </div>
        )
      })}
      {scripts.length === 0 && (
        <div style={{ color: '#40405f', fontSize: 11 }}>Ask the copilot to generate scripts.</div>
      )}
    </div>
  )
}
