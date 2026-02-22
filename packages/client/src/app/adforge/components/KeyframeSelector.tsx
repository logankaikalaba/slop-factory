'use client'

import type { Keyframe, AdSection } from './types'

interface Props {
  section: AdSection
  position: 'start' | 'middle' | 'end'
  keyframes: Keyframe[]
  onSelect: (keyframeId: string) => void
  completedCount: number
  totalCount: number
  transitionPrompt?: string
  onEditTransition?: (text: string) => void
}

const SECTION_LABELS: Record<AdSection, string> = {
  hook:         'Hook',
  problem:      'Problem',
  solution:     'Solution',
  social_proof: 'Social Proof',
  cta:          'CTA',
}

const ALL_SECTIONS: AdSection[] = ['hook', 'problem', 'solution', 'social_proof', 'cta']

const GRADIENT_BG = [
  'linear-gradient(135deg, rgba(0,255,163,0.15), rgba(5,5,10,0.95))',
  'linear-gradient(135deg, rgba(0,195,255,0.15), rgba(5,5,10,0.95))',
  'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(5,5,10,0.95))',
  'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(5,5,10,0.95))',
]

export function KeyframeSelector({
  section,
  position,
  keyframes,
  onSelect,
  completedCount,
  totalCount,
  transitionPrompt,
  onEditTransition,
}: Props) {
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const currentSectionIdx = ALL_SECTIONS.indexOf(section)

  return (
    <div style={{ width: 600 }}>
      {/* ── Progress ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: '#00FFA3',
            letterSpacing: '-0.01em',
          }}>
            {SECTION_LABELS[section]}{' '}
            <span style={{ color: '#3A3A50', fontWeight: 400 }}>/ {position}</span>
          </span>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono, monospace)',
            color: '#3A3A50',
          }}>
            {completedCount} / {totalCount}
          </span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #00FFA3, #00C3FF)',
            width: `${pct}%`,
            transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: '0 0 8px rgba(0,255,163,0.4)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {ALL_SECTIONS.map((s, i) => (
            <span key={s} style={{
              fontSize: 7, fontWeight: 700,
              textTransform: 'uppercase' as const, letterSpacing: '0.08em',
              color: i < currentSectionIdx ? '#00C3FF' : i === currentSectionIdx ? '#00FFA3' : '#2A2A3F',
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {SECTION_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        textAlign: 'center' as const, fontSize: 11,
        color: '#8A8A93', marginBottom: 16,
      }}>
        Select <strong style={{ color: '#FAF8F5' }}>{position}</strong> keyframe for{' '}
        <strong style={{ color: '#FAF8F5' }}>{SECTION_LABELS[section]}</strong>
      </div>

      {/* ── Options grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {keyframes.map((kf) => {
          const isGenerating = kf.status === 'generating'
          const isSelected   = kf.status === 'selected'
          const isRejected   = kf.status === 'rejected'
          return (
            <div
              key={kf._id}
              onClick={() => !isGenerating && !isRejected && onSelect(kf._id)}
              style={{
                height: 120, borderRadius: 14, position: 'relative', overflow: 'hidden',
                cursor: isGenerating ? 'wait' : isRejected ? 'default' : 'pointer',
                opacity: isRejected ? 0.18 : 1,
                border: `2px solid ${isSelected ? '#00FFA3' : 'rgba(255,255,255,0.07)'}`,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: isSelected ? '0 0 24px rgba(0,255,163,0.2), 0 0 48px rgba(0,255,163,0.08)' : 'none',
              }}
            >
              {kf.imageUrl ? (
                <img
                  src={kf.imageUrl}
                  alt={`Option ${kf.variantIndex + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: GRADIENT_BG[kf.variantIndex % 4],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isGenerating
                    ? <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}>Generating...</span>
                    : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono, monospace)' }}>{kf.variantIndex + 1}</span>
                  }
                </div>
              )}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 22, height: 22, background: '#00FFA3',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#020A06', fontWeight: 800, zIndex: 2,
                  boxShadow: '0 0 10px rgba(0,255,163,0.5)',
                }}>
                  ✓
                </div>
              )}
            </div>
          )
        })}
        {keyframes.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center' as const,
            color: '#3A3A50', fontSize: 11, padding: 24,
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            Ask the copilot to generate keyframe options.
          </div>
        )}
      </div>

      {/* ── Transition prompt ── */}
      {transitionPrompt && (
        <div className="af-card" style={{ padding: 14, marginTop: 14 }}>
          <label className="af-label" style={{ marginBottom: 7 }}>✏️ Transition Prompt</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onEditTransition?.(e.currentTarget.textContent ?? '')}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '9px 12px',
              fontSize: 10, color: '#D0D0E8', lineHeight: 1.65,
              fontFamily: 'var(--font-mono, monospace)',
              outline: 'none',
            }}
          >
            {transitionPrompt}
          </div>
          <div style={{
            fontSize: 8, color: '#00FFA3', marginTop: 5,
            fontStyle: 'italic' as const,
            fontFamily: 'var(--font-mono, monospace)',
            opacity: 0.6,
          }}>
            Click to edit before generation
          </div>
        </div>
      )}
    </div>
  )
}
