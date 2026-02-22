import type { CanvasState, Phase } from './types'
import { OfferCard } from './OfferCard'
import { AvatarBriefCard } from './AvatarBriefCard'
import { BriefCard } from './BriefCard'
import { ScriptCards } from './ScriptCards'
import { ConsistencyLock } from './ConsistencyLock'
import { KeyframeSelector } from './KeyframeSelector'
import { StoryboardView } from './StoryboardView'
import { VideoProgress } from './VideoProgress'
import { VideoPlayer } from './VideoPlayer'
import { ExportCard } from './ExportCard'

interface Props {
  phase: Phase
  canvas: CanvasState
  currentKfSection?: string
  currentKfPosition?: string
  onApproveScript: (id: string) => void
  onSelectKeyframe: (id: string) => void
  onLockConsistency: () => void
}

export function Canvas({
  phase,
  canvas,
  currentKfSection,
  currentKfPosition,
  onApproveScript,
  onSelectKeyframe,
  onLockConsistency,
}: Props) {
  const { offer, avatar, scripts, keyframes, transitions, segments, conversation } = canvas

  const renderContent = () => {
    if (phase === 0) {
      if (offer) return <OfferCard offer={offer} />
      if (avatar) return <AvatarBriefCard avatar={avatar} />
      return (
        <div style={{
          textAlign: 'center' as const,
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 20,
        }}>
          <div
            className="af-icon-pulse"
            style={{ fontSize: 60, lineHeight: 1 }}
            aria-hidden="true"
          >
            ⚡
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{
              fontSize: 15, fontWeight: 700, color: '#FAF8F5',
              letterSpacing: '-0.03em',
            }}>
              Ready to forge.
            </div>
            <div style={{ fontSize: 12, color: '#3A3A50', lineHeight: 1.7, maxWidth: 280 }}>
              Create or select an offer and avatar<br />to begin your campaign.
            </div>
          </div>
        </div>
      )
    }

    if (phase === 1 && conversation) {
      return <BriefCard conversation={conversation} offer={offer} avatar={avatar} />
    }

    if (phase === 2) {
      return <ScriptCards scripts={scripts} onApprove={onApproveScript} />
    }

    if (phase === 3 && conversation?.consistencySpec) {
      return (
        <ConsistencyLock
          consistencySpec={conversation.consistencySpec}
          onLock={onLockConsistency}
        />
      )
    }

    if (phase === 4) {
      const section = (currentKfSection ?? 'hook') as any
      const position = (currentKfPosition ?? 'start') as 'start' | 'middle' | 'end'
      const currentKfs = keyframes.filter(
        (kf) => kf.section === section && kf.position === position,
      )
      const transition = transitions.find(
        (t) =>
          t.section === section &&
          t.fromPosition === (position === 'end' ? 'middle' : 'start'),
      )
      const selectedCount = keyframes.filter((kf) => kf.status === 'selected').length

      return (
        <KeyframeSelector
          section={section}
          position={position}
          keyframes={currentKfs}
          onSelect={onSelectKeyframe}
          completedCount={selectedCount}
          totalCount={15}
          transitionPrompt={transition?.promptText}
        />
      )
    }

    if (phase === 5 && conversation?.storyboard) {
      return <StoryboardView storyboard={conversation.storyboard} />
    }

    if (phase === 6) {
      return <VideoProgress segments={segments} />
    }

    if (phase === 7) {
      return <VideoPlayer segments={segments} />
    }

    if (phase === 8 && conversation) {
      return <ExportCard conversation={conversation} />
    }

    return (
      <div style={{
        textAlign: 'center' as const,
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 14,
      }}>
        <div
          className="af-icon-pulse"
          style={{
            fontSize: 48, lineHeight: 1,
            fontFamily: 'var(--font-mono, monospace)',
          }}
          aria-hidden="true"
        >
          {String(phase + 1).padStart(2, '0')}
        </div>
        <div style={{ fontSize: 11, color: '#3A3A50', letterSpacing: '0.04em', fontFamily: 'var(--font-mono, monospace)' }}>
          Phase {phase + 1} loading...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, background: '#05050A', padding: 32,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      animation: 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s both',
    }}>
      {/* ── Ambient background glows ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 20% 30%, rgba(0,255,163,0.04) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(0,195,255,0.03) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(124,109,240,0.02) 0%, transparent 70%)
        `,
      }} />

      {/* ── Architecture depth: phase watermark ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -40,
          right: -20,
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{
          fontSize: 'clamp(120px, 18vw, 220px)',
          fontWeight: 900,
          color: '#FAF8F5',
          opacity: 0.025,
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1,
          letterSpacing: '-0.06em',
        }}>
          {String(phase + 1).padStart(2, '0')}
        </div>
      </div>

      {/* ── Top-left phase indicator ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 20, left: 24, zIndex: 1, pointerEvents: 'none',
        }}
      >
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#2A2A3F',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.06em',
        }}>
          PHASE_{String(phase + 1).padStart(2, '0')}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, animation: 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        {renderContent()}
      </div>
    </div>
  )
}
