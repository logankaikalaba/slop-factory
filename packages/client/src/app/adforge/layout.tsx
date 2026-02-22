import type { ReactNode } from 'react'

// AdForge is a full-screen IDE-style app — escape the root layout's
// padded <main> container with position:fixed so it owns the whole viewport.
export default function AdForgeLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, overflow: 'hidden', background: '#0b0b14' }}>
      {children}
    </div>
  )
}
