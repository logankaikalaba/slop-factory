import type { Avatar } from './types'

export function AvatarBriefCard({ avatar }: { avatar: Avatar }) {
  const fields = [
    { label: 'Demographics', value: `${avatar.demographics.age}, ${avatar.demographics.income}, ${avatar.demographics.location}` },
    { label: 'Psychographics', value: avatar.psychographics.worldview },
    { label: 'Core Pain', value: avatar.painPoints.slice(0, 2).join('; ') },
    { label: 'Failed Solutions', value: avatar.failedSolutions.slice(0, 2).join(', ') },
    { label: 'Language', value: `"${avatar.languagePatterns[0] ?? ''}"` },
    { label: 'Objections', value: avatar.objections.slice(0, 2).join(' / ') },
    { label: 'Trigger Event', value: avatar.triggerEvents[0] ?? '' },
    { label: 'Aspirations', value: avatar.aspirations.slice(0, 2).join(', ') },
    { label: 'Worldview', value: `"${avatar.worldview}"` },
  ]

  return (
    <div className="af-card" style={{ padding: 28, width: 540 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(32,212,160,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🧠</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f0fa', letterSpacing: '-0.01em' }}>&ldquo;{avatar.name}&rdquo;</div>
          <div style={{ fontSize: 10, color: '#40405f', marginTop: 1 }}>Avatar brief</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {fields.map(({ label, value }) => (
          <div key={label} style={{ background: '#181828', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, padding: '11px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#40405f', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 10, lineHeight: 1.5, color: '#d0d0e8' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
