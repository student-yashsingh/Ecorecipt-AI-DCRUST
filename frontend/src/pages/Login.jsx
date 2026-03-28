import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase'
import useStore from '../store/useStore'

const FLOATING = [
  { emoji: '🥦', x: 8,  y: 10, size: 36, dur: 7, delay: 0   },
  { emoji: '🍅', x: 85, y: 8,  size: 30, dur: 8, delay: 0.8 },
  { emoji: '🥛', x: 12, y: 72, size: 32, dur: 6, delay: 0.4 },
  { emoji: '🧈', x: 80, y: 65, size: 28, dur: 9, delay: 1.2 },
  { emoji: '🌾', x: 50, y: 88, size: 34, dur: 7, delay: 0.6 },
  { emoji: '🥕', x: 90, y: 35, size: 26, dur: 8, delay: 1.5 },
  { emoji: '🫘', x: 5,  y: 45, size: 24, dur: 6, delay: 1.0 },
  { emoji: '🍋', x: 60, y: 5,  size: 28, dur: 9, delay: 0.2 },
  { emoji: '🧄', x: 30, y: 92, size: 22, dur: 7, delay: 1.8 },
  { emoji: '🥚', x: 72, y: 85, size: 24, dur: 8, delay: 0.9 },
]

const TYPEWORDS = [
  'Track your carbon footprint.',
  'Earn points for eco choices.',
  'Shop greener on Blinkit.',
  'Build your eco streak.',
  'Make every meal count.',
]

function useTypewriter(words, speed = 75, pause = 2000) {
  const [idx, setIdx]       = useState(0)
  const [sub, setSub]       = useState(0)
  const [del, setDel]       = useState(false)
  const [text, setText]     = useState('')

  useEffect(() => {
    if (!del && sub === words[idx].length) {
      const t = setTimeout(() => setDel(true), pause)
      return () => clearTimeout(t)
    }
    if (del && sub === 0) {
      setDel(false)
      setIdx(i => (i + 1) % words.length)
      return
    }
    const t = setTimeout(() => {
      setSub(s => s + (del ? -1 : 1))
      setText(words[idx].substring(0, sub + (del ? -1 : 1)))
    }, del ? speed / 2 : speed)
    return () => clearTimeout(t)
  }, [sub, del, idx])

  return text
}

export default function Login() {
  const navigate              = useNavigate()
  const setConfirmationResult = useStore(s => s.setConfirmationResult)
  const [phone, setPhone]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)
  const [focused, setFocused] = useState(false)

  const typed = useTypewriter(TYPEWORDS)

  async function sendOTP() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    setError(''); setLoading(true)
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth, 'recaptcha-container', { size: 'invisible' }
        )
      }
      const result = await signInWithPhoneNumber(auth, `+91${digits}`, window.recaptchaVerifier)
      setConfirmationResult(result)
      setSent(true)
      setTimeout(() => navigate('/verify'), 900)
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Try again.')
      window.recaptchaVerifier = null
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>

      {/* ── Background texture ── */}
      <div style={s.bgBase} />
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />

      {/* ── Floating groceries ── */}
      {FLOATING.map((f, i) => (
        <div key={i} style={{
          position: 'fixed', left: `${f.x}%`, top: `${f.y}%`,
          fontSize: f.size, opacity: 0.07,
          animation: `floatItem ${f.dur}s ease-in-out ${f.delay}s infinite`,
          pointerEvents: 'none', zIndex: 0,
          filter: 'sepia(30%) saturate(70%)',
        }}>{f.emoji}</div>
      ))}

      {/* ── LEFT PANEL ── */}
      <div style={s.left}>
        <div style={s.leftInner}>

          {/* Logo */}
          <div style={s.logoRow}>
            <div style={s.logoIcon}>🌿</div>
            <span style={s.logoText}>EcoReceipt <span style={s.logoAI}>AI</span></span>
          </div>

          {/* Main visual */}
          <div style={s.heroVisual}>
            {/* Rotating ring */}
            <div style={s.ringOuter}>
              {['🥦','🍅','🥛','🌾','🧈','🥕'].map((e, i) => (
                <div key={i} style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 44, height: 44, marginTop: -22, marginLeft: -22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                  transform: `rotate(${i * 60}deg) translateX(110px) rotate(-${i * 60}deg)`,
                  animation: `counterSpin 16s linear infinite`,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                }}>{e}</div>
              ))}
              <div style={s.ringInner}>
                <div style={s.ringCore}>
                  <span style={{ fontSize: 52 }}>🌿</span>
                </div>
              </div>
            </div>

            {/* Typewriter */}
            <div style={s.typeBox}>
              <span style={s.typeText}>{typed}</span>
              <span style={s.typeCursor}>|</span>
            </div>

            {/* Stats */}
            <div style={s.statsRow}>
              {[
                { val: '2.4kg', label: 'CO₂ Saved Daily', icon: '🌍' },
                { val: '500+', label: 'Eco Warriors',     icon: '🏆' },
                { val: '₹0.10', label: 'Per Point',       icon: '💰' },
              ].map((st, i) => (
                <div key={i} style={s.statCard}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{st.icon}</div>
                  <div style={s.statVal}>{st.val}</div>
                  <div style={s.statLabel}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier badges */}
          <div style={s.tierRow}>
            {[
              { t: '🥉 Bronze',   c: 'rgba(205,127,50,0.3)',  b: 'rgba(205,127,50,0.6)'  },
              { t: '🥈 Silver',   c: 'rgba(192,192,192,0.3)', b: 'rgba(192,192,192,0.6)' },
              { t: '🥇 Gold',     c: 'rgba(255,215,0,0.3)',   b: 'rgba(255,215,0,0.6)'   },
              { t: '💎 Platinum', c: 'rgba(0,180,216,0.3)',   b: 'rgba(0,180,216,0.6)'   },
            ].map((ti, i) => (
              <div key={i} style={{ ...s.tierBadge, background: ti.c, border: `1px solid ${ti.b}` }}>
                {ti.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={s.right}>
        <div style={s.formCard}>

          {/* Card top accent */}
          <div style={s.cardAccent} />

          {/* Header */}
          <div style={s.cardHeader}>
            <div style={s.cardEmoji}>👋</div>
            <h2 style={s.cardTitle}>Welcome back</h2>
            <p style={s.cardSub}>Enter your mobile to continue your eco journey</p>
          </div>

          {/* Grocery strip */}
          <div style={s.groceryStrip}>
            {['🥦','🥛','🍅','🌾','🧈','🥕','🫘','🍋'].map((e, i) => (
              <span key={i} style={{ fontSize: 20, filter: 'saturate(80%)' }}>{e}</span>
            ))}
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Mobile Number</label>
            <div style={s.inputRow}>
              <div style={s.countryCode}>🇮🇳 +91</div>
              <input
                style={{
                  ...s.input,
                  borderColor: focused ? 'var(--olive)' : error ? '#c1663a' : 'var(--beige-dark)',
                  boxShadow: focused ? '0 0 0 4px rgba(74,124,89,0.12)' : 'none',
                }}
                type="tel"
                placeholder="98765 43210"
                maxLength={10}
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={e => e.key === 'Enter' && sendOTP()}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Success */}
          {sent && (
            <div style={s.successBox}>
              <span>✅</span> OTP sent! Redirecting...
            </div>
          )}

          {/* Button */}
          <button
            className="btn-primary"
            onClick={sendOTP}
            disabled={loading || sent || phone.length < 10}
            style={{ width: '100%', padding: '15px 0', fontSize: 16, marginBottom: 24 }}
          >
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={s.spinner} /> Sending OTP...
                </span>
              : <>Continue <span style={{ marginLeft: 6 }}>→</span></>
            }
          </button>

          {/* Divider */}
          <div style={s.divider}>
            <div style={s.divLine} />
            <span style={s.divText}>secure & private</span>
            <div style={s.divLine} />
          </div>

          {/* Trust row */}
          <div style={s.trustRow}>
            {[
              { icon: '🔒', title: 'OTP Auth',    sub: 'Firebase secured' },
              { icon: '🌿', title: 'Eco Rewards',  sub: 'Earn every shop'  },
              { icon: '🤖', title: 'Gemini AI',    sub: 'Smart analysis'   },
            ].map((b, i) => (
              <div key={i} style={s.trustCard}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{b.icon}</div>
                <div style={s.trustTitle}>{b.title}</div>
                <div style={s.trustSub}>{b.sub}</div>
              </div>
            ))}
          </div>

          <p style={s.footer}>
            By continuing you agree to our Terms.<br />
            <span style={{ color: 'var(--olive)' }}>Your data is never sold.</span>
          </p>
        </div>
      </div>

      <div id="recaptcha-container" />

      <style>{`
        @keyframes floatItem {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-18px) rotate(4deg); }
          66%      { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes counterSpin {
          from { transform: rotate(0deg) translateX(0); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.06); }
        }
        @keyframes cursorBlink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .login-left { display: none !important; }
          .login-right { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}

const s = {
  page: {
    display: 'flex', minHeight: '100vh',
    background: 'var(--cream)', fontFamily: 'DM Sans, sans-serif',
    position: 'relative', overflow: 'hidden',
  },
  bgBase: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(145deg, #faf6f1 0%, #f0e8dc 50%, #faf6f1 100%)',
    zIndex: 0,
  },
  bgGlow1: {
    position: 'fixed', top: '-10%', right: '-5%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,124,89,0.08) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  bgGlow2: {
    position: 'fixed', bottom: '-10%', left: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,102,58,0.07) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },

  // LEFT
  left: {
    width: '52%', position: 'relative', zIndex: 1,
    background: 'linear-gradient(160deg, #1c1208 0%, #2d1f14 45%, #3a2518 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  leftInner: {
    padding: '48px 52px', width: '100%',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', height: '100%',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 46, height: 46, borderRadius: 14,
    background: 'rgba(74,124,89,0.25)',
    border: '1px solid rgba(74,124,89,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
  },
  logoText: {
    color: 'var(--cream)', fontFamily: 'Playfair Display, serif',
    fontWeight: 900, fontSize: 22,
  },
  logoAI: { color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 },

  heroVisual: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 32,
  },

  ringOuter: {
    position: 'relative', width: 260, height: 260,
    animation: 'ringRotate 20s linear infinite',
  },
  ringInner: {
    position: 'absolute', inset: 30, borderRadius: '50%',
    border: '1px dashed rgba(193,102,58,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ringCore: {
    width: 110, height: 110, borderRadius: '50%',
    background: 'linear-gradient(135deg, #2d5a3d, #4a7c59)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 50px rgba(74,124,89,0.4), 0 0 100px rgba(74,124,89,0.15)',
    animation: 'glowPulse 3s ease-in-out infinite',
  },

  typeBox: {
    background: 'rgba(255,255,255,0.06)', borderRadius: 14,
    padding: '12px 24px', border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: 4, minHeight: 48,
  },
  typeText: {
    color: 'rgba(250,246,241,0.8)', fontSize: 15,
    fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
    letterSpacing: '0.03em',
  },
  typeCursor: {
    color: 'var(--terra-light)', fontSize: 18,
    animation: 'cursorBlink 1s step-end infinite',
  },

  statsRow: { display: 'flex', gap: 12, width: '100%' },
  statCard: {
    flex: 1, background: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: '16px 10px', textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  statVal: {
    color: 'var(--cream)', fontWeight: 800, fontSize: 22,
    fontFamily: 'Playfair Display, serif',
  },
  statLabel: { color: 'rgba(250,246,241,0.45)', fontSize: 10, marginTop: 3, fontWeight: 500 },

  tierRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tierBadge: {
    padding: '6px 14px', borderRadius: 100,
    fontSize: 12, fontWeight: 700, color: 'var(--cream)',
  },

  // RIGHT
  right: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '32px 24px',
    position: 'relative', zIndex: 1,
  },
  formCard: {
    width: '100%', maxWidth: 420, position: 'relative',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.95)',
    borderRadius: 28,
    padding: '36px 32px',
    boxShadow: '0 20px 60px rgba(45,31,20,0.12), 0 4px 16px rgba(45,31,20,0.06)',
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    background: 'linear-gradient(90deg, var(--olive), var(--terra), var(--olive-light))',
    backgroundSize: '200% auto',
    animation: 'shimmerFill 3s linear infinite',
  },
  cardHeader: { textAlign: 'center', marginBottom: 20 },
  cardEmoji: { fontSize: 42, marginBottom: 8 },
  cardTitle: {
    fontSize: 28, fontWeight: 900, color: 'var(--brown)',
    fontFamily: 'Playfair Display, serif', marginBottom: 6,
  },
  cardSub: { color: 'var(--brown-light)', fontSize: 13, lineHeight: 1.5 },

  groceryStrip: {
    display: 'flex', justifyContent: 'space-between',
    background: 'var(--beige)', borderRadius: 12,
    padding: '8px 14px', marginBottom: 20,
    border: '1px solid var(--beige-dark)',
  },

  label: {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: 'var(--olive-dark)', textTransform: 'uppercase',
    letterSpacing: '0.08em', marginBottom: 8,
  },
  inputRow: { display: 'flex', gap: 10 },
  countryCode: {
    background: 'var(--beige)', border: '1.5px solid var(--beige-dark)',
    borderRadius: 12, padding: '13px 14px',
    fontWeight: 700, color: 'var(--brown)', fontSize: 14,
    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
  },
  input: {
    flex: 1, background: 'rgba(255,255,255,0.9)',
    border: '1.5px solid var(--beige-dark)',
    borderRadius: 12, padding: '13px 16px',
    fontSize: 16, fontFamily: 'DM Sans, sans-serif',
    color: 'var(--warm-black)', outline: 'none',
    transition: 'all 0.3s ease',
  },

  errorBox: {
    background: '#fff5f2', border: '1.5px solid #f5c5b0',
    color: 'var(--terra-dark)', borderRadius: 12,
    padding: '10px 14px', fontSize: 13, fontWeight: 500,
    marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
  },
  successBox: {
    background: '#f0faf4', border: '1.5px solid #b8e6c8',
    color: 'var(--olive-dark)', borderRadius: 12,
    padding: '10px 14px', fontSize: 13, fontWeight: 500,
    marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
  },

  spinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.8s linear infinite',
  },

  divider: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  divLine: { flex: 1, height: 1, background: 'var(--beige-dark)' },
  divText: { fontSize: 11, color: 'var(--brown-light)', whiteSpace: 'nowrap' },

  trustRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 },
  trustCard: {
    textAlign: 'center', padding: '14px 8px',
    background: 'var(--beige)', borderRadius: 14,
    border: '1px solid var(--beige-dark)',
  },
  trustTitle: { fontSize: 11, fontWeight: 700, color: 'var(--brown)', marginBottom: 2 },
  trustSub: { fontSize: 10, color: 'var(--brown-light)' },

  footer: {
    textAlign: 'center', fontSize: 11,
    color: 'var(--brown-light)', lineHeight: 1.7,
  },
}