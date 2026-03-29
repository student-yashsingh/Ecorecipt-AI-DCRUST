import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { API } from '../api'

function carbonColor(score) {
  if (score <= 1.0) return { bg: 'rgba(74,124,89,0.12)',  text: '#2d5a3d', grade: 'A+' }
  if (score <= 2.5) return { bg: 'rgba(74,124,89,0.08)',  text: '#4a7c59', grade: 'A'  }
  if (score <= 5.0) return { bg: 'rgba(212,160,23,0.12)', text: '#8a6000', grade: 'B'  }
  if (score <= 10)  return { bg: 'rgba(193,102,58,0.12)', text: '#9a4a25', grade: 'C'  }
  return                   { bg: 'rgba(180,40,40,0.10)',  text: '#8b0000', grade: 'D'  }
}

function gradeConfig(grade) {
  const map = {
    'A+': { color: '#2d5a3d', bg: 'rgba(74,124,89,0.12)',  label: 'Excellent' },
    'A':  { color: '#4a7c59', bg: 'rgba(74,124,89,0.1)',   label: 'Great'     },
    'B':  { color: '#8a6000', bg: 'rgba(212,160,23,0.1)',  label: 'Good'      },
    'C':  { color: '#9a4a25', bg: 'rgba(193,102,58,0.1)',  label: 'Average'   },
    'D':  { color: '#7a3020', bg: 'rgba(180,80,40,0.1)',   label: 'Poor'      },
    'F':  { color: '#8b0000', bg: 'rgba(180,40,40,0.1)',   label: 'Bad'       },
  }
  return map[grade] || map['C']
}

// ── helper: get carbon value from any item shape ──
function getCarbon(item) {
  return item.carbon_kg ?? item.carbon_score ?? item.score ?? 0
}

export default function ReceiptMode() {
  const navigate     = useNavigate()
  const firebaseUser = useStore(s => s.firebaseUser)
  const setUser      = useStore(s => s.setUser)
  const user         = useStore(s => s.user)

  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  function handleFile(f) {
    if (!f) return
    if (!f.type.startsWith('image/')) { setError('Please upload an image file (JPG, PNG, etc.)'); return }
    setFile(f); setError(''); setResult(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function analyseReceipt() {
    if (!file) { setError('Please upload a receipt image first'); return }
    setLoading(true); setError('')
    try {
      const token = await firebaseUser.getIdToken()
      const form  = new FormData()
      form.append('file', file)
      const res = await fetch(`${API}/api/receipt/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Analysis failed') }
      const data = await res.json()
      setResult(data)
      if (user) setUser({ ...user, points: data.new_total_points, tier: data.tier })
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.')
    }
    setLoading(false)
  }

  function reset() { setFile(null); setPreview(null); setResult(null); setError('') }

  // ── RESULTS VIEW ──────────────────────────────────────────
  if (result) {
    const gc          = gradeConfig(result.eco_score)
    const totalCarbon = result.total_carbon_kg?.toFixed(2) || '0.00'
    const maxCarbon   = Math.max(...(result.items?.map(getCarbon) || [1]), 0.01)

    return (
      <div style={s.page}>
        <div style={s.bgBase} /><div style={s.bgGlow1} /><div style={s.bgGlow2} />

        <nav style={s.nav}>
          <button style={s.backBtn} onClick={reset}>← Scan Another</button>
          <span style={s.navTitle}>Receipt Analysis</span>
          <button style={s.navHome} onClick={() => navigate('/home')}>🏠 Home</button>
        </nav>

        <div style={s.resultsWrap}>

          {/* Score hero */}
          <div style={s.scoreHero}>
            <div style={s.scoreDecos}>
              <div style={s.scoreDeco1} /><div style={s.scoreDeco2} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={s.scoreLabel}>ECO SCORE</p>
              <div style={{ ...s.scoreBadge, background: gc.bg, color: gc.color }}>
                {result.eco_score}
              </div>
              <p style={{ ...s.scoreSubLabel, color: gc.color }}>{gc.label}</p>
            </div>
            <div style={s.scoreStats}>
              <div style={s.scoreStat}>
                <div style={s.scoreStatVal}>{totalCarbon}kg</div>
                <div style={s.scoreStatLabel}>Total CO₂</div>
              </div>
              <div style={s.scoreStatDivider} />
              <div style={s.scoreStat}>
                <div style={{ ...s.scoreStatVal, color: '#4a7c59' }}>+{result.points_earned}</div>
                <div style={s.scoreStatLabel}>Points Earned</div>
              </div>
              <div style={s.scoreStatDivider} />
              <div style={s.scoreStat}>
                <div style={s.scoreStatVal}>{result.item_count}</div>
                <div style={s.scoreStatLabel}>Items Found</div>
              </div>
            </div>
          </div>

          {/* Points toast */}
          <div style={s.pointsToast}>
            <span style={{ fontSize: 24 }}>🎉</span>
            <div>
              <div style={s.toastTitle}>+{result.points_earned} points earned!</div>
              <div style={s.toastSub}>
                New total: {result.new_total_points?.toLocaleString()} pts · Tier: {result.tier}
              </div>
            </div>
          </div>

          {/* Items list */}
          <div style={s.itemsCard}>
            <h3 style={s.itemsTitle}>📋 Items Analysed ({result.item_count})</h3>
            <div style={s.itemsList}>
              {result.items?.map((item, i) => {
                const carbon = getCarbon(item)
                const c      = carbonColor(carbon)
                return (
                  <div key={i} style={s.itemRow}>
                    <div style={s.itemLeft}>
                      <div style={{ ...s.itemDot, background: c.text }} />
                      <div>
                        <div style={s.itemName}>{item.item_name || item.name}</div>
                        {item.alternative && item.category !== 'Low' && (
                          <div style={s.itemAlt}>💡 {item.alternative}</div>
                        )}
                      </div>
                    </div>
                    <div style={s.itemRight}>
                      <div style={{ ...s.itemBadge, background: c.bg, color: c.text }}>
                        {c.grade} · {carbon.toFixed(2)}kg
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Carbon breakdown bar chart */}
          <div style={s.breakdownCard}>
            <h3 style={s.itemsTitle}>🌍 Carbon Breakdown (Top 5)</h3>
            {result.items
              ?.slice()
              .sort((a, b) => getCarbon(b) - getCarbon(a))
              .slice(0, 5)
              .map((item, i) => {
                const carbon = getCarbon(item)
                const pct    = Math.round((carbon / maxCarbon) * 100)
                const c      = carbonColor(carbon)
                return (
                  <div key={i} style={s.barRow}>
                    <div style={s.barLabel}>{item.item_name || item.name}</div>
                    <div style={s.barTrack}>
                      <div style={{ ...s.barFill, width: `${pct}%`, background: c.text }} />
                    </div>
                    <div style={{ ...s.barVal, color: c.text }}>{carbon.toFixed(2)}kg</div>
                  </div>
                )
              })}
          </div>

          {/* Actions */}
          <div style={s.actionRow}>
            <button className="btn-primary"
              style={{ flex: 1, padding: '14px 0', fontSize: 15 }}
              onClick={reset}>
              📸 Scan Another
            </button>
            <button
              style={{
                flex: 1, padding: '14px 0', fontSize: 15,
                background: 'linear-gradient(135deg, #1a3d1a, #1a6b3c)',
                color: 'white', border: 'none', borderRadius: 100,
                fontWeight: 700, cursor: 'pointer',
              }}
              onClick={() => navigate('/online')}>
              🛒 Shop Greener
            </button>
          </div>

        </div>
        <style>{`
          @keyframes glowPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        `}</style>
      </div>
    )
  }

  // ── UPLOAD VIEW ───────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.bgBase} /><div style={s.bgGlow1} /><div style={s.bgGlow2} />

      <nav style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/home')}>← Home</button>
        <span style={s.navTitle}>Receipt Mode</span>
        <div style={{ width: 80 }} />
      </nav>

      <div style={s.uploadWrap}>

        <div style={s.header}>
          <div style={s.headerIcon}>🧾</div>
          <h1 style={s.headerTitle}>Scan Your Receipt</h1>
          <p style={s.headerSub}>
            Upload any grocery receipt. Our AI will read every item
            and score your carbon footprint instantly.
          </p>
        </div>

        {/* Drop zone */}
        <div
          style={{
            ...s.dropZone,
            borderColor: dragOver || file ? '#1a6b3c' : '#d4c5b0',
            background: dragOver ? 'rgba(74,124,89,0.06)' : file ? 'rgba(74,124,89,0.04)' : 'rgba(255,255,255,0.7)',
            transform: dragOver ? 'scale(1.01)' : 'scale(1)',
          }}
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !file && fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])} />

          {preview ? (
            <div style={s.previewWrap}>
              <img src={preview} alt="Receipt" style={s.previewImg} />
            </div>
          ) : (
            <div style={s.dropContent}>
              <div style={s.dropIcon}>{dragOver ? '📂' : '📸'}</div>
              <p style={s.dropTitle}>{dragOver ? 'Drop it here!' : 'Drop your receipt here'}</p>
              <p style={s.dropSub}>or click to browse · JPG, PNG supported</p>
              <div style={s.dropHints}>
                {['🧾 Any grocery bill', '📱 Phone photos work', '🔍 Any quality'].map((h, i) => (
                  <span key={i} style={s.dropHint}>{h}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File info */}
        {file && (
          <div style={s.fileInfo}>
            <span style={{ fontSize: 18 }}>📄</span>
            <div style={{ flex: 1 }}>
              <div style={s.fileName}>{file.name}</div>
              <div style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button style={s.removeBtn} onClick={reset}>✕</button>
          </div>
        )}

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {/* Analyse button */}
        <button className="btn-primary"
          onClick={analyseReceipt}
          disabled={!file || loading}
          style={{ width: '100%', padding: '16px 0', fontSize: 17, marginBottom: 16 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={s.spinner} /> Analysing with AI...
            </span>
          ) : '🤖 Analyse Receipt'}
        </button>

        {loading && (
          <div style={s.loadingCard}>
            <div style={s.loadingSteps}>
              {['Reading receipt items...', 'Calculating CO₂ scores...', 'Generating eco report...'].map((step, i) => (
                <div key={i} style={s.loadingStep}>
                  <div style={{ ...s.loadingDot, animationDelay: `${i * 0.4}s` }} />
                  <span style={{ fontSize: 13, color: '#7a6a5a' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points preview */}
        <div style={s.pointsPreview}>
          <p style={s.pointsPreviewTitle}>Points you can earn</p>
          <div style={s.pointsGrid}>
            {[
              { pts: '+10', label: 'Receipt submitted', icon: '📸' },
              { pts: '+50', label: 'A+ eco score',      icon: '⭐' },
              { pts: '+40', label: 'A eco score',       icon: '🌿' },
              { pts: '+30', label: 'B eco score',       icon: '🌱' },
            ].map((p, i) => (
              <div key={i} style={s.pointsItem}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div style={s.pointsItemVal}>{p.pts}</div>
                <div style={s.pointsItemLabel}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glowPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
      `}</style>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', fontFamily: 'Manrope, sans-serif', position: 'relative', overflowX: 'hidden' },
  bgBase: { position: 'fixed', inset: 0, background: 'linear-gradient(145deg, #e8f5e9 0%, #f0f7f0 50%, #e0f2f1 100%)', zIndex: 0 },
  bgGlow1: { position: 'fixed', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,107,60,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'glowPulse 5s ease-in-out infinite' },
  bgGlow2: { position: 'fixed', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,155,90,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },

  nav: { position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(240,247,240,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(26,107,60,0.08)' },
  backBtn: { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(26,107,60,0.15)', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#1a6b3c', cursor: 'pointer' },
  navTitle: { fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 17, color: '#1a3d1a' },
  navHome: { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(26,107,60,0.15)', borderRadius: 100, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: '#1a6b3c', cursor: 'pointer' },

  uploadWrap: { maxWidth: 540, margin: '0 auto', padding: '28px 20px 60px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 },
  header: { textAlign: 'center', marginBottom: 8 },
  headerIcon: { fontSize: 52, marginBottom: 12 },
  headerTitle: { fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 30, color: '#1a3d1a', marginBottom: 10 },
  headerSub: { color: '#5a7a5a', fontSize: 14, lineHeight: 1.6, maxWidth: 380, margin: '0 auto' },

  dropZone: { border: '2px dashed', borderRadius: 20, minHeight: 200, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden', position: 'relative' },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 10 },
  dropIcon: { fontSize: 52, marginBottom: 4 },
  dropTitle: { fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20, color: '#1a3d1a', margin: 0 },
  dropSub: { fontSize: 13, color: '#5a7a5a', margin: 0 },
  dropHints: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  dropHint: { background: 'rgba(255,255,255,0.8)', borderRadius: 100, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#5a7a5a', border: '1px solid rgba(26,107,60,0.15)' },

  previewWrap: { position: 'relative', width: '100%' },
  previewImg: { width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' },

  fileInfo: { display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(26,107,60,0.06)', border: '1px solid rgba(26,107,60,0.15)', borderRadius: 14, padding: '12px 16px' },
  fileName: { fontSize: 14, fontWeight: 600, color: '#1a3d1a' },
  fileSize: { fontSize: 12, color: '#5a7a5a' },
  removeBtn: { background: 'rgba(220,38,38,0.08)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  errorBox: { background: '#fff5f5', border: '1.5px solid #fecaca', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 500 },

  spinner: { width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' },

  loadingCard: { background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(26,107,60,0.1)', borderRadius: 14, padding: '16px 20px' },
  loadingSteps: { display: 'flex', flexDirection: 'column', gap: 10 },
  loadingStep: { display: 'flex', alignItems: 'center', gap: 10 },
  loadingDot: { width: 8, height: 8, borderRadius: '50%', background: '#1a6b3c', animation: 'pulse 1.2s ease-in-out infinite', flexShrink: 0 },

  pointsPreview: { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 20, padding: '20px', boxShadow: '0 4px 20px rgba(26,107,60,0.07)' },
  pointsPreviewTitle: { fontSize: 12, fontWeight: 700, color: '#5a7a5a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, textAlign: 'center' },
  pointsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  pointsItem: { textAlign: 'center', padding: '12px 6px', background: 'rgba(255,255,255,0.8)', borderRadius: 14, border: '1px solid rgba(26,107,60,0.1)', display: 'flex', flexDirection: 'column', gap: 4 },
  pointsItemVal: { fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 16, color: '#1a6b3c' },
  pointsItemLabel: { fontSize: 10, color: '#5a7a5a', lineHeight: 1.3 },

  resultsWrap: { maxWidth: 580, margin: '0 auto', padding: '24px 20px 60px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 },

  scoreHero: { borderRadius: 24, padding: '32px 24px', background: 'linear-gradient(135deg, #1a3d1a 0%, #1a6b3c 60%, #2d9b5a 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(26,61,26,0.25)' },
  scoreDecos: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  scoreDeco1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(163,217,119,0.2) 0%, transparent 70%)' },
  scoreDeco2: { position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(82,199,126,0.15) 0%, transparent 70%)' },
  scoreLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 },
  scoreBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 100, height: 100, borderRadius: '50%', fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 40, margin: '0 auto 8px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  scoreSubLabel: { fontSize: 14, fontWeight: 700, marginBottom: 24 },
  scoreStats: { display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.1)' },
  scoreStat: { flex: 1, textAlign: 'center' },
  scoreStatVal: { fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 22, color: 'white', marginBottom: 4 },
  scoreStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 },
  scoreStatDivider: { width: 1, height: 40, background: 'rgba(255,255,255,0.1)' },

  pointsToast: { display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(26,107,60,0.08)', border: '1.5px solid rgba(26,107,60,0.2)', borderRadius: 16, padding: '16px 20px' },
  toastTitle: { fontSize: 16, fontWeight: 800, color: '#1a6b3c', marginBottom: 3 },
  toastSub: { fontSize: 12, color: '#5a7a5a' },

  itemsCard: { background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: '20px', boxShadow: '0 4px 20px rgba(26,107,60,0.07)' },
  itemsTitle: { fontFamily: 'Fraunces, serif', fontWeight: 900, fontSize: 17, color: '#1a3d1a', marginBottom: 14 },
  itemsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  itemRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', background: 'rgba(240,247,240,0.8)', borderRadius: 12, border: '1px solid rgba(26,107,60,0.08)' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: 10, flex: 1 },
  itemDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  itemName: { fontSize: 13, fontWeight: 600, color: '#1a3d1a', marginBottom: 2 },
  itemAlt: { fontSize: 11, color: '#1a6b3c', fontWeight: 500 },
  itemRight: { flexShrink: 0 },
  itemBadge: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap' },

  breakdownCard: { background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: '20px', boxShadow: '0 4px 20px rgba(26,107,60,0.07)', display: 'flex', flexDirection: 'column', gap: 12 },
  barRow: { display: 'flex', alignItems: 'center', gap: 10 },
  barLabel: { fontSize: 12, color: '#1a3d1a', fontWeight: 600, width: 100, flexShrink: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
  barTrack: { flex: 1, height: 8, background: 'rgba(26,107,60,0.08)', borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' },
  barVal: { fontSize: 12, fontWeight: 700, width: 48, textAlign: 'right', flexShrink: 0 },

  actionRow: { display: 'flex', gap: 12 },
}