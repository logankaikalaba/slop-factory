const PHASE_NAMES = [
  'Setup', 'Brief', 'Script', 'Char Lock',
  'Keyframes', 'Storyboard', 'Video Gen', 'Review', 'Export',
]

export function PhaseBar({ phase }: { phase: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
      {/* Segment track */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {PHASE_NAMES.map((name, i) => (
          <div
            key={name}
            title={name}
            style={{
              width: i === phase ? 28 : 18,
              height: 3,
              borderRadius: 2,
              background: i < phase ? '#20d4a0' : i === phase ? '#7c6df0' : 'rgba(255,255,255,0.08)',
              transition: 'all 0.45s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: i === phase ? '0 0 8px rgba(124,109,240,0.5)' : i < phase ? '0 0 6px rgba(32,212,160,0.3)' : 'none',
            }}
          />
        ))}
      </div>
      {/* Label */}
      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: '#40405f',
        letterSpacing: '0.04em',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap' as const,
      }}>
        <span style={{ color: '#7c6df0' }}>{phase + 1}</span>
        <span style={{ color: '#282840' }}> / {PHASE_NAMES.length}</span>
        <span style={{ color: '#40405f', marginLeft: 8 }}>{PHASE_NAMES[phase] ?? ''}</span>
      </span>
    </div>
  )
}
