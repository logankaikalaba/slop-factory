'use client'

import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from './types'

interface Props {
  messages: ChatMessage[]
  onSend: (text: string) => void
  disabled?: boolean
  conversationId: string | null
}

export function ChatPanel({ messages, onSend, disabled, conversationId }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div style={{
      width: 360, minWidth: 360,
      background: 'rgba(10, 10, 20, 0.7)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', height: '100%',
      animation: 'slide-right 0.45s cubic-bezier(0.16,1,0.3,1) 0.1s both',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.015)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status dot */}
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: conversationId ? '#00FFA3' : '#2A2A3F',
            boxShadow: conversationId ? '0 0 10px rgba(0,255,163,0.7), 0 0 20px rgba(0,255,163,0.3)' : 'none',
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
            flexShrink: 0,
            animation: conversationId ? 'blink-dot 2s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.14em',
            color: '#3A3A50',
            fontFamily: 'var(--font-mono, monospace)',
          }}>
            Copilot
          </span>
        </div>
        {conversationId && (
          <div style={{
            fontSize: 9,
            color: '#2A2A44',
            fontFamily: 'var(--font-mono, monospace)',
            background: 'rgba(0,255,163,0.04)',
            border: '1px solid rgba(0,255,163,0.1)',
            padding: '3px 8px',
            borderRadius: 6,
            letterSpacing: '0.05em',
          }}>
            {conversationId.slice(-8)}
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, padding: '16px 14px', overflowY: 'auto' as const,
        display: 'flex', flexDirection: 'column' as const, gap: 10, minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{
            margin: 'auto', textAlign: 'center' as const,
            display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16,
          }}>
            <div
              className="af-icon-pulse"
              style={{ fontSize: 34, lineHeight: 1 }}
              aria-hidden="true"
            >
              ⚡
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#FAF8F5',
                letterSpacing: '-0.02em',
              }}>
                AdForge Copilot
              </div>
              <div style={{ fontSize: 11, color: '#3A3A50', lineHeight: 1.7 }}>
                Start a campaign to begin.
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="af-msg" style={{
                alignSelf: 'center' as const,
                fontSize: 9,
                color: '#3A3A50',
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.04)',
                background: 'rgba(255,255,255,0.02)',
                textAlign: 'center' as const,
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.04em',
              }}>
                {msg.content}
              </div>
            )
          }
          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className="af-msg" style={{
              maxWidth: '92%', alignSelf: isUser ? 'flex-end' : 'flex-start' as const,
            }}>
              {!isUser && (
                <div style={{
                  fontSize: 8,
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.12em',
                  color: '#00C3FF',
                  marginBottom: 5,
                  paddingLeft: 3,
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  Copilot
                </div>
              )}
              <div style={{
                padding: '10px 14px',
                borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                fontSize: 12, lineHeight: 1.65,
                background: isUser
                  ? 'linear-gradient(135deg, #7C6DF0, #5B52CC)'
                  : 'rgba(255,255,255,0.04)',
                border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)',
                color: '#FAF8F5',
                whiteSpace: 'pre-wrap' as const,
                boxShadow: isUser ? '0 4px 20px rgba(124,109,240,0.25)' : 'none',
                backdropFilter: isUser ? 'none' : 'blur(8px)',
              }}>
                {msg.content}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {disabled && (
          <div className="af-msg" style={{ alignSelf: 'flex-start' as const }}>
            <div style={{
              fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const,
              letterSpacing: '0.12em', color: '#00C3FF',
              marginBottom: 5, paddingLeft: 3,
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              Copilot
            </div>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '4px 16px 16px 16px',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#00FFA3', display: 'inline-block',
                    animation: `typing-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
                    boxShadow: '0 0 6px rgba(0,255,163,0.5)',
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'flex-end', gap: 8,
        flexShrink: 0,
        background: 'rgba(255,255,255,0.01)',
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={conversationId ? 'Message copilot...' : 'Start a campaign first...'}
          disabled={disabled || !conversationId}
          className="af-input"
          style={{ fontSize: 12, borderRadius: 12 }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim() || !conversationId}
          className="af-btn af-btn-primary"
          aria-label="Send message"
          style={{
            width: 38, height: 38, padding: 0, borderRadius: 11,
            justifyContent: 'center', flexShrink: 0, fontSize: 15,
            opacity: (disabled || !input.trim() || !conversationId) ? 0.25 : 1,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
