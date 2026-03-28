import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const STEPS = [
  {
    id: 1,
    emoji: '📸',
    title: 'Scan or Shop',
    subtitle: 'Two powerful modes',
    desc: 'Upload a grocery receipt for instant carbon analysis, or shop live on Blinkit through our app and get real-time eco scores on every product.',
    color: '#4a7c59',
    lightColor: 'rgba(74,124,89,0.1)',
    items: [
      { icon: '🧾', label: 'Receipt Mode', desc: 'Upload any grocery bill' },
      { icon: '🛒', label: 'Online Mode',  desc: 'Shop on Blinkit with eco scores' },
    ],
    bg: 'linear-gradient(135deg, #1c1208 0%, #2d3a1f 100%)',
  },
  {
    id: 2,
    emoji: '🤖',
    title: 'AI Scores Everything',
    subtitle: 'Powered by Gemini',
    desc: 'Our Gemini AI reads your receipt, identifies every item, and assigns a CO₂ score based on scientific emission data. You see exactly which items hurt the planet most.',
    color: '#c1663a',
    lightColor: 'rgba(193,102,58,0.1)',
    items: [
      { icon: '🌍', label: 'CO₂ per item',    desc: 'Precise emission scores' },
      { icon: '🔄', label: 'Eco alternatives', desc: 'Greener swap suggestions' },
    ],
    bg: 'linear-gradient(135deg, #1c1208 0%, #3a2010 100%)',
  },
  {
    id: 3,
    emoji: '🏆',
    title: 'Earn & Level Up',
    subtitle: 'Gamified eco journey',
    desc: 'Every eco-friendly action earns you points. Swap a high-carbon item? +25 pts. Upload a receipt? +10 pts. Climb from Bronze to Platinum and unlock cashback rewards.',
    color: '#4a7c59',
    lightColor: 'rgba(74,124,89,0.1)',
    items: [
      { icon: '⚡', label: '+25 pts per swap',   desc: 'For every eco alternative' },
      { icon: '💰', label: '₹0.10 per point',    desc: 'Real cashback value' },
    ],
    bg: 'linear-gradient(135deg, #1c1208 0%, #1a3020 100%)',
  },
  {
    id: 4,
    emoji: '🌱',
    title: 'Track Your Impact',
    subtitle: 'See the difference',
    desc: 'Watch your CO₂ savings grow over time. Compete on the leaderboard, maintain your streak, and see how your choices are literally changing the planet.',
    color: '#7aab8a',
    lightColor: 'rgba(122,171,138,0.1)',
    items: [
      { icon: '📊', label: 'Carbon dashboard',  desc: 'Track savings over time' },
      { icon: '🔥', label: 'Daily streaks',     desc: '+5 pts every day' },
    ],
    bg: 'linear-gradient(135deg, #1c1208 0%, #1a2d1a 100%)',
  },
]

const TIERS = [
  { name: 'Bronze',   emoji: '🥉', pts: '0',    color: '#cd7f32' },
  { name: 'Silver',   emoji: '🥈', pts: '500',  color: '#9aa0a6' },
  { name: 'Gold',     emoji: '🥇', pts: '2000', color: '#d4a017' },
  { name: 'Platinum', emoji: '💎', pts: '5000', color: '#00b4d8' },
]

export default function HowItWorks() {
  const navigate       = useNavigate()
  const user           = useStore(s => s.user)
  const [step, setStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [leaving, setLeaving] = useState(false)

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1

  function goNext() {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => {
      if (isLast) {
        navigate('/home')
      } else {
        setStep(s => s + 1)
        setAnimKey(k => k + 1)
        setLeaving(false)
      }
    }, 300)
  }

  function goBack() {
    if (step === 0) return
    setLeaving(true)
    setTimeout(() => {
      setStep(s => s - 1)
      setAnimKey(k => k + 1)
      setLeaving(false)
    }, 300)
  }

  function skip() { navigate('/home') }

  return (
    <div style={{ ...s.page, background: current.bg }}>

      {/* Bg glow */}
      <div style={{ ...s.bgGlow, background: `radial-gradient(circle, ${current.lightColor.replace('0.1','0.15')} 0%, transparent 70%)` }} />

      {/* Floating particles */}
      {['🌿','🥦','🍅','🌾','🥕'].map((e, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${[5,85,15,75,45][i]}%`,
          top:  `${[10,15,80,75,5][i]}%`,
          fontSize: 24, opacity: 0.06,
          animation: `floatItem ${[7,8,6,9,7][i]}s ease-in-out ${i*0.5}s infinite`,
          pointerEvents: 'none', zIndex: 0,
        }}>{e}</div>
      ))}

      {/* Skip button */}
      <button style={s.skipBtn} onClick={skip}>Skip →</button>

      {/* Main content */}
      <div style={s.wrap} key={animKey}>

        {/* Step indicator */}
        <div style={s.stepDots}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => { setStep(i); setAnimKey(k=>k+1) }}
              style={{
                ...s.dot,
                width: i === step ? 28 : 8,
                background: i === step ? current.color : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        {/* Emoji icon */}
        <div style={{ ...s.emojiWrap, borderColor: `${current.color}40`, boxShadow: `0 0 40px ${current.color}30` }}>
          <div style={{ ...s.emojiInner, background: `${current.color}20` }}>
            <span style={s.emoji}>{current.emoji}</span>
          </div>
        </div>

        {/* Step label */}
        <div style={{ ...s.stepLabel, background: `${current.color}20`, color: current.color }}>
          Step {current.id} of {STEPS.length} · {current.subtitle}
        </div>

        {/* Title */}
        <h1 style={s.title}>{current.title}</h1>

        {/* Description */}
        <p style={s.desc}>{current.desc}</p>

        {/* Feature cards */}
        <div style={s.featureRow}>
          {current.items.map((item, i) => (
            <div key={i} style={{ ...s.featureCard, borderColor: `${current.color}25` }}>
              <span style={s.featureIcon}>{item.icon}</span>
              <div>
                <div style={s.featureLabel}>{item.label}</div>
                <div style={s.featureSub}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tier road (only on last step) */}
        {isLast && (
          <div style={s.tierWrap}>
            <p style={s.tierTitle}>Your tier journey</p>
            <div style={s.tierRow}>
              {TIERS.map((t, i) => (
                <div key={i} style={s.tierCard}>
                  <div style={{ ...s.tierEmoji, borderColor: `${t.color}40` }}>{t.emoji}</div>
                  <div style={{ ...s.tierName, color: t.color }}>{t.name}</div>
                  <div style={s.tierPts}>{t.pts}+ pts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={s.navRow}>
          {step > 0 && (
            <button style={s.backBtn} onClick={goBack}>← Back</button>
          )}
          <button
            style={{
              ...s.nextBtn,
              background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
              flex: step === 0 ? 1 : 'none',
              opacity: leaving ? 0.6 : 1,
            }}
            onClick={goNext}
          >
            {isLast ? '🌿 Start my eco journey →' : 'Next →'}
          </button>
        </div>

        {/* Points preview */}
        <div style={s.pointsRow}>
          {[
            { pts: '+100', label: 'Welcome bonus' },
            { pts: '+10',  label: 'Per receipt'   },
            { pts: '+25',  label: 'Per eco swap'  },
          ].map((p, i) => (
            <div key={i} style={s.pointsBadge}>
              <span style={{ ...s.pointsVal, color: current.color }}>{p.pts}</span>
              <span style={s.pointsLabel}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatItem {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-16px) rotate(3deg); }
          66%      { transform: translateY(-7px) rotate(-2deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 20px', overflow: 'hidden',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'background 0.6s ease',
  },
  bgGlow: {
    position: 'fixed', top: '20%', left: '50%',
    transform: 'translateX(-50%)',
    width: 600, height: 600, borderRadius: '50%',
    pointerEvents: 'none', zIndex: 0,
    animation: 'glowPulse 4s ease-in-out infinite',
  },
  skipBtn: {
    position: 'fixed', top: 24, right: 24,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 100, padding: '8px 18px',
    color: 'rgba(255,255,255,0.5)', fontSize: 13,
    fontWeight: 600, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    zIndex: 10, transition: 'all 0.2s ease',
  },

  wrap: {
    width: '100%', maxWidth: 480, zIndex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 20,
    animation: 'fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
  },

  stepDots: { display: 'flex', gap: 6, alignItems: 'center' },
  dot: {
    height: 8, borderRadius: 100,
    border: 'none', cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    padding: 0,
  },

  emojiWrap: {
    width: 120, height: 120, borderRadius: '50%',
    border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.5s ease',
  },
  emojiInner: {
    width: 90, height: 90, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 48 },

  stepLabel: {
    padding: '6px 16px', borderRadius: 100,
    fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
  },

  title: {
    fontSize: 36, fontWeight: 900, color: '#faf6f1',
    fontFamily: 'Playfair Display, serif',
    textAlign: 'center', lineHeight: 1.15,
    margin: 0,
  },

  desc: {
    fontSize: 15, color: 'rgba(250,246,241,0.6)',
    textAlign: 'center', lineHeight: 1.7,
    maxWidth: 400,
  },

  featureRow: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%' },
  featureCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid',
    borderRadius: 16, padding: '14px 18px',
    backdropFilter: 'blur(10px)',
  },
  featureIcon: { fontSize: 28, flexShrink: 0 },
  featureLabel: { fontSize: 14, fontWeight: 700, color: '#faf6f1', marginBottom: 2 },
  featureSub:   { fontSize: 12, color: 'rgba(250,246,241,0.45)' },

  tierWrap: { width: '100%' },
  tierTitle: {
    fontSize: 12, fontWeight: 700, color: 'rgba(250,246,241,0.4)',
    textAlign: 'center', marginBottom: 12,
    textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  tierRow: { display: 'flex', gap: 8 },
  tierCard: {
    flex: 1, textAlign: 'center',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: '12px 8px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  tierEmoji: {
    fontSize: 24, marginBottom: 4,
    width: 44, height: 44, borderRadius: '50%',
    border: '1.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 6px',
    background: 'rgba(255,255,255,0.05)',
  },
  tierName: { fontSize: 11, fontWeight: 800, marginBottom: 2 },
  tierPts:  { fontSize: 10, color: 'rgba(250,246,241,0.35)' },

  navRow: { display: 'flex', gap: 10, width: '100%' },
  backBtn: {
    padding: '14px 24px', borderRadius: 100,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(250,246,241,0.7)', fontSize: 15,
    fontWeight: 600, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.2s ease',
  },
  nextBtn: {
    flex: 1, padding: '15px 24px', borderRadius: 100,
    border: 'none', color: 'white',
    fontSize: 15, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  },

  pointsRow: {
    display: 'flex', gap: 12, width: '100%',
  },
  pointsBadge: {
    flex: 1, textAlign: 'center',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 12, padding: '10px 8px',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  pointsVal:   { fontSize: 16, fontWeight: 800, fontFamily: 'Playfair Display, serif' },
  pointsLabel: { fontSize: 10, color: 'rgba(250,246,241,0.4)', fontWeight: 500 },
}