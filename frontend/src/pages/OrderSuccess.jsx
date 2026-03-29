import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const CONFETTI = [
  { color: '#4a7c59', x: 10, delay: 0,   dur: 3.2 },
  { color: '#c1663a', x: 25, delay: 0.3, dur: 2.8 },
  { color: '#d4a017', x: 40, delay: 0.1, dur: 3.5 },
  { color: '#7aab8a', x: 55, delay: 0.5, dur: 2.6 },
  { color: '#cd7f32', x: 70, delay: 0.2, dur: 3.0 },
  { color: '#4a7c59', x: 85, delay: 0.4, dur: 2.9 },
  { color: '#c1663a', x: 15, delay: 0.6, dur: 3.3 },
  { color: '#d4a017', x: 60, delay: 0.1, dur: 2.7 },
  { color: '#7aab8a', x: 75, delay: 0.7, dur: 3.1 },
  { color: '#cd7f32', x: 90, delay: 0.3, dur: 2.8 },
  { color: '#4a7c59', x: 35, delay: 0.8, dur: 3.4 },
  { color: '#c1663a', x: 50, delay: 0.2, dur: 2.9 },
  { color: '#d4a017', x: 5,  delay: 0.9, dur: 3.0 },
  { color: '#7aab8a', x: 45, delay: 0.4, dur: 2.6 },
  { color: '#cd7f32', x: 80, delay: 0.6, dur: 3.2 },
  { color: '#4a7c59', x: 20, delay: 1.0, dur: 2.8 },
  { color: '#c1663a', x: 65, delay: 0.5, dur: 3.5 },
  { color: '#d4a017', x: 95, delay: 0.3, dur: 2.7 },
]

function AnimatedNumber({ target, duration = 1500 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let v = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      v = Math.min(v + step, target)
      setVal(Math.floor(v))
      if (v >= target) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return val.toLocaleString()
}

export default function OrderSuccess() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [show, setShow] = useState(false)
  const [ring, setRing] = useState(0)

  // Accept points/eco_score/items_confirmed from navigation state
  const {
    points_earned    = 85,
    eco_score        = 'B',
    items_confirmed  = [],
    carbon_saved     = 1.2,
  } = location.state || {}

  useEffect(() => {
    setTimeout(() => setShow(true), 100)
    // Ring fill animation
    const t = setInterval(() => {
      setRing(r => {
        if (r >= 100) { clearInterval(t); return 100 }
        return r + 1.5
      })
    }, 20)
    return () => clearInterval(t)
  }, [])

  const gradeColor = {
    'A+': '#2d5a3d', 'A': '#4a7c59', 'B': '#8a6000',
    'C': '#9a4a25', 'D': '#8b0000', 'F': '#6b0000',
  }[eco_score] || '#4a7c59'

  const circumference = 2 * Math.PI * 54
  const dashOffset    = circumference * (1 - ring / 100)

  return (
    <div style={s.page}>

      {/* Dark bg */}
      <div style={s.bgDark} />
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />

      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${c.x}%`,
          top: '-20px',
          width: 8 + (i % 3) * 4,
          height: 8 + (i % 3) * 4,
          borderRadius: i % 2 === 0 ? '50%' : 3,
          background: c.color,
          animation: `confettiFall ${c.dur}s ease-in ${c.delay}s infinite`,
          zIndex: 0, pointerEvents: 'none',
          opacity: 0.8,
        }} />
      ))}

      {/* Content */}
      <div style={{
        ...s.wrap,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
        transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Ring */}
        <div style={s.ringWrap}>
          <svg width="132" height="132" viewBox="0 0 132 132" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="66" cy="66" r="54" fill="none"
              stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle cx="66" cy="66" r="54" fill="none"
              stroke="url(#successGrad)" strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
            <defs>
              <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a7c59" />
                <stop offset="100%" stopColor="#c1663a" />
              </linearGradient>
            </defs>
          </svg>
          <div style={s.ringInner}>
            <span style={{ fontSize: 44 }}>🎉</span>
          </div>
        </div>

        {/* Title */}
        <h1 style={s.title}>Order Verified!</h1>
        <p style={s.sub}>Your eco-friendly purchase has been confirmed. Keep it up!</p>

        {/* Points burst */}
        <div style={s.pointsBurst}>
          <div style={s.pointsVal}>
            +<AnimatedNumber target={points_earned} />
          </div>
          <div style={s.pointsLabel}>Eco Points Earned</div>
        </div>

        {/* Stats row */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={{ ...s.statGrade, color: gradeColor, background: `${gradeColor}20` }}>
              {eco_score}
            </div>
            <div style={s.statLabel}>Eco Score</div>
          </div>
          <div style={s.statDivider} />
          <div style={s.statCard}>
            <div style={s.statVal}>{items_confirmed.length || '—'}</div>
            <div style={s.statLabel}>Items Confirmed</div>
          </div>
          <div style={s.statDivider} />
          <div style={s.statCard}>
            <div style={s.statVal}>{carbon_saved.toFixed(1)}kg</div>
            <div style={s.statLabel}>CO₂ Saved</div>
          </div>
        </div>

        {/* Message card */}
        <div style={s.messageCard}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌍</div>
          <p style={s.messageText}>
            Every eco-friendly choice you make reduces carbon emissions.
            Your shopping today helped the planet breathe a little easier.
          </p>
        </div>

        {/* Streak bonus */}
        <div style={s.streakCard}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <div>
            <div style={s.streakTitle}>Streak Bonus!</div>
            <div style={s.streakSub}>+5 pts for shopping today. Keep your streak alive!</div>
          </div>
          <div style={s.streakPts}>+5</div>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button className="btn-primary"
            style={{ flex: 1, padding: '14px 0', fontSize: 15 }}
            onClick={() => navigate('/home')}>
            🏠 Go to Dashboard
          </button>
          <button className="btn-terra"
            style={{ flex: 1, padding: '14px 0', fontSize: 15 }}
            onClick={() => navigate('/leaderboard')}>
            🏆 Leaderboard
          </button>
        </div>

        <button style={s.shopAgain} onClick={() => navigate('/online')}>
          🛒 Shop Again on Blinkit
        </button>
      </div>

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
        }
        @keyframes glowPulse {
          0%,100% { opacity:0.4; transform:scale(1); }
          50%      { opacity:0.8; transform:scale(1.05); }
        }
        @keyframes shimmerFill {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '24px 20px',
    fontFamily: 'DM Sans, sans-serif',
    position: 'relative', overflow: 'hidden',
  },
  bgDark: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(145deg, #1c1208 0%, #2d1f14 45%, #1a2d1a 100%)',
    zIndex: 0,
  },
  bgGlow1: {
    position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,124,89,0.2) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
    animation: 'glowPulse 4s ease-in-out infinite',
  },
  bgGlow2: {
    position: 'fixed', bottom: '-15%', right: '-10%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,102,58,0.15) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },

  wrap: {
    width: '100%', maxWidth: 440, zIndex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 20,
  },

  ringWrap: {
    position: 'relative', width: 132, height: 132,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  title: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 36, color: '#faf6f1', textAlign: 'center', margin: 0,
  },
  sub: {
    color: 'rgba(250,246,241,0.5)', fontSize: 14,
    textAlign: 'center', lineHeight: 1.6, maxWidth: 320,
  },

  pointsBurst: {
    textAlign: 'center',
    background: 'rgba(74,124,89,0.15)',
    border: '1.5px solid rgba(74,124,89,0.3)',
    borderRadius: 20, padding: '20px 40px',
    boxShadow: '0 8px 32px rgba(74,124,89,0.2)',
  },
  pointsVal: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 56, color: '#7aab8a', lineHeight: 1,
    background: 'linear-gradient(135deg, #7aab8a, #c1663a)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  pointsLabel: {
    fontSize: 13, color: 'rgba(250,246,241,0.5)',
    fontWeight: 600, marginTop: 4,
  },

  statsRow: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18, padding: '18px 20px',
    width: '100%',
  },
  statCard: { flex: 1, textAlign: 'center' },
  statGrade: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 28, width: 52, height: 52, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 6px',
  },
  statVal: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 22, color: '#faf6f1', marginBottom: 6,
  },
  statLabel: { fontSize: 11, color: 'rgba(250,246,241,0.4)', fontWeight: 500 },
  statDivider: { width: 1, height: 50, background: 'rgba(255,255,255,0.08)' },

  messageCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18, padding: '20px 22px',
    textAlign: 'center', width: '100%',
  },
  messageText: {
    color: 'rgba(250,246,241,0.5)', fontSize: 13,
    lineHeight: 1.7, margin: 0,
    fontFamily: 'Cormorant Garamond, serif',
    fontStyle: 'italic', fontSize: 15,
  },

  streakCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(193,102,58,0.12)',
    border: '1px solid rgba(193,102,58,0.25)',
    borderRadius: 16, padding: '14px 18px', width: '100%',
  },
  streakTitle: { fontSize: 14, fontWeight: 800, color: '#e08560', marginBottom: 2 },
  streakSub:   { fontSize: 12, color: 'rgba(250,246,241,0.45)' },
  streakPts: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 22, color: '#c1663a', marginLeft: 'auto',
  },

  actions: { display: 'flex', gap: 12, width: '100%' },
  shopAgain: {
    width: '100%', padding: '13px 0',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, color: 'rgba(250,246,241,0.6)',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s ease',
  },
}