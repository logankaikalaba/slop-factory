'use client'

import { useState, useEffect } from 'react'
import type { Offer, Avatar, AdFormat } from './types'

interface Props {
  onStart: (offerId: string, avatarId: string, format: AdFormat) => void
  onDismiss: () => void
}

type Step = 'select' | 'create-offer' | 'create-avatar'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1a26',
  border: '1px solid #2a2a3d',
  borderRadius: 7,
  padding: '9px 12px',
  color: '#e4e4ef',
  fontSize: 12,
  boxSizing: 'border-box',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  color: '#7a7a95',
  marginBottom: 5,
}

export function SetupModal({ onStart, onDismiss }: Props) {
  const [step, setStep] = useState<Step>('select')
  const [offers, setOffers] = useState<Offer[]>([])
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [offerId, setOfferId] = useState('')
  const [avatarId, setAvatarId] = useState('')
  const [format, setFormat] = useState<AdFormat | ''>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
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
    try {
      const res = await fetch('/api/adforge/avatars/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarLabel: avatarLabel.trim() }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error as string)
      await refreshLists()
      setAvatarId((data.data as { _id: string })._id)
      setAvatarLabel('')
      setStep('select')
    } catch {
      setError('Research failed. Check that the server is running and your Anthropic key is set.')
    } finally {
      setGenerating(false)
    }
  }

  const canStart = offerId && avatarId && format

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    }}>
      <div style={{
        background: '#12121a', border: '1px solid #2a2a3d',
        borderRadius: 14, padding: 28, width: 460,
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* ── CREATE OFFER ── */}
        {step === 'create-offer' && (
          <>
            <button onClick={() => { setStep('select'); setError('') }} style={{
              background: 'none', border: 'none', color: '#7a7a95',
              fontSize: 11, cursor: 'pointer', marginBottom: 12, padding: 0,
            }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 16, marginBottom: 4, color: '#e4e4ef' }}>Create Offer</h2>
            <p style={{ fontSize: 11, color: '#7a7a95', marginBottom: 18 }}>
              Describe your product and AI will build the full Hormozi value equation for you.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Product Name</label>
              <input
                style={inputStyle}
                placeholder="e.g. ProRoof Estimator"
                value={offerForm.productName}
                onChange={(e) => setOfferForm((p) => ({ ...p, productName: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>What does it do?</label>
              <textarea
                style={{ ...inputStyle, height: 72, resize: 'none' as const }}
                placeholder="e.g. A mobile app that helps roofing contractors generate accurate job estimates in under 5 minutes"
                value={offerForm.productDescription}
                onChange={(e) => setOfferForm((p) => ({ ...p, productDescription: e.target.value }))}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Who is it for?</label>
              <input
                style={inputStyle}
                placeholder="e.g. Independent roofing contractors in the US"
                value={offerForm.targetAudience}
                onChange={(e) => setOfferForm((p) => ({ ...p, targetAudience: e.target.value }))}
              />
            </div>
            {error && <p style={{ color: '#ff6b6b', fontSize: 11, marginBottom: 10 }}>{error}</p>}
            <button
              onClick={handleGenerateOffer}
              disabled={generating}
              style={{
                width: '100%', background: generating ? '#2a2a3d' : '#6c5ce7',
                color: '#fff', border: 'none', padding: 11, borderRadius: 9,
                fontSize: 13, fontWeight: 600, cursor: generating ? 'default' : 'pointer',
              }}
            >
              {generating ? '⏳ Generating offer...' : '✨ Generate Offer with AI →'}
            </button>
          </>
        )}

        {/* ── CREATE AVATAR ── */}
        {step === 'create-avatar' && (
          <>
            <button onClick={() => { setStep('select'); setError('') }} style={{
              background: 'none', border: 'none', color: '#7a7a95',
              fontSize: 11, cursor: 'pointer', marginBottom: 12, padding: 0,
            }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 16, marginBottom: 4, color: '#e4e4ef' }}>Who is your avatar?</h2>
            <p style={{ fontSize: 11, color: '#7a7a95', marginBottom: 18 }}>
              Enter a profession, demographic, or target audience. AI will conduct deep research and build a comprehensive psychological profile.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Avatar</label>
              <input
                style={inputStyle}
                placeholder="e.g. landlords, gym owners, plumbers"
                value={avatarLabel}
                onChange={(e) => setAvatarLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !generating) handleGenerateAvatar() }}
                autoFocus
              />
            </div>
            {generating && (
              <p style={{ fontSize: 11, color: '#a29bfe', marginBottom: 10, textAlign: 'center' as const }}>
                Conducting deep research... this takes 30–60 seconds.
              </p>
            )}
            {error && <p style={{ color: '#ff6b6b', fontSize: 11, marginBottom: 10 }}>{error}</p>}
            <button
              onClick={handleGenerateAvatar}
              disabled={generating}
              style={{
                width: '100%', background: generating ? '#2a2a3d' : '#6c5ce7',
                color: '#fff', border: 'none', padding: 11, borderRadius: 9,
                fontSize: 13, fontWeight: 600, cursor: generating ? 'default' : 'pointer',
              }}
            >
              {generating ? '⏳ Researching avatar...' : '🔍 Research Avatar →'}
            </button>
          </>
        )}

        {/* ── SELECT ── */}
        {step === 'select' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
            <h2 style={{ fontSize: 17, color: '#e4e4ef', margin: 0 }}>New Ad Campaign</h2>
            <button onClick={onDismiss} style={{
              background: 'none', border: 'none', color: '#3a3a5d',
              fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
            }}>×</button>
          </div>
            <p style={{ fontSize: 11, color: '#7a7a95', marginBottom: 20 }}>
              Select your offer, avatar, and ad format — or create new ones with AI.
            </p>

            {loading ? (
              <p style={{ color: '#7a7a95', fontSize: 12 }}>Loading...</p>
            ) : (
              <>
                {/* Offer */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Offer</label>
                    <button onClick={() => { setStep('create-offer'); setError('') }} style={{
                      background: 'none', border: '1px solid #2a2a3d', borderRadius: 5,
                      color: '#a29bfe', fontSize: 10, fontWeight: 600, padding: '2px 8px', cursor: 'pointer',
                    }}>
                      + Create New
                    </button>
                  </div>
                  <select value={offerId} onChange={(e) => setOfferId(e.target.value)} style={selectStyle}>
                    <option value="">Select an offer...</option>
                    {offers.map((o) => (
                      <option key={o._id} value={o._id}>{o.name || o.productName}</option>
                    ))}
                  </select>
                  {offers.length === 0 && (
                    <p style={{ fontSize: 10, color: '#ffa94d', marginTop: 4 }}>
                      No offers yet — click "+ Create New" above to generate one with AI.
                    </p>
                  )}
                </div>

                {/* Avatar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Avatar</label>
                    <button onClick={() => { setStep('create-avatar'); setError('') }} style={{
                      background: 'none', border: '1px solid #2a2a3d', borderRadius: 5,
                      color: '#a29bfe', fontSize: 10, fontWeight: 600, padding: '2px 8px', cursor: 'pointer',
                    }}>
                      + Create New
                    </button>
                  </div>
                  <select value={avatarId} onChange={(e) => setAvatarId(e.target.value)} style={selectStyle}>
                    <option value="">Select an avatar...</option>
                    {avatars.map((a) => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                  {avatars.length === 0 && (
                    <p style={{ fontSize: 10, color: '#ffa94d', marginTop: 4 }}>
                      No avatars yet — create an offer first, then click "+ Create New" above.
                    </p>
                  )}
                </div>

                {/* Format */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Ad Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as AdFormat)} style={selectStyle}>
                    <option value="">Select a format...</option>
                    <option value="ugc">UGC Ad (conversational, phone-style)</option>
                    <option value="story_movie">Story Movie Ad (cinematic, narrative)</option>
                  </select>
                </div>

                {error && <p style={{ color: '#ff6b6b', fontSize: 11, marginBottom: 10 }}>{error}</p>}

                <button
                  disabled={!canStart}
                  onClick={() => canStart && onStart(offerId, avatarId, format as AdFormat)}
                  style={{
                    width: '100%',
                    background: canStart ? '#6c5ce7' : '#2a2a3d',
                    color: '#fff', border: 'none',
                    padding: 11, borderRadius: 9,
                    fontSize: 13, fontWeight: 600,
                    cursor: canStart ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                >
                  Start Ad Creation →
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
