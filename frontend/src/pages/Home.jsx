import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const TIER_CONFIG = {
  Bronze:   { gradient: 'linear-gradient(135deg, #cd7f32, #a0522d)', emoji: '🥉', next: 500,  nextName: 'Silver'   },
  Silver:   { gradient: 'linear-gradient(135deg, #9aa0a6, #6b7280)', emoji: '🥈', next: 2000, nextName: 'Gold'     },
  Gold:     { gradient: 'linear-gradient(135deg, #d4a017, #b8860b)', emoji: '🥇', next: 5000, nextName: 'Platinum' },
  Platinum: { gradient: 'linear-gradient(135deg, #00b4d8, #0077b6)', emoji: '💎', next: 5000, nextName: 'Legend'   },
}

function AnimatedNumber({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const t = setInterval(() => {
      start = Math.min(start + step, target)
      setVal(Math.floor(start))
      if (start >= target) clearInterval(t)
    }, 16)
    return () => clearInterval(t)
  }, [target])
  return val.toLocaleString()
}

export default function Home() {
  const navigate     = useNavigate()
  const user         = useStore(s => s.user)
  const setUser      = useStore(s => s.setUser)
  const firebaseUser = useStore(s => s.firebaseUser)
  const logout       = useStore(s => s.logout)

  const [greeting, setGreeting]   = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [loaded, setLoaded]       = useState(false)

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) { setGreeting('Good morning'); setTimeOfDay('🌅') }
    else if (h < 17) { setGreeting('Good afternoon'); setTimeOfDay('☀️') }
    else { setGreeting('Good evening'); setTimeOfDay('🌙') }
    setTimeout(() => setLoaded(true), 100)
  }, [])

  // Refresh profile
  useEffect(() => {
    if (!user || !firebaseUser) return
    firebaseUser.getIdToken().then(token => {
      fetch('http://localhost:8000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setUser({ ...user, ...data }))
        .catch(() => {})
    })
  }, [])

  if (!user) { navigate('/'); return null }

  const tier      = user.tier || 'Bronze'
  const tc        = TIER_CONFIG[tier]
  const points    = user.points || 0
  const carbon    = user.carbon_saved || 0
  const streak    = user.streak_days || 0
  const progress  = tier === 'Platinum' ? 100 : Math.min((points / tc.next) * 100, 100)
  const cashback  = (points * 0.10).toFixed(0)

  return (
    <div style={s.page}>

      {/* Background layers */}
      <div style={s.bgBase} />
      <div style={s.bgTexture} />
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />

      {/* ── NAVBAR ── */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.navLogo}>🌿</div>
          <span style={s.navBrand}>EcoReceipt <span style={s.navAI}>AI</span></span>
        </div>
        <div style={s.navRight}>
          <button style={s.navBtn} onClick={() => navigate('/leaderboard')}>🏆 Board</button>
          <button style={s.navBtn} onClick={() => navigate('/profile')}>
            <div style={s.avatar}>
              {user?.name ? user.name[0].toUpperCase() : '🌿'}
            </div>
          </button>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate('/') }}>↩</button>
        </div>
      </nav>

      <div style={s.content}>

        {/* ── HERO CARD ── */}
        <div style={{ ...s.heroCard, opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)' }}>

          {/* Decorative circles */}
          <div style={s.heroDeco1} />
          <div style={s.heroDeco2} />
          <div style={s.heroDeco3} />

          {/* Top row */}
          <div style={s.heroTop}>
            <div>
              <p style={s.heroGreeting}>{timeOfDay} {greeting}</p>
              <h1 style={s.heroName}>{user.name || 'Eco Warrior'}</h1>
            </div>
            <div style={{ ...s.tierBadge, background: tc.gradient }}>
              {tc.emoji} {tier}
            </div>
          </div>

          {/* Points */}
          <div style={s.pointsBlock}>
            <p style={s.pointsLabel}>ECO POINTS</p>
            <div style={s.pointsVal}>
              <AnimatedNumber target={points} />
              <span style={s.pointsPts}>pts</span>
            </div>
          </div>

          {/* Progress bar */}
          {tier !== 'Platinum' && (
            <div style={s.progressWrap}>
              <div style={s.progressLabels}>
                <span style={s.progressLeft}>{points.toLocaleString()} pts</span>
                <span style={s.progressRight}>{tc.next.toLocaleString()} for {tc.emoji} {tc.nextName}</span>
              </div>
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width: `${progress}%` }} />
                {/* Glow dot */}
                <div style={{ ...s.progressDot, left: `${progress}%` }} />
              </div>
            </div>
          )}
          {tier === 'Platinum' && (
            <p style={s.platinumMsg}>💎 Maximum tier reached. You are a legend.</p>
          )}

          {/* Stats row */}
          <div style={s.statsRow}>
            {[
              { val: `${carbon.toFixed(1)}kg`, label: 'CO₂ Saved',  icon: '🌍', color: '#7aab8a' },
              { val: `${streak}d`,             label: 'Streak',      icon: '🔥', color: '#e08560' },
              { val: `₹${cashback}`,           label: 'Cashback',    icon: '💰', color: '#d4a017' },
              { val: tier,                     label: 'Current Tier',icon: tc.emoji, color: '#9aa0a6' },
            ].map((st, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statIcon}>{st.icon}</div>
                <div style={{ ...s.statVal, color: st.color }}>{st.val}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MODE CARDS ── */}
        <div style={{ opacity: loaded ? 1 : 0, transition: 'all 0.7s ease 0.2s' }}>
          <h2 style={s.sectionTitle}>What would you like to do?</h2>
          <div style={s.modeGrid}>

            {/* Receipt Mode */}
            <button style={s.modeCard} onClick={() => navigate('/receipt')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
                e.currentTarget.style.boxShadow = '0 24px 60px rgba(45,31,20,0.18)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = s.modeCard.boxShadow
              }}
            >
              <div style={s.modeAccent} />
              <div style={{ ...s.modeIconWrap, background: 'linear-gradient(135deg, #f0e8dc, #e8d8c4)' }}>
                <span style={s.modeIcon}>🧾</span>
              </div>
              <div style={s.modeContent}>
                <h3 style={s.modeTitle}>Receipt Mode</h3>
                <p style={s.modeSub}>Upload any grocery bill — Gemini AI reads it and scores your carbon footprint instantly.</p>
                <div style={s.modeTags}>
                  <span style={{ ...s.modeTag, background: 'rgba(74,124,89,0.1)', color: 'var(--olive)' }}>+10 pts</span>
                  <span style={{ ...s.modeTag, background: 'rgba(74,124,89,0.1)', color: 'var(--olive)' }}>+50 A+ score</span>
                  <span style={{ ...s.modeTag, background: 'rgba(74,124,89,0.1)', color: 'var(--olive)' }}>AI powered</span>
                </div>
              </div>
              <div style={s.modeArrow}>→</div>
            </button>

            {/* Online Mode */}
            <button style={s.modeCard} onClick={() => navigate('/online')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'
                e.currentTarget.style.boxShadow = '0 24px 60px rgba(45,31,20,0.18)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = s.modeCard.boxShadow
              }}
            >
              <div style={{ ...s.modeAccent, background: 'linear-gradient(90deg, var(--terra), var(--terra-light))' }} />
              <div style={{ ...s.modeIconWrap, background: 'linear-gradient(135deg, #fde8dc, #f8d0c0)' }}>
                <span style={s.modeIcon}>🛒</span>
              </div>
              <div style={s.modeContent}>
                <h3 style={s.modeTitle}>Online Mode</h3>
                <p style={s.modeSub}>Search Blinkit products with live eco scores. Swap high-carbon items and earn points.</p>
                <div style={s.modeTags}>
                  <span style={{ ...s.modeTag, background: 'rgba(193,102,58,0.1)', color: 'var(--terra)' }}>+25 per swap</span>
                  <span style={{ ...s.modeTag, background: 'rgba(193,102,58,0.1)', color: 'var(--terra)' }}>Live Blinkit</span>
                  <span style={{ ...s.modeTag, background: 'rgba(193,102,58,0.1)', color: 'var(--terra)' }}>Real prices</span>
                </div>
              </div>
              <div style={{ ...s.modeArrow, color: 'var(--terra)' }}>→</div>
            </button>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ ...s.howCard, opacity: loaded ? 1 : 0, transition: 'all 0.7s ease 0.3s' }}>
          <h2 style={s.sectionTitle}>How it works</h2>
          <div style={s.howSteps}>
            {[
              { icon: '📸', title: 'Upload or Shop',   desc: 'Scan a receipt or browse Blinkit',  color: 'var(--olive)'  },
              { icon: '🤖', title: 'AI Analyses',      desc: 'Gemini scores your carbon impact',  color: 'var(--terra)'  },
              { icon: '🌿', title: 'Earn & Improve',   desc: 'Get points, climb tiers, save CO₂', color: 'var(--olive-light)' },
            ].map((step, i) => (
              <div key={i} style={s.howStep}>
                <div style={{ ...s.howIcon, background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                  {step.icon}
                </div>
                {i < 2 && <div style={s.howArrow}>→</div>}
                <div style={s.howText}>
                  <div style={{ ...s.howTitle, color: step.color }}>{step.title}</div>
                  <div style={s.howDesc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TIER JOURNEY ── */}
        <div style={{ ...s.tierCard, opacity: loaded ? 1 : 0, transition: 'all 0.7s ease 0.4s' }}>
          <h2 style={s.sectionTitle}>Your Tier Journey</h2>
          <div style={s.tierRow}>
            {Object.entries(TIER_CONFIG).map(([name, tc], i) => {
              const tiers   = ['Bronze','Silver','Gold','Platinum']
              const current = tiers.indexOf(tier)
              const thisIdx = tiers.indexOf(name)
              const active  = name === tier
              const done    = thisIdx < current
              return (
                <div key={name} style={s.tierStep}>
                  <div style={{
                    ...s.tierCircle,
                    background: active || done ? tc.gradient : 'var(--beige)',
                    boxShadow: active ? `0 0 20px ${tc.gradient.includes('cd7f32') ? '#cd7f32' : tc.gradient.includes('9aa0a6') ? '#9aa0a6' : tc.gradient.includes('d4a017') ? '#d4a017' : '#00b4d8'}40` : 'none',
                    transform: active ? 'scale(1.2)' : 'scale(1)',
                  }}>
                    <span style={{ fontSize: 20 }}>{tc.emoji}</span>
                  </div>
                  <div style={{ ...s.tierName, color: active ? '#1c1208' : 'var(--brown-light)', fontWeight: active ? 800 : 500 }}>
                    {name}
                  </div>
                  {active && <div style={s.tierActiveDot} />}
                  {i < 3 && <div style={s.tierConnector} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ opacity: loaded ? 1 : 0, transition: 'all 0.7s ease 0.5s' }}>
          <h2 style={s.sectionTitle}>Quick Actions</h2>
          <div style={s.quickRow}>
            {[
              { icon: '🏆', label: 'Leaderboard', path: '/leaderboard', color: 'var(--terra)'       },
              { icon: '👤', label: 'My Profile',   path: '/profile',     color: 'var(--olive)'       },
              { icon: '🧾', label: 'Scan Receipt', path: '/receipt',     color: 'var(--brown-mid)'   },
              { icon: '🛒', label: 'Shop Online',  path: '/online',      color: 'var(--olive-dark)'  },
            ].map((q, i) => (
              <button key={i} style={s.quickCard} onClick={() => navigate(q.path)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ ...s.quickIcon, color: q.color }}>{q.icon}</div>
                <div style={s.quickLabel}>{q.label}</div>
              </button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes glowPulse {
          0%,100% { opacity:0.5; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.05); }
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
    minHeight: '100vh', fontFamily: 'DM Sans, sans-serif',
    position: 'relative', overflowX: 'hidden',
  },
  bgBase: {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(145deg, #faf6f1 0%, #f0e8dc 50%, #faf6f1 100%)',
    zIndex: 0,
  },
  bgTexture: {
    position: 'fixed', inset: 0, zIndex: 0, opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d1f14' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  bgGlow1: {
    position: 'fixed', top: '-10%', right: '-5%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,124,89,0.07) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
    animation: 'glowPulse 5s ease-in-out infinite',
  },
  bgGlow2: {
    position: 'fixed', bottom: '-10%', left: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,102,58,0.06) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
    animation: 'glowPulse 6s ease-in-out 2s infinite',
  },

  // Nav
  nav: {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 24px',
    background: 'rgba(250,246,241,0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(45,31,20,0.06)',
  },
  navLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  navLogo:  { fontSize: 24 },
  navBrand: { fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 18, color: 'var(--brown)' },
  navAI:    { color: 'var(--terra)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700 },
  navRight: { display: 'flex', alignItems: 'center', gap: 8 },
  navBtn: {
    background: 'var(--beige)', border: '1px solid var(--beige-dark)',
    borderRadius: 100, padding: '7px 14px',
    fontSize: 13, fontWeight: 600, color: 'var(--brown)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
    transition: 'all 0.2s ease',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--olive-dark), var(--olive))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 800, fontSize: 14,
  },
  logoutBtn: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(193,102,58,0.08)',
    border: '1px solid rgba(193,102,58,0.15)',
    color: 'var(--terra)', fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  content: {
    maxWidth: 680, margin: '0 auto',
    padding: '24px 20px 60px',
    display: 'flex', flexDirection: 'column', gap: 24,
    position: 'relative', zIndex: 1,
  },

  // Hero card
  heroCard: {
    borderRadius: 28, padding: '28px 28px 24px',
    background: 'linear-gradient(135deg, #1c1208 0%, #2d1f14 50%, #3a2518 100%)',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(45,31,20,0.25)',
  },
  heroDeco1: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(74,124,89,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroDeco2: {
    position: 'absolute', bottom: -40, left: '30%',
    width: 150, height: 150, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,102,58,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroDeco3: {
    position: 'absolute', top: '40%', right: '20%',
    width: 80, height: 80, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(122,171,138,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1,
  },
  heroGreeting: { color: 'rgba(250,246,241,0.5)', fontSize: 13, marginBottom: 4, fontWeight: 500 },
  heroName: {
    color: 'var(--cream)', fontFamily: 'Playfair Display, serif',
    fontWeight: 900, fontSize: 26, margin: 0,
  },
  tierBadge: {
    padding: '7px 14px', borderRadius: 100,
    fontSize: 12, fontWeight: 700, color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  pointsBlock: { marginBottom: 16, position: 'relative', zIndex: 1 },
  pointsLabel: {
    color: 'rgba(250,246,241,0.4)', fontSize: 10,
    fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', marginBottom: 6,
  },
  pointsVal: {
    display: 'flex', alignItems: 'baseline', gap: 8,
    fontFamily: 'Playfair Display, serif',
    fontWeight: 900, fontSize: 52, color: 'var(--cream)', lineHeight: 1,
  },
  pointsPts: {
    fontSize: 22, color: 'rgba(250,246,241,0.5)',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
  },
  progressWrap: { marginBottom: 20, position: 'relative', zIndex: 1 },
  progressLabels: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, color: 'rgba(250,246,241,0.4)',
    marginBottom: 8, fontWeight: 500,
  },
  progressLeft:  {},
  progressRight: {},
  progressTrack: {
    height: 6, background: 'rgba(255,255,255,0.08)',
    borderRadius: 10, overflow: 'visible', position: 'relative',
  },
  progressFill: {
    height: '100%', borderRadius: 10,
    background: 'linear-gradient(90deg, var(--olive), var(--terra-light))',
    backgroundSize: '200% auto',
    animation: 'shimmerFill 3s linear infinite',
    transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
    position: 'relative',
  },
  progressDot: {
    position: 'absolute', top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 12, height: 12, borderRadius: '50%',
    background: 'white',
    boxShadow: '0 0 8px rgba(255,255,255,0.6)',
    transition: 'left 1s cubic-bezier(0.22,1,0.36,1)',
  },
  platinumMsg: {
    color: '#00b4d8', fontSize: 13, fontWeight: 600,
    marginBottom: 16, position: 'relative', zIndex: 1,
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    gap: 10, position: 'relative', zIndex: 1,
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: '14px 8px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  statIcon:  { fontSize: 20, marginBottom: 6 },
  statVal:   { fontWeight: 800, fontSize: 16, fontFamily: 'Playfair Display, serif', marginBottom: 3 },
  statLabel: { fontSize: 10, color: 'rgba(250,246,241,0.35)', fontWeight: 500 },

  // Sections
  sectionTitle: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 20, color: 'var(--brown)', marginBottom: 14,
  },

  // Mode cards
  modeGrid: { display: 'flex', flexDirection: 'column', gap: 14 },
  modeCard: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.95)',
    borderRadius: 20, padding: '20px 20px 20px 16px',
    cursor: 'pointer', textAlign: 'left',
    boxShadow: '0 4px 20px rgba(45,31,20,0.08)',
    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    position: 'relative', overflow: 'hidden',
  },
  modeAccent: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
    background: 'linear-gradient(180deg, var(--olive), var(--olive-light))',
    borderRadius: '20px 0 0 20px',
  },
  modeIconWrap: {
    width: 60, height: 60, borderRadius: 16, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modeIcon: { fontSize: 30 },
  modeContent: { flex: 1 },
  modeTitle: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 18, color: 'var(--brown)', marginBottom: 4,
  },
  modeSub: { fontSize: 12, color: 'var(--brown-light)', lineHeight: 1.5, marginBottom: 10 },
  modeTags: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  modeTag: {
    fontSize: 11, fontWeight: 700, padding: '3px 10px',
    borderRadius: 100,
  },
  modeArrow: {
    fontSize: 20, color: 'var(--olive)', fontWeight: 700, flexShrink: 0,
  },

  // How it works
  howCard: {
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: 20, padding: '24px',
    boxShadow: '0 4px 20px rgba(45,31,20,0.07)',
  },
  howSteps: { display: 'flex', flexDirection: 'column', gap: 16 },
  howStep: { display: 'flex', alignItems: 'center', gap: 14 },
  howIcon: {
    width: 50, height: 50, borderRadius: 14, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
  },
  howArrow: { fontSize: 16, color: 'var(--beige-dark)', flexShrink: 0, display: 'none' },
  howText: { flex: 1 },
  howTitle: { fontWeight: 700, fontSize: 14, marginBottom: 2 },
  howDesc:  { fontSize: 12, color: 'var(--brown-light)', lineHeight: 1.4 },

  // Tier
  tierCard: {
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: 20, padding: '24px',
    boxShadow: '0 4px 20px rgba(45,31,20,0.07)',
  },
  tierRow: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', position: 'relative',
  },
  tierStep: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6, position: 'relative',
  },
  tierCircle: {
    width: 52, height: 52, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
  },
  tierName: { fontSize: 11, textAlign: 'center', transition: 'all 0.3s ease' },
  tierActiveDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--olive)',
  },
  tierConnector: {
    position: 'absolute', top: 26, left: '75%',
    width: '50%', height: 2,
    background: 'var(--beige-dark)',
    zIndex: -1,
  },

  // Quick actions
  quickRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  quickCard: {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.95)',
    borderRadius: 16, padding: '18px 10px',
    textAlign: 'center', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(45,31,20,0.07)',
    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
  },
  quickIcon:  { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 11, fontWeight: 700, color: 'var(--brown)' },
}