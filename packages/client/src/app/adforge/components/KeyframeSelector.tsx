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
  hook: 'Hook',
  problem: 'Problem',
  solution: 'Solution',
  social_proof: 'Social Proof',
  cta: 'CTA',
}

const ALL_SECTIONS: AdSection[] = ['hook', 'problem', 'solution', 'social_proof', 'cta']

const GRADIENT_BG = [
  'linear-gradient(135deg,#2d1b69,#1a1a2e)',
  'linear-gradient(135deg,#1b3069,#1a2e2e)',
  'linear-gradient(135deg,#1b4a3a,#1a2e1a)',
  'linear-gradient(135deg,#3a1b2a,#2e1a1a)',
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
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#a097f7', letterSpacing: '-0.01em' }}>
            {SECTION_LABELS[section]} <span style={{ color: '#40405f', fontWeight: 400 }}>/ {position}</span>
          </span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#40405f' }}>
            {completedCount} / {totalCount}
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#7c6df0,#20d4a0)', width: `${pct}%`, transition: 'width 0.45s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {ALL_SECTIONS.map((s, i) => (
            <span key={s} style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: i < currentSectionIdx ? '#20d4a0' : i === currentSectionIdx ? '#a097f7' : '#282840' }}>
              {SECTION_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center' as const, fontSize: 11, color: '#8888aa', marginBottom: 14 }}>
        Select <strong style={{ color: '#f0f0fa' }}>{position}</strong> keyframe for <strong style={{ color: '#f0f0fa' }}>{SECTION_LABELS[section]}</strong>
      </div>

      {/* ── Options grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {keyframes.map((kf) => {
          const isGenerating = kf.status === 'generating'
          const isSelected = kf.status === 'selected'
          const isRejected = kf.status === 'rejected'
          return (
            <div
              key={kf._id}
              onClick={() => !isGenerating && !isRejected && onSelect(kf._id)}
              style={{
                height: 120, borderRadius: 12, position: 'relative', overflow: 'hidden',
                cursor: isGenerating ? 'wait' : isRejected ? 'default' : 'pointer',
                opacity: isRejected ? 0.18 : 1,
                border: `2px solid ${isSelected ? '#20d4a0' : 'rgba(255,255,255,0.08)'}`,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: isSelected ? '0 0 24px rgba(32,212,160,0.2)' : 'none',
              }}
            >
              {kf.imageUrl ? (
                <img src={kf.imageUrl} alt={`Option ${kf.variantIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: GRADIENT_BG[kf.variantIndex % 4], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isGenerating
                    ? <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>Generating...</span>
                    : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 20, fontWeight: 800 }}>{kf.variantIndex + 1}</span>
                  }
                </div>
              )}
              {isSelected && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, background: '#20d4a0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#0b1a12', fontWeight: 800, zIndex: 2 }}>✓</div>
              )}
            </div>
          )
        })}
        {keyframes.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center' as const, color: '#40405f', fontSize: 11, padding: 24 }}>
            Ask the copilot to generate keyframe options.
          </div>
        )}
      </div>

      {/* ── Transition prompt ── */}
      {transitionPrompt && (
        <div className="af-card" style={{ padding: 14, marginTop: 12 }}>
          <label className="af-label" style={{ marginBottom: 6 }}>✏️ Transition prompt</label>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onEditTransition?.(e.currentTarget.textContent ?? '')}
            style={{ background: '#0b0b14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 10px', fontSize: 10, color: '#d0d0e8', lineHeight: 1.55, fontFamily: 'monospace', outline: 'none' }}
          >
            {transitionPrompt}
          </div>
          <div style={{ fontSize: 8, color: '#7c6df0', marginTop: 4, fontStyle: 'italic' as const }}>Click to edit before generation</div>
        </div>
      )}
    </div>
  )
}
