import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { API } from '../api'

const TIER_CONFIG = {
  Bronze:   { gradient: 'linear-gradient(135deg, #cd7f32, #a0522d)', emoji: '🥉' },
  Silver:   { gradient: 'linear-gradient(135deg, #9aa0a6, #6b7280)', emoji: '🥈' },
  Gold:     { gradient: 'linear-gradient(135deg, #d4a017, #b8860b)', emoji: '🥇' },
  Platinum: { gradient: 'linear-gradient(135deg, #00b4d8, #0077b6)', emoji: '💎' },
}

const RANK_CONFIG = {
  1: { emoji: '🥇', color: '#d4a017', bg: 'rgba(212,160,23,0.12)', size: 52, label: '1st Place' },
  2: { emoji: '🥈', color: '#9aa0a6', bg: 'rgba(154,160,166,0.12)', size: 44, label: '2nd Place' },
  3: { emoji: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)', size: 38, label: '3rd Place' },
}

function AnimatedNumber({ target }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let v = 0
    const step = target / 40
    const t = setInterval(() => {
      v = Math.min(v + step, target)
      setVal(Math.floor(v))
      if (v >= target) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [target])
  return val.toLocaleString()
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const user     = useStore(s => s.user)

  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    fetch(`${API}/api/leaderboard`)
      .then(r => r.json())
      .then(d => { setData(d.leaderboard || []); setLoading(false) })
      .catch(() => { setError('Could not load leaderboard'); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? data
    : data.filter(u => u.tier?.toLowerCase() === filter)

  const top3    = filtered.slice(0, 3)
  const rest    = filtered.slice(3)
  const myRank  = data.findIndex(u => u.name === user?.name) + 1

  return (
    <div style={s.page}>
      <div style={s.bgBase} />
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />

      {/* Floating particles */}
      {['🌿','🏆','🌍','⭐','🔥'].map((e, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${[5,90,10,85,50][i]}%`,
          top:  `${[15,10,75,70,5][i]}%`,
          fontSize: 26, opacity: 0.05,
          animation: `floatItem ${[7,8,6,9,7][i]}s ease-in-out ${i*0.5}s infinite`,
          pointerEvents: 'none', zIndex: 0,
        }}>{e}</div>
      ))}

      {/* Navbar */}
      <nav style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/home')}>← Home</button>
        <span style={s.navTitle}>Leaderboard</span>
        <div style={{ width: 80 }} />
      </nav>

      <div style={s.wrap}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerIcon}>🏆</div>
          <h1 style={s.headerTitle}>Eco Warriors</h1>
          <p style={s.headerSub}>Top carbon savers this week. Every choice counts.</p>

          {/* My rank badge */}
          {myRank > 0 && (
            <div style={s.myRankBadge}>
              <span style={{ fontSize: 16 }}>👤</span>
              <span style={{ fontWeight: 700, color: 'var(--cream)' }}>
                You are ranked #{myRank}
              </span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div style={s.filterRow}>
          {['all','Bronze','Silver','Gold','Platinum'].map(f => (
            <button key={f}
              style={{
                ...s.filterBtn,
                background: filter === f
                  ? 'linear-gradient(135deg, var(--olive-dark), var(--olive))'
                  : 'rgba(255,255,255,0.7)',
                color: filter === f ? 'white' : 'var(--brown)',
                border: filter === f ? 'none' : '1px solid var(--beige-dark)',
              }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🌍 All'
               : f === 'Bronze'   ? '🥉 Bronze'
               : f === 'Silver'   ? '🥈 Silver'
               : f === 'Gold'     ? '🥇 Gold'
               : '💎 Platinum'}
            </button>
          ))}
        </div>

        {loading && (
          <div style={s.loadingWrap}>
            <div style={s.loadingSpinner} />
            <p style={{ color: 'var(--brown-light)', fontSize: 14 }}>Loading warriors...</p>
          </div>
        )}

        {error && (
          <div style={s.errorBox}>⚠️ {error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={s.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <p style={{ color: 'var(--brown-light)', fontSize: 14 }}>No warriors in this tier yet.</p>
          </div>
        )}

        {/* ── TOP 3 PODIUM ── */}
        {!loading && top3.length > 0 && (
          <div style={s.podiumWrap}>
            {/* Reorder: 2nd, 1st, 3rd */}
            {[top3[1], top3[0], top3[2]].map((u, podiumIdx) => {
              if (!u) return <div key={podiumIdx} style={{ flex: 1 }} />
              const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3
              const rc   = RANK_CONFIG[rank]
              const tc   = TIER_CONFIG[u.tier] || TIER_CONFIG.Bronze
              const heights = { 1: 140, 2: 110, 3: 90 }
              return (
                <div key={u.rank} style={{ ...s.podiumItem, zIndex: rank === 1 ? 2 : 1 }}>
                  {/* Crown for 1st */}
                  {rank === 1 && <div style={s.crown}>👑</div>}

                  {/* Avatar */}
                  <div style={{
                    ...s.podiumAvatar,
                    width: rc.size + 20, height: rc.size + 20,
                    background: tc.gradient,
                    boxShadow: `0 8px 24px ${rc.color}40`,
                  }}>
                    <span style={{ fontSize: rc.size * 0.5 }}>
                      {u.name?.[0]?.toUpperCase() || '🌿'}
                    </span>
                  </div>

                  {/* Name */}
                  <div style={s.podiumName}>{u.name}</div>
                  <div style={{ ...s.podiumTier, color: rc.color }}>
                    {tc.emoji} {u.tier}
                  </div>
                  <div style={s.podiumPts}>
                    <AnimatedNumber target={u.points} /> pts
                  </div>
                  <div style={s.podiumCarbon}>
                    🌍 {u.carbon_saved?.toFixed(1)}kg saved
                  </div>

                  {/* Podium base */}
                  <div style={{
                    ...s.podiumBase,
                    height: heights[rank],
                    background: rc.bg,
                    border: `2px solid ${rc.color}30`,
                  }}>
                    <span style={{ fontSize: 28, opacity: 0.6 }}>{rc.emoji}</span>
                    <span style={{ ...s.podiumRankNum, color: rc.color }}>#{rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── REST OF LIST ── */}
        {!loading && rest.length > 0 && (
          <div style={s.listWrap}>
            {rest.map((u, i) => {
              const rank = i + 4
              const tc   = TIER_CONFIG[u.tier] || TIER_CONFIG.Bronze
              const isMe = u.name === user?.name
              return (
                <div key={u.rank} style={{
                  ...s.listRow,
                  background: isMe ? 'rgba(74,124,89,0.08)' : 'rgba(255,255,255,0.82)',
                  border: isMe ? '1.5px solid rgba(74,124,89,0.25)' : '1px solid rgba(255,255,255,0.95)',
                }}>
                  {/* Rank */}
                  <div style={s.listRank}>#{rank}</div>

                  {/* Avatar */}
                  <div style={{ ...s.listAvatar, background: tc.gradient }}>
                    <span style={{ fontSize: 16, color: 'white', fontWeight: 800 }}>
                      {u.name?.[0]?.toUpperCase() || '🌿'}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={s.listInfo}>
                    <div style={s.listName}>
                      {u.name} {isMe && <span style={s.youBadge}>You</span>}
                    </div>
                    <div style={s.listMeta}>
                      {tc.emoji} {u.tier} · 🌍 {u.carbon_saved?.toFixed(1)}kg saved
                    </div>
                  </div>

                  {/* Points */}
                  <div style={s.listPts}>
                    <div style={s.listPtsVal}>{u.points?.toLocaleString()}</div>
                    <div style={s.listPtsLabel}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── BOTTOM CTA ── */}
        {!loading && (
          <div style={s.ctaCard}>
            <div style={s.ctaLeft}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
              <h3 style={s.ctaTitle}>Climb the ranks!</h3>
              <p style={s.ctaSub}>Scan receipts & swap high-carbon items to earn more points</p>
            </div>
            <div style={s.ctaBtns}>
              <button className="btn-primary"
                style={{ padding: '12px 20px', fontSize: 14 }}
                onClick={() => navigate('/receipt')}>
                📸 Scan Receipt
              </button>
              <button className="btn-terra"
                style={{ padding: '12px 20px', fontSize: 14 }}
                onClick={() => navigate('/online')}>
                🛒 Shop Online
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes floatItem {
          0%,100% { transform:translateY(0px) rotate(0deg); }
          33%      { transform:translateY(-14px) rotate(3deg); }
          66%      { transform:translateY(-6px) rotate(-2deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmerFill {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glowPulse {
          0%,100% { opacity:0.5; } 50% { opacity:1; }
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
    background: 'linear-gradient(145deg, #faf6f1 0%, #f0e8dc 50%, #faf6f1 100%)', zIndex: 0,
  },
  bgGlow1: {
    position: 'fixed', top: '-10%', right: '-5%', width: 450, height: 450,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.08) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0, animation: 'glowPulse 5s ease-in-out infinite',
  },
  bgGlow2: {
    position: 'fixed', bottom: '-10%', left: '-5%', width: 400, height: 400,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,124,89,0.07) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },

  nav: {
    position: 'sticky', top: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px',
    background: 'rgba(250,246,241,0.88)', backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(45,31,20,0.06)',
  },
  backBtn: {
    background: 'var(--beige)', border: '1px solid var(--beige-dark)',
    borderRadius: 100, padding: '8px 16px',
    fontSize: 13, fontWeight: 600, color: 'var(--brown)', cursor: 'pointer',
  },
  navTitle: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 18, color: 'var(--brown)',
  },

  wrap: {
    maxWidth: 600, margin: '0 auto',
    padding: '24px 20px 60px',
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', gap: 20,
  },

  header: { textAlign: 'center' },
  headerIcon: { fontSize: 52, marginBottom: 10 },
  headerTitle: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 32, color: 'var(--brown)', marginBottom: 8,
  },
  headerSub: { color: 'var(--brown-light)', fontSize: 14, lineHeight: 1.6, marginBottom: 14 },
  myRankBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'linear-gradient(135deg, var(--olive-dark), var(--olive))',
    borderRadius: 100, padding: '8px 18px',
    boxShadow: '0 4px 16px rgba(74,124,89,0.3)',
  },

  filterRow: {
    display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
  },
  filterBtn: {
    padding: '7px 14px', borderRadius: 100,
    fontSize: 12, fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.2s ease', fontFamily: 'DM Sans, sans-serif',
  },

  loadingWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 16, padding: 60,
  },
  loadingSpinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid var(--beige-dark)',
    borderTop: '3px solid var(--olive)',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    background: '#fff5f2', border: '1.5px solid #f5c5b0',
    color: 'var(--terra-dark)', borderRadius: 14,
    padding: '14px 18px', fontSize: 14, fontWeight: 500, textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center', padding: '40px 20px',
  },

  // Podium
  podiumWrap: {
    display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center', gap: 12,
    padding: '20px 10px 0',
  },
  podiumItem: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6, maxWidth: 160,
  },
  crown: { fontSize: 28, marginBottom: -4 },
  podiumAvatar: {
    borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 900,
    transition: 'all 0.3s ease',
  },
  podiumName: {
    fontSize: 12, fontWeight: 800, color: 'var(--brown)',
    textAlign: 'center', maxWidth: 120,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  podiumTier: { fontSize: 11, fontWeight: 700 },
  podiumPts: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 16, color: 'var(--brown)',
  },
  podiumCarbon: { fontSize: 10, color: 'var(--brown-light)', marginBottom: 4 },
  podiumBase: {
    width: '100%', borderRadius: '14px 14px 0 0',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backdropFilter: 'blur(10px)',
  },
  podiumRankNum: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900, fontSize: 20,
  },

  // List
  listWrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  listRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    backdropFilter: 'blur(20px)', borderRadius: 16,
    padding: '14px 16px',
    boxShadow: '0 2px 12px rgba(45,31,20,0.06)',
    transition: 'all 0.2s ease',
  },
  listRank: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 16, color: 'var(--brown-light)', width: 32, textAlign: 'center',
  },
  listAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  listInfo: { flex: 1 },
  listName: {
    fontSize: 14, fontWeight: 700, color: 'var(--brown)',
    marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8,
  },
  listMeta: { fontSize: 11, color: 'var(--brown-light)' },
  youBadge: {
    background: 'rgba(74,124,89,0.12)', color: 'var(--olive)',
    fontSize: 10, fontWeight: 800, padding: '2px 8px',
    borderRadius: 100, border: '1px solid rgba(74,124,89,0.2)',
  },
  listPts: { textAlign: 'right' },
  listPtsVal: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 18, color: 'var(--brown)',
  },
  listPtsLabel: { fontSize: 10, color: 'var(--brown-light)' },

  // CTA
  ctaCard: {
    background: 'linear-gradient(135deg, #1c1208 0%, #2d1f14 60%, #3a2518 100%)',
    borderRadius: 20, padding: '24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 20, flexWrap: 'wrap',
    boxShadow: '0 12px 40px rgba(45,31,20,0.2)',
  },
  ctaLeft: { flex: 1 },
  ctaTitle: {
    fontFamily: 'Playfair Display, serif', fontWeight: 900,
    fontSize: 20, color: 'var(--cream)', marginBottom: 6,
  },
  ctaSub: { fontSize: 13, color: 'rgba(250,246,241,0.5)', lineHeight: 1.5 },
  ctaBtns: { display: 'flex', gap: 10, flexWrap: 'wrap' },
}