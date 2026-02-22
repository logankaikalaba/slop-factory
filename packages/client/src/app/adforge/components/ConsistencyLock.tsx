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
      gradient: 'linear-gradient(135deg, rgba(0,255,163,0.15) 0%, rgba(8,8,18,0.9) 100%)',
      accent: '#00FFA3',
    },
    {
      emoji: '🏗️',
      title: 'Environment',
      description: consistencySpec.environmentSpec.fullDescription,
      gradient: 'linear-gradient(135deg, rgba(0,195,255,0.12) 0%, rgba(8,8,18,0.9) 100%)',
      accent: '#00C3FF',
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      {cards.map(({ emoji, title, description, gradient, accent }) => (
        <div key={title} className="af-card" style={{ width: 240, overflow: 'hidden', padding: 0 }}>
          {/* Header image area */}
          <div style={{
            height: 90, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, position: 'relative',
            borderBottom: `1px solid ${accent}22`,
          }}>
            {emoji}
            {locked && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 20, height: 20,
                background: '#00FFA3',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10,
                boxShadow: '0 0 10px rgba(0,255,163,0.5)',
              }}>
                🔒
              </div>
            )}
          </div>
          <div style={{ padding: '14px 16px' }}>
            <h4 style={{
              fontSize: 11, fontWeight: 700, marginBottom: 8,
              color: '#FAF8F5', letterSpacing: '-0.01em',
            }}>
              {title}
            </h4>
            <div style={{
              fontSize: 9, color: '#8A8A93', lineHeight: 1.75,
              fontFamily: 'var(--font-mono, monospace)',
              marginBottom: 12,
            }}>
              {description}
            </div>
            {locked ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(0,255,163,0.08)',
                color: '#00FFA3',
                fontSize: 9, fontWeight: 700,
                padding: '4px 10px', borderRadius: 20,
                border: '1px solid rgba(0,255,163,0.15)',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.06em',
              }}>
                🔒 Locked
              </div>
            ) : (
              <button onClick={handleLock} className="af-btn af-btn-primary" style={{ fontSize: 9, padding: '6px 14px', borderRadius: 10 }}>
                Lock Spec
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
