import type { Conversation, AdSection } from './types'

interface Props {
  storyboard: NonNullable<Conversation['storyboard']>
}

const SECTION_STYLES: Record<AdSection, { bg: string; color: string; label: string }> = {
  hook:         { bg: 'rgba(255,107,138,0.12)', color: '#FF6B8A', label: 'Hook' },
  problem:      { bg: 'rgba(251,146,60,0.12)',  color: '#FB923C', label: 'Problem' },
  solution:     { bg: 'rgba(0,255,163,0.10)',   color: '#00FFA3', label: 'Solution' },
  social_proof: { bg: 'rgba(0,195,255,0.10)',   color: '#00C3FF', label: 'Social Proof' },
  cta:          { bg: 'rgba(167,139,250,0.12)', color: '#A78BFA', label: 'CTA' },
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function StoryboardView({ storyboard }: Props) {
  return (
    <div style={{ width: 640, maxHeight: 'calc(100vh - 130px)', overflowY: 'auto' }}>
      <div style={{
        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#3A3A50',
        marginBottom: 16,
        fontFamily: 'var(--font-mono, monospace)',
      }}>
        📽️ Full Storyboard — {storyboard.sections.length * 3} Keyframes
      </div>
      {storyboard.sections.map((section) => {
        const style = SECTION_STYLES[section.section as AdSection]
        const kfs = [
          { label: 'Start',  url: section.keyframes.start.imageUrl },
          { label: 'Middle', url: section.keyframes.middle.imageUrl },
          { label: 'End',    url: section.keyframes.end.imageUrl },
        ]

        return (
          <div key={section.section} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14, padding: 14, marginBottom: 10,
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: 8, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '3px 9px', borderRadius: 6,
                background: style.bg, color: style.color,
                fontFamily: 'var(--font-mono, monospace)',
              }}>
                {style.label}
              </span>
              <span style={{
                fontSize: 9,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#3A3A50',
              }}>
                {formatTime(section.startTime)} — {formatTime(section.endTime)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {kfs.map(({ label, url }) => (
                <div key={label} style={{
                  flex: 1, height: 50, borderRadius: 8,
                  overflow: 'hidden', position: 'relative',
                }}>
                  {url ? (
                    <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'flex-start',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 8,
                    }}>
                      <span style={{
                        fontSize: 7, fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.2)',
                        padding: '4px 6px',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}>
                        {label}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono, monospace)',
              color: '#8A8A93',
              lineHeight: 1.5,
              paddingTop: 6,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              → {section.transitions.startToMiddle.text || section.transitions.middleToEnd.text || section.dialogue}
            </div>
          </div>
        )
      })}
    </div>
  )
}
