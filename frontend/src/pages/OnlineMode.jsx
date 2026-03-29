import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { API } from '../api'

function carbonColor(score) {
  if (score <= 1.0) return { bg: 'rgba(74,124,89,0.12)',  text: '#2d5a3d', label: 'A+' }
  if (score <= 2.5) return { bg: 'rgba(74,124,89,0.08)',  text: '#4a7c59', label: 'A'  }
  if (score <= 5.0) return { bg: 'rgba(212,160,23,0.12)', text: '#8a6000', label: 'B'  }
  if (score <= 10)  return { bg: 'rgba(193,102,58,0.12)', text: '#9a4a25', label: 'C'  }
  return               { bg: 'rgba(180,40,40,0.10)',  text: '#8b0000', label: 'D'  }
}

function ecoGrade(items) {
  if (!items.length) return '—'
  const avg = items.reduce((s, i) => s + (i.carbon_score || 0), 0) / items.length
  if (avg < 1.0)  return 'A+'
  if (avg < 2.5)  return 'A'
  if (avg < 5.0)  return 'B'
  if (avg < 10.0) return 'C'
  if (avg < 15.0) return 'D'
  return 'F'
}

function gradeColor(g) {
  if (g === 'A+' || g === 'A') return '#2d5a3d'
  if (g === 'B')               return '#8a6000'
  if (g === 'C')               return '#9a4a25'
  return                              '#8b0000'
}

// ── PINCODE SCREEN ──
function PincodeScreen({ onConfirm }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const QUICK = [
    { pin: '110001', label: 'Delhi' },
    { pin: '400001', label: 'Mumbai' },
    { pin: '560001', label: 'Bangalore' },
    { pin: '121001', label: 'Faridabad' },
    { pin: '122001', label: 'Gurgaon' },
    { pin: '201301', label: 'Noida' },
  ]

  return (
    <div style={ps.page}>
      <div style={ps.bgBase} />
      <div style={ps.bgGlow1} />
      <div style={ps.bgGlow2} />

      {['🥦','🍅','🥛','🌾','🥕','🫘'].map((e, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${[8,85,15,75,5,90][i]}%`,
          top:  `${[12,8,75,80,45,40][i]}%`,
          fontSize: 30, opacity: 0.06,
          animation: `floatItem ${[7,8,6,9,7,8][i]}s ease-in-out ${i*0.4}s infinite`,
          pointerEvents: 'none', zIndex: 0,
        }}>{e}</div>
      ))}

      <div style={ps.card}>
        <div style={ps.cardAccent} />
        <div style={ps.iconWrap}>
          <div style={ps.icon}>📍</div>
        </div>
        <h2 style={ps.title}>Where are you shopping?</h2>
        <p style={ps.sub}>We'll show live Blinkit products available at your pincode with real-time eco scores.</p>

        <div style={{ marginBottom: 16 }}>
          <label style={ps.label}>Enter Your Pincode</label>
          <input
            style={{
              ...ps.input,
              borderColor: err ? 'var(--terra)' : pin.length === 6 ? 'var(--olive)' : 'var(--beige-dark)',
            }}
            placeholder="e.g. 121001"
            value={pin} maxLength={6}
            onChange={e => { setPin(e.target.value.replace(/\D/g,'')); setErr('') }}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          />
          {err && <p style={ps.err}>{err}</p>}
        </div>

        <p style={ps.quickLabel}>Quick select</p>
        <div style={ps.quickGrid}>
          {QUICK.map((q, i) => (
            <button key={i}
              style={{ ...ps.quickBtn, borderColor: pin === q.pin ? 'var(--olive)' : 'var(--beige-dark)', background: pin === q.pin ? 'rgba(74,124,89,0.08)' : 'var(--beige)' }}
              onClick={() => setPin(q.pin)}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--brown)' }}>{q.label}</div>
              <div style={{ fontSize: 11, color: 'var(--brown-light)' }}>{q.pin}</div>
            </button>
          ))}
        </div>

        <button className="btn-primary"
          style={{ width: '100%', padding: '15px 0', fontSize: 16, marginTop: 8 }}
          onClick={() => {
            if (!/^\d{6}$/.test(pin)) { setErr('Enter a valid 6-digit pincode'); return }
            onConfirm(pin)
          }}
        >
          🛒 Start Shopping
        </button>

        <div style={ps.infoRow}>
          {['🏪 Live Blinkit data','🌿 Real eco scores','⚡ Instant results'].map((t,i) => (
            <span key={i} style={ps.infoBadge}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatItem {
          0%,100% { transform:translateY(0px) rotate(0deg); }
          33%      { transform:translateY(-16px) rotate(3deg); }
          66%      { transform:translateY(-7px) rotate(-2deg); }
        }
        @keyframes shimmerFill {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}

const ps = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 24,
    fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden',
  },
  bgBase: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(145deg, #faf6f1 0%, #f0e8dc 50%, #faf6f1 100%)', zIndex: 0,
  },
  bgGlow1: {
    position: 'fixed', top: '-15%', right: '-10%', width: 450, height: 450,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,124,89,0.09) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  bgGlow2: {
    position: 'fixed', bottom: '-15%', left: '-10%', width: 400, height: 400,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(193,102,58,0.07) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  card: {
    width: '100%', maxWidth: 460, position: 'relative', zIndex: 1,
    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.95)', borderRadius: 28,
    padding: '36px 32px', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(45,31,20,0.12)',
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    background: 'linear-gradient(90deg, var(--olive), var(--terra), var(--olive-light))',
    backgroundSize: '200% auto', animation: 'shimmerFill 3s linear infinite',
  },
  iconWrap: { textAlign: 'center', marginBottom: 16 },
  icon: { fontSize: 52 },
  title: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 26, color: 'var(--brown)', textAlign: 'center', marginBottom: 8,
  },
  sub: { color: 'var(--brown-light)', fontSize: 13, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 },
  label: {
    display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--olive-dark)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
  },
  input: {
    width: '100%', padding: '14px 18px', borderRadius: 14,
    border: '2px solid', fontSize: 18, fontWeight: 700,
    fontFamily: 'Playfair Display, serif', color: 'var(--brown)',
    background: 'rgba(255,255,255,0.9)', outline: 'none',
    transition: 'all 0.3s ease', boxSizing: 'border-box', letterSpacing: '0.1em',
  },
  err: { color: 'var(--terra)', fontSize: 12, marginTop: 6, fontWeight: 600 },
  quickLabel: {
    fontSize: 11, fontWeight: 700, color: 'var(--brown-light)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
  },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 },
  quickBtn: {
    padding: '10px 8px', borderRadius: 12, border: '1.5px solid',
    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
  },
  infoRow: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 },
  infoBadge: {
    background: 'var(--beige)', border: '1px solid var(--beige-dark)',
    borderRadius: 100, padding: '5px 12px', fontSize: 11, fontWeight: 600,
    color: 'var(--brown-light)',
  },
}

// ── PRODUCT CARD ──
function ProductCard({ product, onAdd, inCart }) {
  const c = carbonColor(product.carbon_score)
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{
        ...pc.card,
        opacity: inCart ? 0.7 : 1,
        transform: hov && !inCart ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov ? '0 12px 40px rgba(45,31,20,0.14)' : pc.card.boxShadow,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Carbon badge */}
      <div style={{ ...pc.carbonBadge, background: c.bg, color: c.text }}>
        {c.label} · {product.carbon_score}kg CO₂
      </div>

      {/* Image / emoji */}
      <div style={pc.imgWrap}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={pc.img} onError={e => { e.target.style.display='none' }} />
          : <span style={pc.emoji}>{product.image}</span>
        }
      </div>

      <div style={pc.info}>
        <div style={pc.name}>{product.name}</div>
        <div style={pc.brand}>{product.brand}</div>
        <div style={pc.bottom}>
          <span style={pc.price}>₹{product.price}</span>
          {product.rating > 0 && (
            <span style={pc.rating}>⭐ {parseFloat(product.rating).toFixed(1)}</span>
          )}
        </div>
      </div>

      <button
        style={{
          ...pc.addBtn,
          background: inCart
            ? 'rgba(74,124,89,0.1)'
            : 'linear-gradient(135deg, var(--olive-dark), var(--olive))',
          color: inCart ? 'var(--olive)' : 'white',
          border: inCart ? '1.5px solid rgba(74,124,89,0.3)' : 'none',
        }}
        onClick={() => !inCart && onAdd(product)}
      >
        {inCart ? '✓ Added' : '+ Add'}
      </button>
    </div>
  )
}

const pc = {
  card: {
    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.95)', borderRadius: 18,
    padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
    boxShadow: '0 4px 16px rgba(45,31,20,0.07)',
    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    position: 'relative',
  },
  carbonBadge: {
    fontSize: 10, fontWeight: 700, padding: '3px 8px',
    borderRadius: 100, alignSelf: 'flex-start',
  },
  imgWrap: {
    height: 90, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--beige)',
    borderRadius: 12, overflow: 'hidden',
  },
  img: { width: '100%', height: '100%', objectFit: 'contain' },
  emoji: { fontSize: 44 },
  info: { flex: 1 },
  name: { fontSize: 12, fontWeight: 700, color: 'var(--brown)', lineHeight: 1.3, marginBottom: 2 },
  brand: { fontSize: 10, color: 'var(--brown-light)', marginBottom: 6 },
  bottom: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 16, color: 'var(--brown)' },
  rating: { fontSize: 10, color: 'var(--brown-light)' },
  addBtn: {
    width: '100%', padding: '8px 0', borderRadius: 10,
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.2s ease', fontFamily: 'DM Sans, sans-serif',
  },
}

// ── CART ITEM ──
function CartItem({ item, onRemove, swapProduct, onSwap }) {
  const c = carbonColor(item.carbon_score)
  const hasSwap = item.carbon_score > 2.5 && swapProduct
  return (
    <div style={ci.wrap}>
      <div style={ci.top}>
        <span style={ci.emoji}>{item.image}</span>
        <div style={{ flex: 1 }}>
          <div style={ci.name}>{item.raw_name}</div>
          <div style={ci.meta}>
            <span style={ci.price}>₹{item.price}</span>
            <span style={{ ...ci.badge, background: c.bg, color: c.text }}>
              {c.label} · {item.carbon_score}kg
            </span>
          </div>
        </div>
        <button style={ci.removeBtn} onClick={() => onRemove(item.id)}>✕</button>
      </div>
      {hasSwap && (
        <button style={ci.swapBtn} onClick={() => onSwap(item, swapProduct)}>
          🌱 Swap → {swapProduct.raw_name} · ₹{swapProduct.price} · {swapProduct.carbon_score}kg CO₂
        </button>
      )}
    </div>
  )
}

const ci = {
  wrap: {
    background: 'var(--beige)', borderRadius: 14,
    padding: '12px 14px', marginBottom: 10,
    border: '1px solid var(--beige-dark)',
  },
  top: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  emoji: { fontSize: 24, flexShrink: 0 },
  name: { fontSize: 12, fontWeight: 700, color: 'var(--brown)', marginBottom: 4, lineHeight: 1.3 },
  meta: { display: 'flex', alignItems: 'center', gap: 8 },
  price: { fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 14, color: 'var(--brown)' },
  badge: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 },
  removeBtn: {
    background: 'none', border: 'none', color: 'var(--brown-light)',
    cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: 2,
  },
  swapBtn: {
    width: '100%', marginTop: 8, padding: '7px 10px',
    background: 'rgba(74,124,89,0.08)', border: '1px solid rgba(74,124,89,0.2)',
    borderRadius: 10, color: 'var(--olive-dark)', fontSize: 11,
    fontWeight: 600, cursor: 'pointer', textAlign: 'left',
    fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4,
  },
}

// ── VERIFY SCREEN ──
function VerifyScreen({ sessionId, token, onDone }) {
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [err, setErr]               = useState('')
  const [elapsed, setElapsed]       = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  async function handleVerify() {
    if (!screenshot) { setErr('Please upload your order screenshot'); return }
    setLoading(true); setErr('')
    const form = new FormData()
    form.append('screenshot', screenshot)
    form.append('session_id', sessionId)
    try {
      const res  = await fetch(`${API}/api/online/verify-purchase`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
      })
      setResult(await res.json())
    } catch { setErr('Verification failed. Try again.') }
    setLoading(false)
  }

  if (result) return (
    <div style={vs.page}>
      <div style={vs.bgBase} />
      <div style={vs.card}>
        <div style={vs.cardAccent} />
        <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>🎉</div>
        <h2 style={vs.title}>Order Verified!</h2>
        <div style={vs.pointsWrap}>
          <div style={vs.pointsVal}>+{result.points_earned}</div>
          <div style={vs.pointsLabel}>points earned</div>
        </div>
        <div style={vs.resultStats}>
          <div style={vs.rStat}>
            <div style={vs.rStatVal}>{result.eco_score}</div>
            <div style={vs.rStatLabel}>Eco Score</div>
          </div>
          <div style={vs.rStat}>
            <div style={vs.rStatVal}>{result.items_confirmed?.length || 0}</div>
            <div style={vs.rStatLabel}>Items Confirmed</div>
          </div>
        </div>
        <button className="btn-primary" style={{ width:'100%', padding:'14px 0', fontSize:15 }}
          onClick={onDone}>
          🏠 Back to Home
        </button>
      </div>
    </div>
  )

  return (
    <div style={vs.page}>
      <div style={vs.bgBase} />
      <div style={vs.card}>
        <div style={vs.cardAccent} />
        <div style={{ fontSize: 52, textAlign: 'center', marginBottom: 12 }}>⏱️</div>
        <h2 style={vs.title}>Complete your order</h2>
        <p style={vs.sub}>
          Time since redirect: <b style={{ color: 'var(--olive)' }}>{fmt(elapsed)}</b>
        </p>
        <p style={vs.sub}>Place your order on Blinkit, then come back and upload your confirmation screenshot.</p>

        <div style={vs.timerBar}>
          <div style={{ ...vs.timerFill, width: `${Math.min(elapsed/300*100, 100)}%` }} />
        </div>

        <label style={vs.uploadBox}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>
            {screenshot ? '✅' : '📸'}
          </div>
          <div style={{ fontWeight: 700, color: 'var(--brown)', marginBottom: 4, fontSize: 14 }}>
            {screenshot ? screenshot.name : 'Upload Order Screenshot'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--brown-light)' }}>
            {screenshot ? 'Tap to change' : 'Tap to browse or take photo'}
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => setScreenshot(e.target.files[0])} />
        </label>

        {err && <div style={vs.err}>⚠️ {err}</div>}

        <button className="btn-primary"
          style={{ width: '100%', padding: '15px 0', fontSize: 15 }}
          onClick={handleVerify} disabled={loading}
        >
          {loading
            ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <span style={vs.spinner} /> Verifying with AI...
              </span>
            : '✅ Verify My Order'
          }
        </button>
      </div>
      <style>{`
        @keyframes shimmerFill {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const vs = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 24,
    fontFamily: 'DM Sans, sans-serif', position: 'relative',
    background: 'linear-gradient(145deg, #faf6f1 0%, #f0e8dc 50%, #faf6f1 100%)',
  },
  bgBase: { position:'fixed', inset:0, background:'linear-gradient(145deg,#faf6f1,#f0e8dc,#faf6f1)', zIndex:0 },
  card: {
    width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.95)', borderRadius: 28,
    padding: '36px 28px', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(45,31,20,0.12)',
  },
  cardAccent: {
    position:'absolute', top:0, left:0, right:0, height:4,
    background:'linear-gradient(90deg,var(--olive),var(--terra),var(--olive-light))',
    backgroundSize:'200% auto', animation:'shimmerFill 3s linear infinite',
  },
  title: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 26, color: 'var(--brown)', textAlign: 'center', marginBottom: 8,
  },
  sub: { color:'var(--brown-light)', fontSize:13, textAlign:'center', lineHeight:1.6, marginBottom:12 },
  timerBar: {
    height: 4, background: 'var(--beige-dark)', borderRadius: 10,
    overflow: 'hidden', marginBottom: 20,
  },
  timerFill: {
    height: '100%', borderRadius: 10,
    background: 'linear-gradient(90deg, var(--olive), var(--terra))',
    transition: 'width 1s linear',
  },
  uploadBox: {
    display: 'block', border: '2px dashed var(--beige-dark)',
    borderRadius: 16, padding: '24px 16px',
    textAlign: 'center', cursor: 'pointer',
    background: 'var(--beige)', marginBottom: 16,
    transition: 'all 0.2s ease',
  },
  err: {
    background: '#fff5f2', border: '1.5px solid #f5c5b0',
    color: 'var(--terra-dark)', borderRadius: 12,
    padding: '10px 14px', fontSize: 13, fontWeight: 500, marginBottom: 14,
  },
  spinner: {
    width:18, height:18, border:'2px solid rgba(255,255,255,0.3)',
    borderTop:'2px solid white', borderRadius:'50%',
    display:'inline-block', animation:'spin 0.8s linear infinite',
  },
  pointsWrap: { textAlign:'center', margin:'16px 0' },
  pointsVal: {
    fontFamily:'Playfair Display, serif', fontWeight:900,
    fontSize:56, color:'var(--olive-dark)', lineHeight:1,
  },
  pointsLabel: { fontSize:14, color:'var(--brown-light)', fontWeight:600 },
  resultStats: {
    display:'flex', gap:16, marginBottom:20,
    background:'var(--beige)', borderRadius:14, padding:'14px',
    border:'1px solid var(--beige-dark)',
  },
  rStat: { flex:1, textAlign:'center' },
  rStatVal: { fontFamily:'Playfair Display, serif', fontWeight:900, fontSize:24, color:'var(--brown)' },
  rStatLabel: { fontSize:11, color:'var(--brown-light)', marginTop:3 },
}

// ── MAIN COMPONENT ──
export default function OnlineMode() {
  const navigate     = useNavigate()
  const firebaseUser = useStore(s => s.firebaseUser)
  const [phase, setPhase]         = useState('pincode')
  const [pincode, setPincode]     = useState('')
  const [query, setQuery]         = useState('')
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [cart, setCart]           = useState([])
  const [swapped, setSwapped]     = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [token, setToken]         = useState(null)
  const [searchErr, setSearchErr] = useState('')
  const [cartOpen, setCartOpen]   = useState(false)

  useEffect(() => {
    if (firebaseUser) firebaseUser.getIdToken().then(setToken)
  }, [firebaseUser])

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true); setSearchErr(''); setProducts([])
    try {
      const res  = await fetch(`${API}/api/online/search?query=${encodeURIComponent(query)}&pincode=${pincode}`)
      const data = await res.json()
      if (!data.results?.length) setSearchErr('No products found. Try another search.')
      setProducts(data.results || [])
    } catch { setSearchErr('Could not reach server. Is backend running?') }
    setLoading(false)
  }

  function addToCart(p) {
    if (cart.find(c => c.id === p.id)) return
    setCart(prev => [...prev, p])
    setCartOpen(true)
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p.id !== id))
    setSwapped(prev => prev.filter(i => i !== id))
  }

  function findSwap(item) {
    return products.find(p =>
      p.id !== item.id &&
      p.carbon_score < item.carbon_score &&
      !cart.find(c => c.id === p.id)
    ) || null
  }

  function handleSwap(item, swapProduct) {
    setCart(prev => prev.map(p => p.id === item.id ? swapProduct : p))
    setSwapped(prev => [...prev, swapProduct.id])
  }

  function optimiseAll() {
    let updated = [...cart]
    cart.forEach(item => {
      if (item.carbon_score > 2.5) {
        const swap = products.find(p =>
          p.id !== item.id && p.carbon_score < item.carbon_score &&
          !updated.find(c => c.id === p.id)
        )
        if (swap) {
          updated = updated.map(p => p.id === item.id ? swap : p)
          setSwapped(prev => [...prev, swap.id])
        }
      }
    })
    setCart(updated)
  }

  async function handleRedirect() {
    if (!cart.length) return
    const totalCarbon = cart.reduce((s, i) => s + i.carbon_score, 0)
    try {
      const res  = await fetch(`${API}/api/online/cart/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pincode, items: cart, alternatives_accepted: swapped.length, total_carbon: totalCarbon }),
      })
      const data = await res.json()
      setSessionId(data.session_id)
      await fetch(`${API}/api/online/redirect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ session_id: data.session_id }),
      })
    } catch (e) { console.error(e) }
    window.open('https://blinkit.com', '_blank')
    setPhase('verify')
  }

  const totalCarbon = cart.reduce((s, i) => s + (i.carbon_score || 0), 0).toFixed(1)
  const totalPrice  = cart.reduce((s, i) => s + (i.price || 0), 0).toFixed(0)
  const grade       = ecoGrade(cart)
  const gradeClr    = gradeColor(grade)

  if (phase === 'pincode') return <PincodeScreen onConfirm={p => { setPincode(p); setPhase('shop') }} />
  if (phase === 'verify')  return <VerifyScreen sessionId={sessionId} token={token} onDone={() => navigate('/home')} />

  return (
    <div style={ms.page}>
      <div style={ms.bgBase} />

      {/* ── NAVBAR ── */}
      <nav style={ms.nav}>
        <button style={ms.navBack} onClick={() => setPhase('pincode')}>
          📍 {pincode}
        </button>
        <span style={ms.navTitle}>Online Mode</span>
        <button style={ms.cartToggle} onClick={() => setCartOpen(o => !o)}>
          🛒 <span style={ms.cartCount}>{cart.length}</span>
        </button>
      </nav>

      <div style={ms.layout}>

        {/* ── LEFT: Search + Products ── */}
        <div style={ms.left}>

          {/* Search bar */}
          <div style={ms.searchWrap}>
            <input
              style={ms.searchInput}
              placeholder="Search groceries... butter, milk, rice"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              style={ms.searchBtn}
              onClick={handleSearch} disabled={loading}
            >
              {loading ? <span style={ms.spinner} /> : '🔍 Search'}
            </button>
          </div>

          {searchErr && <p style={ms.searchErr}>{searchErr}</p>}

          {loading && (
            <div style={ms.loadingState}>
              <div style={{ fontSize: 32 }}>🔍</div>
              <p style={{ color: 'var(--brown-light)', fontSize: 14 }}>Searching Blinkit...</p>
            </div>
          )}

          {!loading && !products.length && !searchErr && (
            <div style={ms.emptyState}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🛒</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--brown)', marginBottom: 8 }}>
                Search for groceries
              </h3>
              <p style={{ color: 'var(--brown-light)', fontSize: 13 }}>
                Type any grocery item above to see live Blinkit products with eco scores
              </p>
              <div style={ms.quickSearches}>
                {['butter','milk','rice','eggs','bread','dal'].map((q, i) => (
                  <button key={i} style={ms.quickSearch}
                    onClick={() => { setQuery(q); setTimeout(handleSearch, 100) }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={ms.productGrid}>
            {products.map(p => (
              <ProductCard key={p.id} product={p}
                onAdd={addToCart}
                inCart={!!cart.find(c => c.id === p.id)}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT: Cart ── */}
        <div style={{
          ...ms.cartPanel,
          transform: cartOpen ? 'translateX(0)' : 'translateX(100%)',
        }}>
          <div style={ms.cartHeader}>
            <h3 style={ms.cartTitle}>🛒 Cart ({cart.length})</h3>
            <button style={ms.cartClose} onClick={() => setCartOpen(false)}>✕</button>
          </div>

          {!cart.length ? (
            <div style={ms.cartEmpty}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
              <p style={{ color: 'var(--brown-light)', fontSize: 13 }}>Add products to see eco scores</p>
            </div>
          ) : (
            <>
              <div style={ms.cartItems}>
                {cart.map(item => (
                  <CartItem key={item.id} item={item}
                    onRemove={removeFromCart}
                    swapProduct={findSwap(item)}
                    onSwap={handleSwap}
                  />
                ))}
              </div>

              {/* Cart summary */}
              <div style={ms.cartSummary}>
                <div style={ms.summaryRow}>
                  <span style={ms.summaryLabel}>Total CO₂</span>
                  <span style={ms.summaryVal}>{totalCarbon} kg</span>
                </div>
                <div style={ms.summaryRow}>
                  <span style={ms.summaryLabel}>Total Price</span>
                  <span style={ms.summaryVal}>₹{totalPrice}</span>
                </div>
                <div style={ms.summaryRow}>
                  <span style={ms.summaryLabel}>Eco Score</span>
                  <span style={{ ...ms.summaryVal, color: gradeClr, fontSize: 22, fontFamily: 'Playfair Display, serif' }}>
                    {grade}
                  </span>
                </div>
              </div>

              <button style={ms.optimiseBtn} onClick={optimiseAll}>
                🌿 Optimise All
              </button>
              <button className="btn-terra" style={{ width:'100%', padding:'14px 0', fontSize:15 }}
                onClick={handleRedirect}>
                Order on Blinkit →
              </button>
            </>
          )}
        </div>

        {/* Cart overlay for mobile */}
        {cartOpen && (
          <div style={ms.overlay} onClick={() => setCartOpen(false)} />
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glowPulse {
          0%,100% { opacity:0.5; } 50% { opacity:1; }
        }
      `}</style>
    </div>
  )
}

const ms = {
  page: { minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', position: 'relative', overflow: 'hidden' },
  bgBase: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(145deg, #faf6f1 0%, #f0e8dc 50%, #faf6f1 100%)', zIndex: 0,
  },

  nav: {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'rgba(250,246,241,0.92)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(45,31,20,0.07)',
  },
  navBack: {
    background: 'var(--beige)', border: '1px solid var(--beige-dark)',
    borderRadius: 100, padding: '7px 14px',
    fontSize: 13, fontWeight: 700, color: 'var(--brown)', cursor: 'pointer',
  },
  navTitle: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 17, color: 'var(--brown)',
  },
  cartToggle: {
    background: 'linear-gradient(135deg, var(--olive-dark), var(--olive))',
    border: 'none', borderRadius: 100, padding: '8px 16px',
    fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  cartCount: {
    background: 'var(--terra)', color: 'white',
    borderRadius: '50%', width: 20, height: 20,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 800,
  },

  layout: { display: 'flex', height: 'calc(100vh - 53px)', position: 'relative', zIndex: 1 },

  left: {
    flex: 1, overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },

  searchWrap: { display: 'flex', gap: 10 },
  searchInput: {
    flex: 1, padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid var(--beige-dark)',
    background: 'rgba(255,255,255,0.9)',
    fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    color: 'var(--brown)', outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  searchBtn: {
    padding: '12px 18px', borderRadius: 12,
    background: 'linear-gradient(135deg, var(--olive-dark), var(--olive))',
    border: 'none', color: 'white', fontWeight: 700,
    fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 6,
    fontFamily: 'DM Sans, sans-serif',
  },
  spinner: {
    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.8s linear infinite',
  },
  searchErr: { color: 'var(--terra)', fontSize: 13, fontWeight: 600 },

  loadingState: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60,
  },
  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px', textAlign: 'center',
  },
  quickSearches: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 },
  quickSearch: {
    background: 'var(--beige)', border: '1px solid var(--beige-dark)',
    borderRadius: 100, padding: '7px 16px',
    fontSize: 13, fontWeight: 600, color: 'var(--brown)', cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
  },

  // Cart panel
  cartPanel: {
    width: 300, background: 'rgba(250,246,241,0.96)',
    backdropFilter: 'blur(20px)',
    borderLeft: '1px solid var(--beige-dark)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', right: 0, top: 53,
    bottom: 0, zIndex: 40, padding: 16,
    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    overflowY: 'auto',
  },
  cartHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  cartTitle: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 18, color: 'var(--brown)', margin: 0,
  },
  cartClose: {
    background: 'var(--beige)', border: '1px solid var(--beige-dark)',
    borderRadius: '50%', width: 28, height: 28,
    cursor: 'pointer', fontSize: 13, color: 'var(--brown)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cartEmpty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: 20,
  },
  cartItems: { flex: 1, overflowY: 'auto' },
  cartSummary: {
    background: 'rgba(255,255,255,0.8)', borderRadius: 14,
    padding: '14px', margin: '12px 0',
    border: '1px solid var(--beige-dark)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: 'var(--brown-light)', fontWeight: 600 },
  summaryVal: { fontWeight: 800, color: 'var(--brown)', fontSize: 15 },
  optimiseBtn: {
    width: '100%', padding: '11px 0', marginBottom: 8,
    background: 'rgba(74,124,89,0.1)', border: '1.5px solid rgba(74,124,89,0.25)',
    borderRadius: 12, color: 'var(--olive-dark)', fontWeight: 700,
    fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(28,18,8,0.3)',
    zIndex: 35,
  },
}