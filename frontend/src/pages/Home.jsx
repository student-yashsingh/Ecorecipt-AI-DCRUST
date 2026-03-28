import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const TIER_GRADIENTS = {
  Bronze:   'linear-gradient(135deg, #cd7f32, #a0522d)',
  Silver:   'linear-gradient(135deg, #c0c0c0, #808080)',
  Gold:     'linear-gradient(135deg, #ffd700, #daa520)',
  Platinum: 'linear-gradient(135deg, #00b4d8, #0077b6)',
}
const TIER_EMOJI = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }
const TIER_NEXT  = { Bronze: 500, Silver: 2000, Gold: 5000, Platinum: 5000 }

export default function Home() {
  const navigate     = useNavigate()
  const user         = useStore(s => s.user)
  const setUser      = useStore(s => s.setUser)
  const firebaseUser = useStore(s => s.firebaseUser)
  const logout       = useStore(s => s.logout)

  const [greeting, setGreeting] = useState('')
  const [animPoints, setAnimPoints] = useState(0)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  }, [])

  // Animate points counter
  useEffect(() => {
    if (!user) return
    const target = user.points || 0
    let current  = 0
    const step   = Math.ceil(target / 40)
    const timer  = setInterval(() => {
      current = Math.min(current + step, target)
      setAnimPoints(current)
      if (current >= target) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [user?.points])

  // Refresh profile
  useEffect(() => {
    if (!user || !firebaseUser) return
    firebaseUser.getIdToken().then(token => {
      fetch('http://127.0.0.1:8000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => setUser({ ...user, ...data }))
        .catch(() => {})
    })
  }, [])

  if (!user) { navigate('/'); return null }

  const tier      = user.tier || 'Bronze'
  const points    = user.points || 0
  const nextTier  = TIER_NEXT[tier]
  const progress  = tier === 'Platinum' ? 100 : Math.min((points / nextTier) * 100, 100)
  const carbon    = user.carbon_saved || 0
  const streak    = user.streak_days || 0

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #e8f5e9 0%, #f0f7f0 50%, #e0f2f1 100%)' }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
  style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(26,107,60,0.08)' }}>
  <div className="flex items-center gap-2">
    <span className="text-2xl">🌿</span>
    <span className="font-black text-lg" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
      EcoReceipt
    </span>
  </div>
  <div className="flex items-center gap-3">
    <button onClick={() => navigate('/leaderboard')}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
      style={{ background: 'rgba(26,107,60,0.08)', color: '#1a6b3c' }}>
      🏆 <span className="hidden sm:inline">Leaderboard</span>
    </button>

    {/* Profile icon */}
    <button onClick={() => navigate('/profile')}
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all hover:scale-105"
      style={{ background: 'linear-gradient(135deg, #1a3d1a, #1a6b3c)', color: 'white' }}>
      {user?.name ? user.name[0].toUpperCase() : '👤'}
    </button>

    <button onClick={() => { logout(); navigate('/') }}
      className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:scale-105"
      style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
      ↩
    </button>
  </div>
</nav>


      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── Hero Card ── */}
        <div className="fade-in-up relative overflow-hidden rounded-3xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #1a3d1a 0%, #1a6b3c 60%, #2d9b5a 100%)' }}>

          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #a3d977, transparent)' }} />

          {/* Greeting */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div>
              <p className="text-green-300 text-sm font-medium">{greeting} 👋</p>
              <h1 className="text-2xl font-black mt-0.5" style={{ fontFamily: 'Fraunces, serif' }}>
                {user.name || `Eco Warrior`}
              </h1>
            </div>
            {/* Tier badge */}
            <div className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {TIER_EMOJI[tier]} {tier}
            </div>
          </div>

          {/* Points display */}
          <div className="relative z-10 mb-4">
            <p className="text-green-300 text-xs uppercase tracking-widest font-semibold mb-1">Eco Points</p>
            <div className="text-5xl font-black mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
              {animPoints.toLocaleString()}
              <span className="text-2xl text-green-300 ml-2">pts</span>
            </div>

            {/* Progress bar */}
            {tier !== 'Platinum' && (
              <div>
                <div className="flex justify-between text-xs text-green-300 mb-1.5">
                  <span>{points.toLocaleString()} pts</span>
                  <span>{nextTier.toLocaleString()} pts for {
                    tier === 'Bronze' ? '🥈 Silver' :
                    tier === 'Silver' ? '🥇 Gold' : '💎 Platinum'
                  }</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #a3d977, #52c77e)' }} />
                </div>
              </div>
            )}
            {tier === 'Platinum' && (
              <p className="text-green-300 text-sm">💎 Maximum tier reached! You're a legend.</p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 relative z-10">
            {[
              { val: `${carbon.toFixed(1)}kg`, label: 'CO₂ Saved', icon: '🌍' },
              { val: `${streak}d`, label: 'Streak', icon: '🔥' },
              { val: `₹${(points * 0.10).toFixed(0)}`, label: 'Cashback', icon: '💰' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-xl font-black">{s.val}</div>
                <div className="text-green-300 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mode Cards ── */}
        <div className="fade-in-up delay-1">
          <h2 className="text-lg font-black mb-4" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
            What would you like to do?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Receipt Mode */}
            <button onClick={() => navigate('/receipt')}
              className="glass text-left p-6 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ cursor: 'pointer' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
                🧾
              </div>
              <h3 className="font-black text-lg mb-1" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
                Receipt Mode
              </h3>
              <p className="text-sm mb-4" style={{ color: '#5a7a5a' }}>
                Upload your grocery receipt and get instant carbon analysis
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: '#e8f5e9', color: '#1a6b3c' }}>+10 pts</span>
                <span className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: '#e8f5e9', color: '#1a6b3c' }}>+50 pts A+</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-bold"
                style={{ color: '#1a6b3c' }}>
                Start scanning <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>

            {/* Online Mode */}
            <button onClick={() => navigate('/online')}
              className="glass text-left p-6 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ cursor: 'pointer' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #e0f2f1, #b2dfdb)' }}>
                🛒
              </div>
              <h3 className="font-black text-lg mb-1" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
                Online Mode
              </h3>
              <p className="text-sm mb-4" style={{ color: '#5a7a5a' }}>
                Shop on Blinkit and earn points for eco-friendly swaps
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: '#e0f2f1', color: '#00796b' }}>+25 pts swap</span>
                <span className="text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: '#e0f2f1', color: '#00796b' }}>Live scores</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-bold"
                style={{ color: '#00796b' }}>
                Start shopping <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="fade-in-up delay-2 glass p-6">
          <h2 className="font-black text-lg mb-5" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
            How it works
          </h2>
          <div className="space-y-4">
            {[
              { icon: '📸', title: 'Upload or Shop', desc: 'Scan a receipt or shop via Blinkit', color: '#e8f5e9' },
              { icon: '🤖', title: 'AI Analysis',    desc: 'Gemini AI scores your carbon footprint', color: '#f0fdf4' },
              { icon: '🌿', title: 'Earn & Improve', desc: 'Get points, climb tiers, unlock cashback', color: '#e0f2f1' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: step.color }}>
                  {step.icon}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1a3d1a' }}>{step.title}</p>
                  <p className="text-xs" style={{ color: '#5a7a5a' }}>{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="ml-auto text-green-300 text-lg">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Tier roadmap ── */}
        <div className="fade-in-up delay-3 glass p-6">
          <h2 className="font-black text-lg mb-5" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
            Your Tier Journey
          </h2>
          <div className="flex items-center gap-2">
            {['Bronze', 'Silver', 'Gold', 'Platinum'].map((t, i) => {
              const tiers   = ['Bronze', 'Silver', 'Gold', 'Platinum']
              const current = tiers.indexOf(tier)
              const active  = i === current
              const done    = i < current
              return (
                <div key={t} className="flex-1 text-center">
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold transition-all
                    ${active ? 'scale-125 shadow-lg' : ''}`}
                    style={{
                      background: done || active ? TIER_GRADIENTS[t] : '#e8f5e9',
                      color: done || active ? 'white' : '#9db89d',
                    }}>
                    {TIER_EMOJI[t]}
                  </div>
                  <p className={`text-xs font-bold ${active ? '' : ''}`}
                    style={{ color: active ? '#1a6b3c' : done ? '#5a7a5a' : '#9db89d' }}>
                    {t}
                  </p>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1"
                      style={{ background: '#1a6b3c' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
