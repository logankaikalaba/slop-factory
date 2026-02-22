import type { Offer } from './types'

export function OfferCard({ offer }: { offer: Offer }) {
  const quadrants = [
    { label: 'Dream Outcome',       icon: '◎', value: offer.dreamOutcome,        accent: '#00FFA3' },
    { label: 'Perceived Likelihood', icon: '↑', value: offer.perceivedLikelihood, accent: '#00C3FF' },
    { label: 'Time Delay',           icon: '⧗', value: offer.timeDelay,           accent: '#A78BFA' },
    { label: 'Effort & Sacrifice',   icon: '◇', value: offer.effortSacrifice,     accent: '#F472B6' },
  ]

  return (
    <div className="af-card" style={{ padding: 28, width: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(0,255,163,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          border: '1px solid rgba(0,255,163,0.15)',
        }}>
          📦
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#FAF8F5', letterSpacing: '-0.01em' }}>
            Value Equation
          </div>
          <div style={{ fontSize: 9, color: '#3A3A50', marginTop: 2, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Hormozi Framework
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {quadrants.map(({ label, icon, value, accent }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
            padding: '14px 16px',
            borderLeft: `2px solid ${accent}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: accent, textShadow: `0 0 8px ${accent}66` }}>{icon}</span>
              <span style={{
                fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const,
                letterSpacing: '0.08em', color: '#3A3A50',
                fontFamily: 'var(--font-mono, monospace)',
              }}>
                {label}
              </span>
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.6, color: '#D0D0E8' }}>{value}</div>
          </div>
        ))}
      </div>

      {offer.summary && (
        <div style={{
          textAlign: 'center' as const, padding: '12px 16px',
          fontSize: 11, lineHeight: 1.65,
          color: '#33FFBA',
          background: 'rgba(0,255,163,0.05)',
          borderRadius: 12,
          border: '1px solid rgba(0,255,163,0.1)',
        }}>
          {offer.summary}
        </div>
      )}
    </div>
  )
}
