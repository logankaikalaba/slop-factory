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
      background: '#111120',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', height: '100%',
      animation: 'slide-right 0.4s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: conversationId ? '#20d4a0' : '#40405f',
            boxShadow: conversationId ? '0 0 8px rgba(32,212,160,0.6)' : 'none',
            transition: 'all 0.4s', flexShrink: 0,
          }} />
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#40405f' }}>
            Copilot
          </span>
        </div>
        {conversationId && (
          <span style={{ fontSize: 9, color: '#2a2a44', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4 }}>
            {conversationId.slice(-8)}
          </span>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, padding: '16px 14px', overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: 10, minHeight: 0 }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12 }}>
            <div className="af-icon-pulse" style={{ fontSize: 32, opacity: 0.15 }}>⚡</div>
            <div style={{ fontSize: 12, color: '#40405f', lineHeight: 1.7 }}>
              AdForge Copilot ready.<br />
              <span style={{ fontSize: 11 }}>Start a campaign to begin.</span>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'system') {
            return (
              <div key={msg.id} className="af-msg" style={{
                alignSelf: 'center' as const, fontSize: 10, color: '#40405f',
                padding: '4px 10px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)', textAlign: 'center' as const,
              }}>
                {msg.content}
              </div>
            )
          }
          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className="af-msg" style={{ maxWidth: '90%', alignSelf: isUser ? 'flex-end' : 'flex-start' as const }}>
              {!isUser && (
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#7c6df0', marginBottom: 4, paddingLeft: 2 }}>
                  Copilot
                </div>
              )}
              <div style={{
                padding: '10px 14px',
                borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                fontSize: 12, lineHeight: 1.6,
                background: isUser ? 'linear-gradient(135deg,#7c6df0,#6058d0)' : '#181828',
                border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
                color: '#f0f0fa', whiteSpace: 'pre-wrap' as const,
                boxShadow: isUser ? '0 4px 16px rgba(124,109,240,0.2)' : 'none',
              }}>
                {msg.content}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {disabled && (
          <div className="af-msg" style={{ alignSelf: 'flex-start' as const }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#7c6df0', marginBottom: 4, paddingLeft: 2 }}>
              Copilot
            </div>
            <div style={{ padding: '12px 16px', background: '#181828', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6df0', display: 'inline-block', animation: `typing-bounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={conversationId ? 'Message copilot...' : 'Start a campaign first...'}
          disabled={disabled || !conversationId}
          className="af-input"
          style={{ fontSize: 12 }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim() || !conversationId}
          className="af-btn af-btn-primary"
          style={{
            width: 36, height: 36, padding: 0, borderRadius: 9,
            justifyContent: 'center', flexShrink: 0, fontSize: 16,
            opacity: (disabled || !input.trim() || !conversationId) ? 0.3 : 1,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
