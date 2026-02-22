import type { VideoSegment, AdSection } from './types'

interface Props {
  segments: VideoSegment[]
}

const SECTION_LABELS: Record<AdSection, string> = {
  hook:         'Hook',
  problem:      'Problem',
  solution:     'Solution',
  social_proof: 'Social Proof',
  cta:          'CTA',
}

const SECTION_BACKGROUNDS: Record<AdSection, string> = {
  hook:         'linear-gradient(135deg, rgba(255,107,138,0.2), rgba(5,5,10,0.9))',
  problem:      'linear-gradient(135deg, rgba(251,146,60,0.2),  rgba(5,5,10,0.9))',
  solution:     'linear-gradient(135deg, rgba(0,255,163,0.15),  rgba(5,5,10,0.9))',
  social_proof: 'linear-gradient(135deg, rgba(0,195,255,0.15),  rgba(5,5,10,0.9))',
  cta:          'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(5,5,10,0.9))',
}

const SECTION_ORDER: AdSection[] = ['hook', 'problem', 'solution', 'social_proof', 'cta']

export function VideoProgress({ segments }: Props) {
  const sectionSegments = SECTION_ORDER.map((section) => {
    const segs = segments.filter((s) => s.section === section)
    const done = segs.filter((s) => s.status === 'generated' || s.status === 'approved').length
    const total = segs.length || 2
    const pct = Math.round((done / total) * 100)
    const allDone = done === total && total > 0
    return { section, pct, allDone }
  })

  return (
    <div style={{ width: 520, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sectionSegments.map(({ section, pct, allDone }) => (
        <div key={section} style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 14,
          backdropFilter: 'blur(8px)',
          transition: 'border-color 0.3s',
          ...(allDone ? { borderColor: 'rgba(0,255,163,0.2)' } : {}),
        }}>
          <div style={{
            width: 64, height: 38, borderRadius: 8,
            background: SECTION_BACKGROUNDS[section],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 7, fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-mono, monospace)',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {SECTION_LABELS[section]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: '#FAF8F5' }}>
              {SECTION_LABELS[section]} segment
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: allDone
                  ? '#00FFA3'
                  : `linear-gradient(90deg, #00FFA3 ${pct}%, rgba(0,255,163,0.4) 100%)`,
                width: `${pct}%`,
                transition: 'width 0.35s linear',
                boxShadow: allDone ? '0 0 8px rgba(0,255,163,0.5)' : 'none',
              }} />
            </div>
          </div>
          <div style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono, monospace)',
            color: allDone ? '#00FFA3' : '#8A8A93',
            minWidth: 48, textAlign: 'right',
            fontWeight: allDone ? 700 : 400,
            textShadow: allDone ? '0 0 8px rgba(0,255,163,0.5)' : 'none',
          }}>
            {allDone ? '✓ Done' : `${pct}%`}
          </div>
        </div>
      ))}
      {segments.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#3A3A50', fontSize: 11, padding: 24,
          fontFamily: 'var(--font-mono, monospace)',
        }}>
          Video generation will start here.
        </div>
      )}
    </div>
  )
}
