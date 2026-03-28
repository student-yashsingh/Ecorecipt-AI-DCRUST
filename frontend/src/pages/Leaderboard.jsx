import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const TIER_EMOJI = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }

const RANK_CONFIG = {
  1: { bg: 'linear-gradient(135deg,#ffd700,#daa520)', color: '#7a5c00', icon: '🥇' },
  2: { bg: 'linear-gradient(135deg,#c0c0c0,#909090)', color: '#3a3a3a', icon: '🥈' },
  3: { bg: 'linear-gradient(135deg,#cd7f32,#a0522d)', color: '#5a2a00', icon: '🥉' },
}

export default function Leaderboard() {
  const navigate     = useNavigate()
  const user         = useStore(s => s.user)

  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/leaderboard')
      .then(r => r.json())
      .then(data => { setLeaders(data.leaderboard || []); setLoading(false) })
      .catch(() => { setError('Could not load leaderboard.'); setLoading(false) })
  }, [])

  const top3    = leaders.slice(0, 3)
  const rest    = leaders.slice(3)

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(145deg,#e8f5e9 0%,#f0f7f0 50%,#e0f2f1 100%)' }}
    >

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background:     'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom:   '1px solid rgba(26,107,60,0.08)',
        }}
      >
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 font-semibold text-sm transition-all hover:scale-105"
          style={{ color: '#1a6b3c' }}
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <span
            className="font-black text-lg"
            style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}
          >
            Leaderboard
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(26,107,60,0.08)', color: '#1a6b3c' }}
        >
          🌿 {user?.points || 0} pts
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* ── Hero banner ── */}
        <div
          className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#1a3d1a 0%,#1a6b3c 60%,#2d9b5a 100%)',
            color: 'white',
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,white,transparent)' }}
          />
          <div className="text-4xl mb-2">🏆</div>
          <h1
            className="text-2xl font-black mb-1"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Top Eco Warriors
          </h1>
          <p className="text-green-300 text-sm">
            Ranked by total eco points earned
          </p>
        </div>

        {/* ── Your standing ── */}
        {user && (
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{
              background:     'rgba(255,255,255,0.6)',
              border:         '1px solid rgba(26,107,60,0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#9db89d' }}>
                YOUR STANDING
              </p>
              <p
                className="font-black text-lg"
                style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}
              >
                {user.name || `Eco Warrior`}
              </p>
              <p className="text-sm mt-0.5" style={{ color: '#5a7a5a' }}>
                {TIER_EMOJI[user.tier || 'Bronze']} {user.tier || 'Bronze'} ·{' '}
                {(user.points || 0).toLocaleString()} pts
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(26,107,60,0.08)' }}
            >
              {TIER_EMOJI[user.tier || 'Bronze']}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="text-center py-16" style={{ color: '#5a7a5a' }}>
            <div className="text-4xl mb-3 animate-bounce">🏆</div>
            <p className="font-medium">Loading leaderboard...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div
            className="rounded-2xl p-4 text-sm text-center"
            style={{
              background: 'rgba(220,38,38,0.06)',
              border:     '1px solid rgba(220,38,38,0.2)',
              color:      '#dc2626',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && leaders.length === 0 && (
          <div className="text-center py-16" style={{ color: '#5a7a5a' }}>
            <div className="text-5xl mb-3">🌱</div>
            <p className="font-medium">No entries yet — be the first!</p>
          </div>
        )}

        {/* ── Top 3 podium ── */}
        {!loading && top3.length > 0 && (
          <div
            className="rounded-3xl p-5"
            style={{
              background:     'rgba(255,255,255,0.6)',
              border:         '1px solid rgba(26,107,60,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p
              className="text-xs font-bold mb-4 text-center uppercase tracking-widest"
              style={{ color: '#9db89d' }}
            >
              Top 3
            </p>

            {/* Podium layout — 2nd | 1st | 3rd */}
            <div className="flex items-end justify-center gap-3">
              {[top3[1], top3[0], top3[2]].map((entry, idx) => {
                if (!entry) return <div key={idx} className="flex-1" />
                const rankNum  = idx === 1 ? 1 : idx === 0 ? 2 : 3
                const cfg      = RANK_CONFIG[rankNum]
                const heights  = ['h-20', 'h-28', 'h-16']
                return (
                  <div key={entry.rank} className="flex-1 flex flex-col items-center gap-2">
                    {/* Crown for #1 */}
                    {rankNum === 1 && (
                      <span className="text-xl animate-bounce">👑</span>
                    )}
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {entry.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Name */}
                    <p
                      className="text-xs font-bold text-center truncate w-full px-1"
                      style={{ color: '#1a3d1a' }}
                    >
                      {entry.name}
                    </p>
                    {/* Points */}
                    <p
                      className="text-xs font-black"
                      style={{ color: '#1a6b3c' }}
                    >
                      {(entry.points || 0).toLocaleString()}
                    </p>
                    {/* Podium block */}
                    <div
                      className={`w-full ${heights[idx]} rounded-t-2xl flex items-center justify-center text-2xl`}
                      style={{ background: cfg.bg }}
                    >
                      {cfg.icon}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Ranks 4+ ── */}
        {!loading && rest.length > 0 && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background:     'rgba(255,255,255,0.6)',
              border:         '1px solid rgba(26,107,60,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: '1px solid rgba(26,107,60,0.08)' }}
            >
              <p
                className="font-black"
                style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}
              >
                Full Rankings
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(26,107,60,0.06)' }}>
              {rest.map(entry => (
                <div
                  key={entry.rank}
                  className="px-5 py-4 flex items-center gap-4"
                >
                  {/* Rank number */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{
                      background: 'rgba(26,107,60,0.08)',
                      color:      '#1a6b3c',
                    }}
                  >
                    {entry.rank}
                  </div>

                  {/* Avatar initial */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg,#1a3d1a,#1a6b3c)',
                      color:      'white',
                    }}
                  >
                    {entry.name?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Name + tier */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold truncate"
                      style={{ color: '#1a3d1a' }}
                    >
                      {entry.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9db89d' }}>
                      {TIER_EMOJI[entry.tier]} {entry.tier} ·{' '}
                      {(entry.carbon_saved || 0).toFixed(1)} kg saved
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-black"
                      style={{ color: '#1a6b3c', fontFamily: 'Fraunces, serif' }}
                    >
                      {(entry.points || 0).toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: '#9db89d' }}>pts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        {!loading && leaders.length > 0 && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background:     'rgba(255,255,255,0.6)',
              border:         '1px solid rgba(26,107,60,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <p className="text-sm mb-3" style={{ color: '#5a7a5a' }}>
              Scan receipts and make eco swaps to climb the ranks 🌿
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-3 rounded-2xl font-black text-sm transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg,#1a3d1a,#1a6b3c)',
                color:      'white',
                boxShadow:  '0 4px 16px rgba(26,107,60,0.25)',
                fontFamily: 'Fraunces, serif',
              }}
            >
              Start Earning →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}