'use client'

import { useState, useEffect } from 'react'
import type { Offer, Avatar, AdFormat } from './types'

interface Props {
  onStart: (offerId: string, avatarId: string, format: AdFormat) => void
  onDismiss: () => void
}

type Step = 'select' | 'create-offer' | 'create-avatar'

const RESEARCH_STEPS: { key: string; label: string }[] = [
  { key: 'name',             label: 'Persona name' },
  { key: 'demographics',     label: 'Demographics' },
  { key: 'psychographics',   label: 'Psychographics' },
  { key: 'painPoints',       label: 'Pain points' },
  { key: 'failedSolutions',  label: 'Failed solutions' },
  { key: 'languagePatterns', label: 'Voice of customer' },
  { key: 'objections',       label: 'Objections' },
  { key: 'triggerEvents',    label: 'Trigger events' },
  { key: 'aspirations',      label: 'Aspirations' },
  { key: 'worldview',        label: 'Worldview' },
  { key: 'fullBriefMd',      label: 'Research brief' },
]

export function SetupModal({ onStart, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('select')
  const [offers, setOffers] = useState<Offer[]>([])
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [offerId, setOfferId] = useState('')
  const [avatarId, setAvatarId] = useState('')
  const [format, setFormat] = useState<AdFormat | ''>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [progressFields, setProgressFields] = useState<string[]>([])
  const [error, setError] = useState('')

  const [offerForm, setOfferForm] = useState({ productName: '', productDescription: '', targetAudience: '' })
  const [avatarLabel, setAvatarLabel] = useState('')

  const refreshLists = async () => {
    const [o, a] = await Promise.all([
      fetch('/api/adforge/offers').then((r) => r.json()),
      fetch('/api/adforge/avatars').then((r) => r.json()),
    ])
    setOffers(o.data ?? [])
    setAvatars(a.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    refreshLists().catch(() => setLoading(false))
  }, [])

  const handleGenerateOffer = async () => {
    if (!offerForm.productName || !offerForm.productDescription || !offerForm.targetAudience) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setGenerating(true)
    try {
      const res = await fetch('/api/adforge/offers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerForm),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error as string)
      await refreshLists()
      setOfferId((data.data as { _id: string })._id)
      setOfferForm({ productName: '', productDescription: '', targetAudience: '' })
      setStep('select')
    } catch {
      setError('Generation failed. Check that the server is running and your Anthropic key is set.')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateAvatar = async () => {
    if (!avatarLabel.trim()) {
      setError('Please enter your avatar.')
      return
    }
    setError('')
    setGenerating(true)
    setProgressFields([])
    try {
      const res = await fetch('/api/adforge/avatars/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarLabel: avatarLabel.trim() }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let newAvatarId = ''

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        let eventType = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6)) as Record<string, unknown>
            if (eventType === 'progress') {
              setProgressFields(data['fields'] as string[])
            } else if (eventType === 'complete') {
              newAvatarId = (data['data'] as { _id: string })._id
              break outer
            } else if (eventType === 'error') {
              throw new Error(data['error'] as string)
            }
          }
        }
      }

      await refreshLists()
      setAvatarId(newAvatarId)
      setAvatarLabel('')
      setStep('select')
    } catch {
      setError('Research failed. Check that the server is running and your Anthropic key is set.')
    } finally {
      setGenerating(false)
      setProgressFields([])
    }
  }

  const canStart = offerId && avatarId && format

  const selectStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '11px 14px',
    color: '#FAF8F5',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    appearance: 'none' as const,
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backdropFilter: 'blur(8px)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(3, 3, 8, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in 0.25s ease both',
    }}>
      <div style={{
        background: 'rgba(12, 12, 22, 0.9)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: 36,
        width: 480,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,163,0.06)',
        animation: 'fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
      }}>

        {/* ── CREATE OFFER ── */}
        {step === 'create-offer' && (
          <>
            <button
              onClick={() => { setStep('select'); setError('') }}
              style={{
                background: 'none', border: 'none', color: '#8A8A93', fontSize: 11,
                cursor: 'pointer', marginBottom: 24, padding: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'inherit', transition: 'color 0.2s',
              }}
            >
              ← Back
            </button>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontSize: 22, fontWeight: 800, marginBottom: 6,
                color: '#FAF8F5', letterSpacing: '-0.04em',
              }}>
                Create Offer
              </h2>
              <p style={{ fontSize: 12, color: '#8A8A93', lineHeight: 1.65 }}>
                Describe your product and AI will build the full Hormozi value equation for you.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="af-label">Product Name</label>
                <input
                  className="af-input"
                  placeholder="e.g. ProRoof Estimator"
                  value={offerForm.productName}
                  onChange={(e) => setOfferForm((p) => ({ ...p, productName: e.target.value }))}
                />
              </div>
              <div>
                <label className="af-label">What does it do?</label>
                <textarea
                  className="af-input"
                  style={{ height: 80, resize: 'none' }}
                  placeholder="e.g. A mobile app that helps roofing contractors generate estimates in under 5 minutes"
                  value={offerForm.productDescription}
                  onChange={(e) => setOfferForm((p) => ({ ...p, productDescription: e.target.value }))}
                />
              </div>
              <div>
                <label className="af-label">Who is it for?</label>
                <input
                  className="af-input"
                  placeholder="e.g. Independent roofing contractors in the US"
                  value={offerForm.targetAudience}
                  onChange={(e) => setOfferForm((p) => ({ ...p, targetAudience: e.target.value }))}
                />
              </div>
            </div>
            {error && (
              <p style={{ color: '#FF4F6A', fontSize: 11, marginTop: 14, marginBottom: 0 }}>{error}</p>
            )}
            <button
              onClick={handleGenerateOffer}
              disabled={generating}
              className="af-btn af-btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '13px 0', marginTop: 22, borderRadius: 14 }}
            >
              {generating ? '⏳ Generating...' : '✦ Generate Offer with AI →'}
            </button>
          </>
        )}

        {/* ── CREATE AVATAR ── */}
        {step === 'create-avatar' && (
          <>
            <button
              onClick={() => { setStep('select'); setError('') }}
              style={{
                background: 'none', border: 'none', color: '#8A8A93', fontSize: 11,
                cursor: 'pointer', marginBottom: 24, padding: 0,
                fontFamily: 'inherit',
              }}
            >
              ← Back
            </button>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontSize: 22, fontWeight: 800, marginBottom: 6,
                color: '#FAF8F5', letterSpacing: '-0.04em',
              }}>
                Who is your avatar?
              </h2>
              <p style={{ fontSize: 12, color: '#8A8A93', lineHeight: 1.65 }}>
                Enter a profession or demographic. AI conducts deep research and builds a comprehensive psychological profile.
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="af-label">Avatar</label>
              <input
                className="af-input"
                placeholder="e.g. landlords, gym owners, plumbers"
                value={avatarLabel}
                onChange={(e) => setAvatarLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !generating) handleGenerateAvatar() }}
                autoFocus
              />
            </div>

            {generating && (
              <div style={{
                background: 'rgba(0,255,163,0.04)',
                border: '1px solid rgba(0,255,163,0.12)',
                borderRadius: 16,
                padding: '16px 18px',
                marginBottom: 18,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#00FFA3',
                    boxShadow: '0 0 8px rgba(0,255,163,0.7)',
                    animation: 'blink-dot 1s ease-in-out infinite',
                    flexShrink: 0,
                  }} />
                  <p style={{
                    fontSize: 10, color: '#00FFA3', fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>
                    Conducting deep research...
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 16px' }}>
                  {RESEARCH_STEPS.map(({ key, label }) => {
                    const done = progressFields.includes(key)
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
                        <span style={{
                          color: done ? '#00FFA3' : '#2A2A3F',
                          fontSize: 11, lineHeight: 1,
                          transition: 'color 0.35s',
                          flexShrink: 0,
                          textShadow: done ? '0 0 6px rgba(0,255,163,0.6)' : 'none',
                        }}>
                          {done ? '✓' : '○'}
                        </span>
                        <span style={{
                          color: done ? '#A0F0DC' : '#3A3A50',
                          transition: 'color 0.35s',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: 10,
                        }}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <p style={{ color: '#FF4F6A', fontSize: 11, marginBottom: 14 }}>{error}</p>
            )}
            <button
              onClick={handleGenerateAvatar}
              disabled={generating}
              className="af-btn af-btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '13px 0', borderRadius: 14 }}
            >
              {generating ? '⏳ Researching...' : '◎ Research Avatar →'}
            </button>
          </>
        )}

        {/* ── SELECT ── */}
        {step === 'select' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h2 style={{
                  fontSize: 22, fontWeight: 800, color: '#FAF8F5',
                  margin: 0, letterSpacing: '-0.04em',
                }}>
                  New Campaign
                </h2>
                <p style={{ fontSize: 12, color: '#8A8A93', marginTop: 6, lineHeight: 1.5 }}>
                  Choose your offer, avatar, and format.
                </p>
              </div>
              <button
                onClick={onDismiss}
                aria-label="Close"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 9,
                  color: '#8A8A93', fontSize: 16,
                  cursor: 'pointer', lineHeight: 1,
                  padding: '5px 9px', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '22px 0' }} />

            {loading ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#00FFA3',
                  boxShadow: '0 0 8px rgba(0,255,163,0.7)',
                  animation: 'blink-dot 1s ease-in-out infinite',
                  margin: '0 auto 12px',
                }} />
                <p style={{ color: '#3A3A50', fontSize: 11, fontFamily: 'var(--font-mono, monospace)' }}>Loading...</p>
              </div>
            ) : (
              <>
                {/* Offer row */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="af-label" style={{ marginBottom: 0 }}>Offer</label>
                    <button
                      onClick={() => { setStep('create-offer'); setError('') }}
                      className="af-btn af-btn-ghost"
                      style={{ fontSize: 10, padding: '3px 10px', borderRadius: 8 }}
                    >
                      + Create New
                    </button>
                  </div>
                  <select
                    value={offerId}
                    onChange={(e) => setOfferId(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select an offer...</option>
                    {offers.map((o) => (
                      <option key={o._id} value={o._id}>{o.name || o.productName}</option>
                    ))}
                  </select>
                  {offers.length === 0 && (
                    <p style={{ fontSize: 10, color: '#FB923C', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
                      No offers yet — create one with AI.
                    </p>
                  )}
                </div>

                {/* Avatar row */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label className="af-label" style={{ marginBottom: 0 }}>Avatar</label>
                    <button
                      onClick={() => { setStep('create-avatar'); setError('') }}
                      className="af-btn af-btn-ghost"
                      style={{ fontSize: 10, padding: '3px 10px', borderRadius: 8 }}
                    >
                      + Create New
                    </button>
                  </div>
                  <select
                    value={avatarId}
                    onChange={(e) => setAvatarId(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select an avatar...</option>
                    {avatars.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                  {avatars.length === 0 && (
                    <p style={{ fontSize: 10, color: '#FB923C', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
                      No avatars yet — create one with AI.
                    </p>
                  )}
                </div>

                {/* Format row */}
                <div style={{ marginBottom: 28 }}>
                  <label className="af-label">Ad Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as AdFormat)}
                    style={selectStyle}
                  >
                    <option value="">Select a format...</option>
                    <option value="ugc">UGC Ad — conversational, phone-style</option>
                    <option value="story_movie">Story Movie Ad — cinematic, narrative</option>
                  </select>
                </div>

                {error && (
                  <p style={{ color: '#FF4F6A', fontSize: 11, marginBottom: 14 }}>{error}</p>
                )}

                <button
                  disabled={!canStart}
                  onClick={() => canStart && onStart(offerId, avatarId, format as AdFormat)}
                  className="af-btn af-btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center',
                    fontSize: 13, padding: '14px 0',
                    borderRadius: 14,
                    opacity: canStart ? 1 : 0.35,
                    animation: canStart ? 'glow-pulse 2.5s ease-in-out infinite' : 'none',
                  }}
                >
                  Launch Campaign →
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
