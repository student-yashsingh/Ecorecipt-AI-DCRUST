import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PARTICLES = [
  { emoji: '🌿', x: 8,  y: 12, size: 28, dur: 7, delay: 0   },
  { emoji: '🥦', x: 88, y: 8,  size: 24, dur: 8, delay: 0.5 },
  { emoji: '🍅', x: 15, y: 75, size: 26, dur: 6, delay: 1   },
  { emoji: '🧈', x: 82, y: 70, size: 22, dur: 9, delay: 0.3 },
  { emoji: '🌾', x: 50, y: 85, size: 30, dur: 7, delay: 1.5 },
  { emoji: '🥕', x: 5,  y: 45, size: 24, dur: 8, delay: 0.8 },
  { emoji: '🫘', x: 92, y: 40, size: 20, dur: 6, delay: 1.2 },
  { emoji: '🍋', x: 40, y: 6,  size: 26, dur: 9, delay: 0.6 },
  { emoji: '🥚', x: 70, y: 90, size: 22, dur: 7, delay: 1.8 },
  { emoji: '🧄', x: 25, y: 90, size: 20, dur: 8, delay: 0.4 },
]

export default function Splash() {
  const navigate  = useNavigate()
  const [phase, setPhase]       = useState(0)  // 0=logo, 1=tagline, 2=loading, 3=done
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Phase timeline
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1400)
    const t3 = setTimeout(() => setPhase(3), 3200)
    const t4 = setTimeout(() => navigate('/login'), 3600)

    // Progress bar
    let p = 0
    const interval = setInterval(() => {
      p += 1.2
      setProgress(Math.min(p, 100))
      if (p >= 100) clearInterval(interval)
    }, 22)

    return () => {
      clearTimeout(t1); clearTimeout(t2)
      clearTimeout(t3); clearTimeout(t4)
      clearInterval(interval)
    }
  }, [])

  return (
    <div style={s.page}>

      {/* Warm radial background */}
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />
      <div style={s.bgGlow3} />

      {/* Floating grocery particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position:  'fixed',
          left:      `${p.x}%`,
          top:       `${p.y}%`,
          fontSize:  p.size,
          animation: `floatItem ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity:   0.12,
          pointerEvents: 'none',
          filter: 'sepia(40%) saturate(80%)',
          zIndex: 0,
        }}>
          {p.emoji}
        </div>
      ))}

      {/* Center content */}
      <div style={s.center}>

        {/* Logo mark */}
        <div style={{
          ...s.logoWrap,
          opacity:   phase >= 0 ? 1 : 0,
          transform: phase >= 0 ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Outer ring */}
          <div style={s.outerRing}>
            <div style={s.innerRing}>
              <div style={s.logoCore}>
                <span style={s.logoEmoji}>🌿</span>
              </div>
            </div>
          </div>

          {/* Orbiting items */}
          {['🥦','🍅','🥛','🌾'].map((e, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              marginTop: -14, marginLeft: -14,
              fontSize: 22,
              transform: `rotate(${i * 90}deg) translateX(72px) rotate(-${i * 90}deg)`,
              animation: `splashOrbit 8s linear ${i * 0.5}s infinite`,
            }}>
              {e}
            </div>
          ))}
        </div>

        {/* Brand name */}
        <div style={{
          ...s.brandWrap,
          opacity:   phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s',
        }}>
          <h1 style={s.brandName}>EcoReceipt</h1>
          <span style={s.brandAI}>AI</span>
        </div>

        {/* Tagline */}
        <div style={{
          ...s.taglineWrap,
          opacity:   phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s',
        }}>
          <p style={s.tagline}>Small choices. Bigger planet.</p>
        </div>

        {/* Loading bar */}
        <div style={{
          ...s.loaderWrap,
          opacity:   phase >= 2 ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}>
          <div style={s.loaderTrack}>
            <div style={{ ...s.loaderFill, width: `${progress}%` }} />
          </div>
          <p style={s.loaderText}>
            {progress < 40 ? 'Loading carbon data...'
           : progress < 75 ? 'Preparing eco scores...'
           : 'Almost ready...'}
          </p>
        </div>

        {/* Version */}
        <div style={{
          ...s.version,
          opacity: phase >= 2 ? 0.4 : 0,
          transition: 'opacity 0.5s ease 0.3s',
        }}>
          v1.0 · Made for Earth 🌍
        </div>
      </div>

      <style>{`
        @keyframes splashOrbit {
          from { transform: rotate(var(--start, 0deg)) translateX(72px) rotate(calc(-1 * var(--start, 0deg))); }
          to   { transform: rotate(calc(var(--start, 0deg) + 360deg)) translateX(72px) rotate(calc(-1 * (var(--start, 0deg) + 360deg))); }
        }
        @keyframes floatItem {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-18px) rotate(4deg); }
          66%      { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ringRotateReverse {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes shimmerFill {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #1c1208 0%, #2d1f14 40%, #3d2a1a 70%, #2d1f14 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },

  // Background glows
  bgGlow1: {
    position: 'fixed', top: '-20%', left: '-10%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,124,89,0.2) 0%, transparent 70%)',
    pointerEvents: 'none', animation: 'glowPulse 4s ease-in-out infinite',
  },
  bgGlow2: {
    position: 'fixed', bottom: '-15%', right: '-10%',
    width: 450, height: 450, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,102,58,0.18) 0%, transparent 70%)',
    pointerEvents: 'none', animation: 'glowPulse 5s ease-in-out 1s infinite',
  },
  bgGlow3: {
    position: 'fixed', top: '40%', left: '40%',
    width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(122,171,138,0.1) 0%, transparent 70%)',
    pointerEvents: 'none', animation: 'glowPulse 6s ease-in-out 2s infinite',
  },

  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 24,
    position: 'relative', zIndex: 1,
    padding: 40,
  },

  // Logo
  logoWrap: {
    position: 'relative',
    width: 160, height: 160,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '1.5px solid rgba(74,124,89,0.3)',
    animation: 'ringRotate 12s linear infinite',
  },
  innerRing: {
    position: 'absolute', inset: 12, borderRadius: '50%',
    border: '1.5px dashed rgba(193,102,58,0.25)',
    animation: 'ringRotateReverse 8s linear infinite',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoCore: {
    width: 96, height: 96, borderRadius: '50%',
    background: 'linear-gradient(135deg, #2d5a3d, #4a7c59)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 40px rgba(74,124,89,0.5), 0 0 80px rgba(74,124,89,0.2)',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  logoEmoji: { fontSize: 44 },

  // Brand
  brandWrap: {
    display: 'flex', alignItems: 'baseline', gap: 8,
  },
  brandName: {
    fontSize: 48, fontWeight: 900,
    fontFamily: 'Playfair Display, serif',
    color: '#faf6f1',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  brandAI: {
    fontSize: 20, fontWeight: 700,
    fontFamily: 'DM Sans, sans-serif',
    color: '#c1663a',
    background: 'linear-gradient(135deg, #c1663a, #e08560)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.05em',
  },

  taglineWrap: { textAlign: 'center' },
  tagline: {
    fontSize: 16, color: 'rgba(250,246,241,0.5)',
    fontFamily: 'Cormorant Garamond, serif',
    fontStyle: 'italic', letterSpacing: '0.04em',
  },

  // Loader
  loaderWrap: { width: 220, textAlign: 'center' },
  loaderTrack: {
    height: 3, background: 'rgba(255,255,255,0.08)',
    borderRadius: 10, overflow: 'hidden', marginBottom: 10,
  },
  loaderFill: {
    height: '100%', borderRadius: 10,
    background: 'linear-gradient(90deg, #4a7c59, #c1663a)',
    transition: 'width 0.1s linear',
    backgroundSize: '200% auto',
    animation: 'shimmerFill 2s linear infinite',
  },
  loaderText: {
    fontSize: 12, color: 'rgba(250,246,241,0.4)',
    fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.03em',
  },

  version: {
    fontSize: 11, color: 'rgba(250,246,241,0.4)',
    fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
  },
}