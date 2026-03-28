import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const TIER_EMOJI = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎' }

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useStore()

  if (!user) { navigate('/'); return null }

  const tier    = user.tier || 'Bronze'
  const points  = user.points || 0
  const carbon  = user.carbon_saved || 0
  const cashback = (points * 0.10).toFixed(0)

  const stats = [
    { icon: '🌿', label: 'Eco Points',   value: points.toLocaleString() + ' pts' },
    { icon: '🌍', label: 'CO₂ Saved',    value: carbon.toFixed(1) + ' kg'        },
    { icon: '💰', label: 'Cashback',      value: '₹' + cashback                   },
    { icon: '🔥', label: 'Streak',        value: (user.streak_days || 0) + ' days'},
  ]

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(145deg,#e8f5e9 0%,#f0f7f0 50%,#e0f2f1 100%)' }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(26,107,60,0.08)' }}>
        <button onClick={() => navigate('/home')}
          className="flex items-center gap-2 font-semibold text-sm transition-all hover:scale-105"
          style={{ color: '#1a6b3c' }}>
          ← Back
        </button>
        <span className="font-black text-lg" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
          Profile
        </span>
        <div className="w-16" />
      </nav>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* Avatar card */}
        <div className="rounded-3xl p-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1a3d1a 0%,#1a6b3c 60%,#2d9b5a 100%)', color: 'white' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,white,transparent)' }} />

          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}>
            {user?.name ? user.name[0].toUpperCase() : '🌿'}
          </div>

          <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            {user.name || 'Eco Warrior'}
          </h1>
          <p className="text-green-300 text-sm mb-3">{user.phone}</p>

          {/* Tier badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
            {TIER_EMOJI[tier]} {tier} Member
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(26,107,60,0.12)', backdropFilter: 'blur(10px)' }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-black text-xl" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
                {s.value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#5a7a5a' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(26,107,60,0.12)', backdropFilter: 'blur(10px)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(26,107,60,0.08)' }}>
            <p className="font-black" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>Account</p>
          </div>
          {[
            { label: 'Phone', value: user.phone },
            { label: 'City',  value: user.city || 'Not set' },
            { label: 'Member since', value: 'EcoReceipt AI' },
          ].map((row, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: i < 2 ? '1px solid rgba(26,107,60,0.06)' : 'none' }}>
              <span className="text-sm" style={{ color: '#5a7a5a' }}>{row.label}</span>
              <span className="text-sm font-semibold" style={{ color: '#1a3d1a' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#dc2626' }}>
          ↩ Sign Out
        </button>

      </div>
    </div>
  )
}