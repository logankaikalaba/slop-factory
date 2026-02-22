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
        <div style={{ textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 14 }}>
          <div className="af-icon-pulse" style={{ fontSize: 56, lineHeight: 1 }}>⚡</div>
          <div style={{ fontSize: 13, color: '#40405f', lineHeight: 1.7 }}>
            Create or select an offer and avatar to begin.
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
      <div style={{ textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10 }}>
        <div className="af-icon-pulse" style={{ fontSize: 48, lineHeight: 1, fontFamily: 'monospace', color: '#7c6df0' }}>{String(phase + 1).padStart(2, '0')}</div>
        <div style={{ fontSize: 11, color: '#40405f' }}>Phase {phase + 1} loading...</div>
      </div>
    )
  }

  return (
    <div style={{
      flex: 1, background: '#0b0b14', padding: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse at 25% 35%, rgba(124,109,240,0.06) 0%, transparent 55%),
          radial-gradient(ellipse at 75% 65%, rgba(32,212,160,0.03) 0%, transparent 55%)
        `,
      }} />

      {/* Phase number watermark */}
      <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 1, pointerEvents: 'none' }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: '#7c6df0', opacity: 0.06, fontFamily: 'monospace', lineHeight: 1, letterSpacing: '-0.04em' }}>
          {String(phase + 1).padStart(2, '0')}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, animation: 'fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
        {renderContent()}
      </div>
    </div>
  )
}
