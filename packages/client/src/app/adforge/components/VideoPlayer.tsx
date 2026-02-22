'use client'

import { useState } from 'react'
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

export function VideoPlayer({ segments }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const ready = segments.filter((s) => s.videoUrl)
  const current = ready[activeIdx]

  return (
    <div style={{ width: 560 }}>
      {/* ── Player ── */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
        marginBottom: 12, position: 'relative',
      }}>
        {current?.videoUrl ? (
          <video
            key={current._id}
            src={current.videoUrl}
            autoPlay
            controls
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 14,
            background: 'linear-gradient(135deg, rgba(0,255,163,0.04), rgba(5,5,10,0.98) 50%, rgba(0,195,255,0.03))',
          }}>
            <div style={{
              width: 50, height: 50,
              background: 'rgba(0,255,163,0.08)',
              border: '1px solid rgba(0,255,163,0.15)',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#00FFA3',
            }}>
              ▶
            </div>
            <div style={{
              fontSize: 11, color: '#8A8A93',
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {segments.length === 0 ? 'No segments yet' : 'Videos generating...'}
            </div>
          </div>
        )}
      </div>

      {/* ── Segment thumbnails ── */}
      <div style={{ display: 'flex', gap: 6 }}>
        {ready.map((seg, i) => (
          <div
            key={seg._id}
            onClick={() => setActiveIdx(i)}
            style={{
              flex: 1, height: 38, borderRadius: 8,
              cursor: 'pointer',
              border: `2px solid ${activeIdx === i ? '#00FFA3' : 'rgba(255,255,255,0.07)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 700,
              color: activeIdx === i ? '#00FFA3' : 'rgba(255,255,255,0.35)',
              background: activeIdx === i ? 'rgba(0,255,163,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              fontFamily: 'var(--font-mono, monospace)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              boxShadow: activeIdx === i ? '0 0 12px rgba(0,255,163,0.2)' : 'none',
            }}
          >
            {SECTION_LABELS[seg.section]}
          </div>
        ))}
        {ready.length === 0 && (
          <div style={{
            flex: 1, textAlign: 'center',
            color: '#3A3A50', fontSize: 10, padding: 8,
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            Videos will appear here when ready
          </div>
        )}
      </div>
      <div style={{
        fontSize: 8,
        fontFamily: 'var(--font-mono, monospace)',
        color: '#2A2A3F',
        textAlign: 'center',
        marginTop: 6,
      }}>
        Click any segment to preview
      </div>
    </div>
  )
}
