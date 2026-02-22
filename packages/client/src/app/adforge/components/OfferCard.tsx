import type { Offer } from './types'

export function OfferCard({ offer }: { offer: Offer }) {
  const quadrants = [
    { label: 'Dream Outcome', icon: '◎', value: offer.dreamOutcome, accent: '#7c6df0' },
    { label: 'Perceived Likelihood', icon: '↑', value: offer.perceivedLikelihood, accent: '#20d4a0' },
    { label: 'Time Delay', icon: '⧗', value: offer.timeDelay, accent: '#60a5fa' },
    { label: 'Effort & Sacrifice', icon: '◇', value: offer.effortSacrifice, accent: '#c084fc' },
  ]

  return (
    <div className="af-card" style={{ padding: 28, width: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,109,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f0fa', letterSpacing: '-0.01em' }}>Value Equation</div>
          <div style={{ fontSize: 10, color: '#40405f', marginTop: 1 }}>Hormozi framework</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {quadrants.map(({ label, icon, value, accent }) => (
          <div key={label} style={{
            background: '#181828', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 11, padding: '14px 16px',
            borderLeft: `2px solid ${accent}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: accent }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#40405f' }}>{label}</span>
            </div>
            <div style={{ fontSize: 11, lineHeight: 1.55, color: '#d0d0e8' }}>{value}</div>
          </div>
        ))}
      </div>

      {offer.summary && (
        <div style={{
          textAlign: 'center' as const, padding: '12px 16px', fontSize: 11, lineHeight: 1.6,
          color: '#a097f7', background: 'rgba(124,109,240,0.06)',
          borderRadius: 9, border: '1px solid rgba(124,109,240,0.12)',
        }}>
          {offer.summary}
        </div>
      )}
    </div>
  )
}
