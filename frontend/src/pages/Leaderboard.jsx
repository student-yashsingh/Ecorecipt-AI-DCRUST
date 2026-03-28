import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const TIER_EMOJI = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎'
}

const RANK_STYLE = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-amber-500 text-amber-900',
}

export default function Leaderboard() {
  const navigate     = useNavigate()
  const user         = useStore(state => state.user)
  const firebaseUser = useStore(state => state.firebaseUser)

  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        setLeaders(data.leaderboard || [])
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load leaderboard. Try again later.")
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate('/home')}
              className="text-yellow-900 hover:text-black text-2xl leading-none"
            >←</button>
            <h1 className="text-2xl font-black text-yellow-900">🏆 Leaderboard</h1>
          </div>
          <p className="text-yellow-800 text-sm ml-9">
            Top eco warriors this week
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">

        {/* Your rank card */}
        {user && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">Your standing</p>
              <p className="font-bold text-white">{user.name || user.phone}</p>
              <p className="text-yellow-400 text-sm mt-0.5">
                {(user.points || 0).toLocaleString()} pts · {TIER_EMOJI[user.tier || 'Bronze']} {user.tier || 'Bronze'}
              </p>
            </div>
            <div className="text-4xl">
              {TIER_EMOJI[user.tier || 'Bronze']}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 animate-bounce">🏆</div>
            <p>Loading leaderboard...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 rounded-xl p-4 text-red-300 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Leaderboard list */}
        {!loading && !error && (
          <div className="space-y-3">
            {leaders.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-5xl mb-3">🌱</div>
                <p>No entries yet — be the first!</p>
              </div>
            )}

            {leaders.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 rounded-2xl p-4 border transition-all
                  ${entry.rank <= 3
                    ? 'bg-gray-800 border-yellow-600/40'
                    : 'bg-gray-900 border-gray-800'
                  }`}
              >
                {/* Rank badge */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0
                  ${RANK_STYLE[entry.rank] || 'bg-gray-700 text-gray-300'}`}
                >
                  {entry.rank}
                </div>

                {/* Name + tier */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{entry.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {TIER_EMOJI[entry.tier]} {entry.tier} ·{' '}
                    {(entry.carbon_saved || 0).toFixed(1)} kg CO₂ saved
                  </p>
                </div>

                {/* Points */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-yellow-400">
                    {(entry.points || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && leaders.length > 0 && (
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
            <p className="text-gray-400 text-sm">
              Earn more points by scanning receipts and making eco swaps 🌿
            </p>
            <button
              onClick={() => navigate('/home')}
              className="mt-3 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-xl transition-colors text-sm"
            >
              Start Earning →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
