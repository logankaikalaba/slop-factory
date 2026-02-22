const PHASE_NAMES = [
  'Setup', 'Brief', 'Script', 'Char Lock',
  'Keyframes', 'Storyboard', 'Video Gen', 'Review', 'Export',
]

export function PhaseBar({ phase }: { phase: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
      {/* ── Segment track ── */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
        {PHASE_NAMES.map((name, i) => {
          const isActive = i === phase
          const isDone = i < phase
          return (
            <div
              key={name}
              title={name}
              style={{
                width: isActive ? 32 : 14,
                height: 3,
                borderRadius: 3,
                background: isDone
                  ? '#00C3FF'
                  : isActive
                    ? '#00FFA3'
                    : 'rgba(255,255,255,0.07)',
                transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: isActive
                  ? '0 0 10px rgba(0,255,163,0.6), 0 0 20px rgba(0,255,163,0.25)'
                  : isDone
                    ? '0 0 6px rgba(0,195,255,0.4)'
                    : 'none',
              }}
            />
          )
        })}
      </div>

      {/* ── Active dot ── */}
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: '#00FFA3',
        boxShadow: '0 0 8px rgba(0,255,163,0.7)',
        animation: 'blink-dot 1.8s ease-in-out infinite',
        flexShrink: 0,
      }} />

      {/* ── Precision label ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 7,
        padding: '3px 10px',
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.02em',
          color: '#00FFA3',
        }}>
          {phase + 1}
        </span>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.02em',
          color: '#2A2A3F',
          margin: '0 2px',
        }}>
          /
        </span>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.02em',
          color: '#2A2A3F',
        }}>
          {PHASE_NAMES.length}
        </span>
        <span style={{
          width: 1, height: 10, background: 'rgba(255,255,255,0.08)',
          margin: '0 8px', display: 'inline-block', flexShrink: 0,
        }} />
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '0.04em',
          color: '#8A8A93',
          textTransform: 'uppercase' as const,
          whiteSpace: 'nowrap' as const,
        }}>
          {PHASE_NAMES[phase] ?? ''}
        </span>
      </div>
    </div>
  )
}
