import type { Conversation, Offer, Avatar, AdSection } from './types'

interface Props {
  conversation: Conversation
  offer: Offer | null
  avatar: Avatar | null
}

const SECTIONS: Array<{ key: AdSection; label: string }> = [
  { key: 'hook',         label: 'Hook' },
  { key: 'problem',      label: 'Problem' },
  { key: 'solution',     label: 'Solution' },
  { key: 'social_proof', label: 'Social Proof' },
  { key: 'cta',          label: 'CTA' },
]

export function BriefCard({ conversation, offer, avatar }: Props) {
  const rows = [
    { label: 'Offer',    value: offer?.name ?? offer?.productName ?? '—' },
    { label: 'Avatar',   value: avatar?.name ?? '—' },
    { label: 'Format',   value: conversation.adFormat === 'ugc' ? 'UGC Ad' : 'Story Movie Ad' },
    { label: 'Sections', value: 'Hook · Problem · Solution · Proof · CTA' },
    ...SECTIONS.map((s) => ({
      label: s.label,
      value: `${conversation.durationAllocation[s.key]}s`,
    })),
  ]

  return (
    <div style={{
      background: 'rgba(12, 12, 22, 0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20, padding: 28, width: 440,
      backdropFilter: 'blur(16px)',
    }}>
      <h3 style={{
        fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em',
        color: '#00FFA3', marginBottom: 20,
        fontFamily: 'var(--font-mono, monospace)', fontWeight: 700,
      }}>
        📋 Campaign Brief
      </h3>
      {rows.map(({ label, value }, i) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontSize: 11,
          ...(i === rows.length - 1 ? { borderBottom: 'none' } : {}),
        }}>
          <span style={{
            color: '#3A3A50',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {label}
          </span>
          <span style={{ fontWeight: 600, color: '#FAF8F5', textAlign: 'right', maxWidth: 260 }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}
