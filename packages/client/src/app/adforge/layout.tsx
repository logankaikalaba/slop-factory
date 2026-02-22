import type { ReactNode } from 'react'

// AdForge is a full-screen IDE-style app — escape the root layout's
// padded <main> container with position:fixed so it owns the whole viewport.
export default function AdForgeLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, overflow: 'hidden', background: '#05050A' }}>
      {/* ── Global noise texture overlay (feTurbulence @ 0.04 opacity) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
          mixBlendMode: 'overlay',
        }}
      />
      {children}
    </div>
  )
}
