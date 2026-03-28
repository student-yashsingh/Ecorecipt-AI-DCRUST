import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const TIER_COLORS = {
  Bronze:   'from-orange-400 to-amber-500',
  Silver:   'from-gray-400 to-slate-500',
  Gold:     'from-yellow-400 to-amber-500',
  Platinum: 'from-cyan-400 to-blue-500',
}

const TIER_EMOJI = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎'
}

export default function Home() {
  const navigate = useNavigate()
  const user = useStore(state => state.user)
  const setUser = useStore(state => state.setUser)

  useEffect(() => {
    if (!user) return
    // Refresh profile from backend
    fetch('http://localhost:8000/api/user/profile', {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(r => r.json())
      .then(data => setUser({ ...data, token: user.token }))
      .catch(() => {})
  }, [])

  if (!user) return null

  const tier = user.tier || 'Bronze'
  const points = user.points || 0
  const carbonSaved = user.carbon_saved || 0

  // Points to next tier
  const tierThresholds = { Bronze: 500, Silver: 2000, Gold: 5000, Platinum: 5000 }
  const nextThreshold = tierThresholds[tier]
  const progress = tier === 'Platinum' ? 100 : Math.min((points / nextThreshold) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className={`bg-gradient-to-r ${TIER_COLORS[tier]} p-6 text-white`}>
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white/80 text-sm">Welcome back</p>
              <h1 className="text-xl font-bold">{user.name || user.phone}</h1>
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm font-medium"
            >
              🏆 Leaderboard
            </button>
          </div>

          {/* Points Card */}
          <div className="bg-white/20 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">Eco Points</span>
              <span className="text-sm font-medium">
                {TIER_EMOJI[tier]} {tier}
              </span>
            </div>
            <div className="text-4xl font-bold mb-3">{points.toLocaleString()}</div>
            {tier !== 'Platinum' && (
              <>
                <div className="bg-white/30 rounded-full h-2 mb-1">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/70 text-xs">
                  {nextThreshold - points} pts to next tier
                </p>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{carbonSaved.toFixed(1)}</div>
              <div className="text-white/70 text-xs">kg CO₂ saved</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{user.streak_days || 0}</div>
              <div className="text-white/70 text-xs">day streak 🔥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="max-w-lg mx-auto p-4 space-y-4 mt-4">
        <h2 className="text-gray-700 font-semibold text-lg">Choose a mode</h2>

        {/* Receipt Mode */}
        <button
          onClick={() => navigate('/receipt')}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🧾</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">Receipt Mode</h3>
              <p className="text-gray-500 text-sm mt-0.5">
                Upload a grocery receipt and get your carbon footprint score instantly
              </p>
              <div className="flex gap-2 mt-2">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">+10 pts upload</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">+50 pts A+ score</span>
              </div>
            </div>
            <div className="text-gray-400 text-xl">→</div>
          </div>
        </button>

        {/* Online Mode */}
        <button
          onClick={() => navigate('/online')}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">🛒</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg">Online Mode</h3>
              <p className="text-gray-500 text-sm mt-0.5">
                Shop on Blinkit through our app and earn points for eco-friendly swaps
              </p>
              <div className="flex gap-2 mt-2">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">+25 pts per swap</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Live carbon scores</span>
              </div>
            </div>
            <div className="text-gray-400 text-xl">→</div>
          </div>
        </button>

        {/* Cashback Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-amber-800 text-sm">
            💰 Your {points} points = <span className="font-bold">₹{(points * 0.10).toFixed(0)}</span> cashback value
          </p>
        </div>
      </div>
    </div>
  )
}