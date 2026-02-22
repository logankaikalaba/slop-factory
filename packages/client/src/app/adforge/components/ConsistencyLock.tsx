'use client'

import { useState } from 'react'
import type { Conversation } from './types'

interface Props {
  consistencySpec: NonNullable<Conversation['consistencySpec']>
  onLock: () => void
}

export function ConsistencyLock({ consistencySpec, onLock }: Props) {
  const [locked, setLocked] = useState(consistencySpec.status === 'locked')

  const handleLock = () => {
    setLocked(true)
    onLock()
  }

  const cards = [
    {
      emoji: '🧑',
      title: 'Avatar Spec',
      description: consistencySpec.avatarSpec.fullDescription,
      gradient: 'linear-gradient(135deg, rgba(124,109,240,0.3) 0%, rgba(26,26,46,0.8) 100%)',
      accent: '#7c6df0',
    },
    {
      emoji: '🏗️',
      title: 'Environment',
      description: consistencySpec.environmentSpec.fullDescription,
      gradient: 'linear-gradient(135deg, rgba(32,212,160,0.2) 0%, rgba(26,46,26,0.8) 100%)',
      accent: '#20d4a0',
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      {cards.map(({ emoji, title, description, gradient, accent }) => (
        <div key={title} className="af-card" style={{ width: 230, overflow: 'hidden', padding: 0 }}>
          {/* Header image area */}
          <div style={{ height: 90, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, position: 'relative' }}>
            {emoji}
            {locked && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, background: '#20d4a0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>🔒</div>
            )}
          </div>
          <div style={{ padding: '14px 16px' }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: '#f0f0fa', letterSpacing: '-0.01em' }}>{title}</h4>
            <div style={{ fontSize: 9, color: '#8888aa', lineHeight: 1.7, fontFamily: 'monospace', marginBottom: 12 }}>
              {description}
            </div>
            {locked ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(32,212,160,0.1)', color: '#20d4a0', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                🔒 Locked
              </div>
            ) : (
              <button onClick={handleLock} className="af-btn af-btn-primary" style={{ fontSize: 9, padding: '5px 12px' }}>
                Lock Spec
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
