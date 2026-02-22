import type { Avatar } from './types'

export function AvatarBriefCard({ avatar }: { avatar: Avatar }) {
  const fields = [
    { label: 'Demographics',    value: `${avatar.demographics.age}, ${avatar.demographics.income}, ${avatar.demographics.location}` },
    { label: 'Psychographics',  value: avatar.psychographics.worldview },
    { label: 'Core Pain',       value: avatar.painPoints.slice(0, 2).join('; ') },
    { label: 'Failed Solutions', value: avatar.failedSolutions.slice(0, 2).join(', ') },
    { label: 'Language',        value: `"${avatar.languagePatterns[0] ?? ''}"` },
    { label: 'Objections',      value: avatar.objections.slice(0, 2).join(' / ') },
    { label: 'Trigger Event',   value: avatar.triggerEvents[0] ?? '' },
    { label: 'Aspirations',     value: avatar.aspirations.slice(0, 2).join(', ') },
    { label: 'Worldview',       value: `"${avatar.worldview}"` },
  ]

  return (
    <div className="af-card" style={{ padding: 28, width: 540 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: 'rgba(0,195,255,0.1)',
          border: '1px solid rgba(0,195,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>
          🧠
        </div>
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: '#FAF8F5', letterSpacing: '-0.02em',
          }}>
            &ldquo;{avatar.name}&rdquo;
          </div>
          <div style={{
            fontSize: 9, color: '#3A3A50', marginTop: 2,
            fontFamily: 'var(--font-mono, monospace)',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
            Avatar brief
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {fields.map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '12px 13px',
          }}>
            <div style={{
              fontSize: 7, fontWeight: 700, textTransform: 'uppercase' as const,
              letterSpacing: '0.08em', color: '#3A3A50', marginBottom: 5,
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {label}
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.6, color: '#D0D0E8' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
