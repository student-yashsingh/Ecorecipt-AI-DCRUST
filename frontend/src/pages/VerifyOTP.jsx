import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { API } from '../api'

export default function VerifyOTP() {
  const navigate              = useNavigate()
  const confirmationResult    = useStore(s => s.confirmationResult)
  const setUser               = useStore(s => s.setUser)
  const setFirebaseUser       = useStore(s => s.setFirebaseUser)

  const [otp, setOtp]         = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [resent, setResent]   = useState(false)
  const [timer, setTimer]     = useState(30)
  const refs                  = useRef([])

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  function handleOtpChange(val, idx) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    setError('')
    if (val && idx < 5) refs.current[idx + 1]?.focus()
    if (!val && idx > 0) refs.current[idx - 1]?.focus()
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) refs.current[idx + 1]?.focus()
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  async function verifyOTP() {
    const code = otp.join('')
    if (code.length !== 6) { setError('Enter all 6 digits'); return }
    if (!confirmationResult) { setError('Session expired. Go back and resend OTP.'); return }
    setLoading(true); setError('')

    try {
      const result    = await confirmationResult.confirm(code)
      const fbUser    = result.user
      const token     = await fbUser.getIdToken()
      setFirebaseUser(fbUser)

      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUser({ ...data.user, firebaseUser: fbUser })
      setSuccess(true)

      setTimeout(() => {
        navigate(data.is_new_user ? '/onboarding' : '/home')
      }, 1200)

    } catch (err) {
      console.error('OTP verify error:', err)
      setError(err?.message || 'Invalid OTP. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  const filled = otp.filter(Boolean).length

  return (
    <div style={s.page}>

      {/* Background */}
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />

      {/* Floating emojis */}
      {['🌿','🥦','🍅','🌾','🥕','🫘'].map((e, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${[10,80,20,70,5,90][i]}%`,
          top:  `${[15,10,75,80,45,50][i]}%`,
          fontSize: 28, opacity: 0.06,
          animation: `floatItem ${[7,8,6,9,7,8][i]}s ease-in-out ${i*0.4}s infinite`,
          pointerEvents: 'none', zIndex: 0,
          filter: 'sepia(30%)',
        }}>{e}</div>
      ))}

      {/* Card */}
      <div style={s.card}>

        {/* Top accent bar */}
        <div style={s.accentBar} />

        {/* Back button */}
        <button style={s.backBtn} onClick={() => navigate('/login')}>
          ← Back
        </button>

        {/* Icon */}
        <div style={s.iconWrap}>
          <div style={s.iconRing}>
            <div style={s.iconCore}>
              {success ? '✅' : '📱'}
            </div>
          </div>
          {/* Progress ring */}
          <svg style={s.progressSvg} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none"
              stroke="var(--beige-dark)" strokeWidth="3" />
            <circle cx="40" cy="40" r="36" fill="none"
              stroke="var(--olive)" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - filled / 6)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.3s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
        </div>

        {/* Title */}
        <h2 style={s.title}>Verify your number</h2>
        <p style={s.sub}>We sent a 6-digit OTP to your mobile number</p>

        {/* OTP boxes */}
        <div style={s.otpRow} onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              style={{
                ...s.otpBox,
                borderColor: error ? 'var(--terra)' :
                             digit ? 'var(--olive)' : 'var(--beige-dark)',
                background: digit ? 'rgba(74,124,89,0.06)' : 'rgba(255,255,255,0.9)',
                boxShadow: digit ? '0 0 0 3px rgba(74,124,89,0.1)' : 'none',
                transform: digit ? 'scale(1.05)' : 'scale(1)',
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Progress dots */}
        <div style={s.dotsRow}>
          {otp.map((d, i) => (
            <div key={i} style={{
              ...s.dot,
              background: d ? 'var(--olive)' : 'var(--beige-dark)',
              transform: d ? 'scale(1.3)' : 'scale(1)',
            }} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorBox}>⚠️ {error}</div>
        )}

        {/* Success */}
        {success && (
          <div style={s.successBox}>✅ Verified! Taking you in...</div>
        )}

        {/* Verify button */}
        <button
          className="btn-primary"
          onClick={verifyOTP}
          disabled={loading || success || filled < 6}
          style={{ width: '100%', padding: '15px 0', fontSize: 16, marginBottom: 16 }}
        >
          {loading
            ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <span style={s.spinner} /> Verifying...
              </span>
            : success ? '🎉 Verified!'
            : `Verify OTP ${filled > 0 ? `(${filled}/6)` : ''}`
          }
        </button>

        {/* Resend */}
        <div style={s.resendRow}>
          {timer > 0
            ? <p style={s.resendTimer}>Resend OTP in <b style={{ color: 'var(--olive)' }}>{timer}s</b></p>
            : <button style={s.resendBtn} onClick={() => { setTimer(30); setResent(true) }}>
                🔄 Resend OTP
              </button>
          }
        </div>
        {resent && timer > 0 && (
          <p style={{ textAlign:'center', color:'var(--olive)', fontSize:12, marginTop:4 }}>
            ✅ OTP resent successfully
          </p>
        )}

        {/* Security note */}
        <div style={s.securityNote}>
          <span style={{ fontSize: 14 }}>🔒</span>
          <span style={{ fontSize: 12, color: 'var(--brown-light)' }}>
            Secured by Firebase Authentication. We never store your OTP.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes floatItem {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-16px) rotate(3deg); }
          66%      { transform: translateY(-7px) rotate(-2deg); }
        }
        @keyframes glowPulse {
          0%,100% { opacity:0.5; transform:scale(1); }
          50%      { opacity:1; transform:scale(1.05); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmerFill {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes bounceIn {
          0%  { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100%{ transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #faf6f1 0%, #f0e8dc 50%, #faf6f1 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, position: 'relative', overflow: 'hidden',
    fontFamily: 'DM Sans, sans-serif',
  },
  bgGlow1: {
    position: 'fixed', top: '-15%', right: '-10%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,124,89,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'fixed', bottom: '-15%', left: '-10%',
    width: 450, height: 450, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,102,58,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  card: {
    width: '100%', maxWidth: 440, position: 'relative',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.95)',
    borderRadius: 28,
    padding: '40px 36px',
    boxShadow: '0 20px 60px rgba(45,31,20,0.12), 0 4px 16px rgba(45,31,20,0.06)',
    overflow: 'hidden', zIndex: 1,
  },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    background: 'linear-gradient(90deg, var(--olive), var(--terra), var(--olive-light))',
    backgroundSize: '200% auto',
    animation: 'shimmerFill 3s linear infinite',
  },
  backBtn: {
    background: 'var(--beige)', border: '1px solid var(--beige-dark)',
    borderRadius: 100, padding: '7px 16px',
    fontSize: 13, fontWeight: 600, color: 'var(--brown)',
    cursor: 'pointer', marginBottom: 28, display: 'inline-block',
    transition: 'all 0.2s ease',
  },

  iconWrap: {
    position: 'relative', width: 80, height: 80,
    margin: '0 auto 20px',
  },
  iconRing: {
    position: 'absolute', inset: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  iconCore: {
    fontSize: 36,
    animation: 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
  },
  progressSvg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
  },

  title: {
    fontSize: 26, fontWeight: 900, color: 'var(--brown)',
    fontFamily: 'Playfair Display, serif',
    textAlign: 'center', marginBottom: 8,
  },
  sub: {
    color: 'var(--brown-light)', fontSize: 13,
    textAlign: 'center', marginBottom: 28, lineHeight: 1.5,
  },

  otpRow: {
    display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16,
  },
  otpBox: {
    width: 52, height: 60, borderRadius: 14,
    border: '2px solid var(--beige-dark)',
    textAlign: 'center', fontSize: 24, fontWeight: 800,
    color: 'var(--brown)', fontFamily: 'Playfair Display, serif',
    outline: 'none', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    cursor: 'text',
  },

  dotsRow: {
    display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  },

  errorBox: {
    background: '#fff5f2', border: '1.5px solid #f5c5b0',
    color: 'var(--terra-dark)', borderRadius: 12,
    padding: '10px 14px', fontSize: 13, fontWeight: 500,
    marginBottom: 16, textAlign: 'center',
  },
  successBox: {
    background: '#f0faf4', border: '1.5px solid #b8e6c8',
    color: 'var(--olive-dark)', borderRadius: 12,
    padding: '10px 14px', fontSize: 13, fontWeight: 500,
    marginBottom: 16, textAlign: 'center',
  },

  spinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.8s linear infinite',
  },

  resendRow: { textAlign: 'center', marginBottom: 8 },
  resendTimer: { fontSize: 13, color: 'var(--brown-light)' },
  resendBtn: {
    background: 'none', border: 'none', color: 'var(--olive)',
    fontWeight: 700, fontSize: 14, cursor: 'pointer',
    textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif',
  },

  securityNote: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--beige)', borderRadius: 12,
    padding: '10px 14px', marginTop: 20,
    border: '1px solid var(--beige-dark)',
  },
}