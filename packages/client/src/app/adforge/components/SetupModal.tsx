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

  const selectCls: React.CSSProperties = {
    width: '100%',
    background: '#181828',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 9,
    padding: '10px 13px',
    color: '#f0f0fa',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    appearance: 'none' as const,
    cursor: 'pointer',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(7,7,18,0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fade-in 0.2s ease both',
    }}>
      <div style={{
        background: '#111120',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 32,
        width: 460,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,109,240,0.08)',
        animation: 'fade-up 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* ── CREATE OFFER ── */}
        {step === 'create-offer' && (
          <>
            <button onClick={() => { setStep('select'); setError('') }} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 11, cursor: 'pointer', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#f0f0fa', letterSpacing: '-0.03em' }}>Create Offer</h2>
            <p style={{ fontSize: 12, color: '#8888aa', marginBottom: 24, lineHeight: 1.6 }}>
              Describe your product and AI will build the full Hormozi value equation for you.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label className="af-label">Product Name</label>
              <input className="af-input" placeholder="e.g. ProRoof Estimator" value={offerForm.productName} onChange={(e) => setOfferForm((p) => ({ ...p, productName: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="af-label">What does it do?</label>
              <textarea className="af-input af-textarea" style={{ height: 80 }} placeholder="e.g. A mobile app that helps roofing contractors generate estimates in under 5 minutes" value={offerForm.productDescription} onChange={(e) => setOfferForm((p) => ({ ...p, productDescription: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="af-label">Who is it for?</label>
              <input className="af-input" placeholder="e.g. Independent roofing contractors in the US" value={offerForm.targetAudience} onChange={(e) => setOfferForm((p) => ({ ...p, targetAudience: e.target.value }))} />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: 11, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleGenerateOffer} disabled={generating} className="af-btn af-btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '12px 0' }}>
              {generating ? '⏳ Generating...' : '✦ Generate Offer with AI →'}
            </button>
          </>
        )}

        {/* ── CREATE AVATAR ── */}
        {step === 'create-avatar' && (
          <>
            <button onClick={() => { setStep('select'); setError('') }} style={{ background: 'none', border: 'none', color: '#8888aa', fontSize: 11, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: '#f0f0fa', letterSpacing: '-0.03em' }}>Who is your avatar?</h2>
            <p style={{ fontSize: 12, color: '#8888aa', marginBottom: 24, lineHeight: 1.6 }}>
              Enter a profession or demographic. AI conducts deep research and builds a comprehensive psychological profile.
            </p>
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
              <div style={{ background: 'rgba(124,109,240,0.06)', border: '1px solid rgba(124,109,240,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#a097f7', marginBottom: 10, fontWeight: 600 }}>
                  Conducting deep research...
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                  {RESEARCH_STEPS.map(({ key, label }) => {
                    const done = progressFields.includes(key)
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                        <span style={{ color: done ? '#20d4a0' : '#282840', fontSize: 12, lineHeight: 1, transition: 'color 0.3s', flexShrink: 0 }}>
                          {done ? '✓' : '○'}
                        </span>
                        <span style={{ color: done ? '#a0f0dc' : '#3a3a5a', transition: 'color 0.3s' }}>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {error && <p style={{ color: '#f87171', fontSize: 11, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleGenerateAvatar} disabled={generating} className="af-btn af-btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '12px 0' }}>
              {generating ? '⏳ Researching...' : '◎ Research Avatar →'}
            </button>
          </>
        )}

        {/* ── SELECT ── */}
        {step === 'select' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f0f0fa', margin: 0, letterSpacing: '-0.03em' }}>New Campaign</h2>
                <p style={{ fontSize: 12, color: '#8888aa', marginTop: 4 }}>Choose your offer, avatar, and format.</p>
              </div>
              <button onClick={onDismiss} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: '#8888aa', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: '4px 8px', flexShrink: 0 }}>×</button>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '18px 0' }} />

            {loading ? (
              <p style={{ color: '#40405f', fontSize: 12, textAlign: 'center' as const, padding: '24px 0' }}>Loading...</p>
            ) : (
              <>
                {/* Offer row */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <label className="af-label" style={{ marginBottom: 0 }}>Offer</label>
                    <button onClick={() => { setStep('create-offer'); setError('') }} className="af-btn af-btn-ghost" style={{ fontSize: 10, padding: '3px 9px' }}>
                      + Create New
                    </button>
                  </div>
                  <select value={offerId} onChange={(e) => setOfferId(e.target.value)} style={selectCls}>
                    <option value="">Select an offer...</option>
                    {offers.map((o) => (<option key={o._id} value={o._id}>{o.name || o.productName}</option>))}
                  </select>
                  {offers.length === 0 && <p style={{ fontSize: 10, color: '#fb923c', marginTop: 5 }}>No offers yet — create one with AI.</p>}
                </div>

                {/* Avatar row */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <label className="af-label" style={{ marginBottom: 0 }}>Avatar</label>
                    <button onClick={() => { setStep('create-avatar'); setError('') }} className="af-btn af-btn-ghost" style={{ fontSize: 10, padding: '3px 9px' }}>
                      + Create New
                    </button>
                  </div>
                  <select value={avatarId} onChange={(e) => setAvatarId(e.target.value)} style={selectCls}>
                    <option value="">Select an avatar...</option>
                    {avatars.map((a) => (<option key={a._id} value={a._id}>{a.name}</option>))}
                  </select>
                  {avatars.length === 0 && <p style={{ fontSize: 10, color: '#fb923c', marginTop: 5 }}>No avatars yet — create one with AI.</p>}
                </div>

                {/* Format row */}
                <div style={{ marginBottom: 24 }}>
                  <label className="af-label">Ad Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as AdFormat)} style={selectCls}>
                    <option value="">Select a format...</option>
                    <option value="ugc">UGC Ad — conversational, phone-style</option>
                    <option value="story_movie">Story Movie Ad — cinematic, narrative</option>
                  </select>
                </div>

                {error && <p style={{ color: '#f87171', fontSize: 11, marginBottom: 12 }}>{error}</p>}

                <button
                  disabled={!canStart}
                  onClick={() => canStart && onStart(offerId, avatarId, format as AdFormat)}
                  className="af-btn af-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '12px 0', opacity: canStart ? 1 : 0.4 }}
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
