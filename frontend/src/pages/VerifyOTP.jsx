import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function VerifyOTP() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const confirmationResult = useStore(state => state.confirmationResult)
  const setUser = useStore(state => state.setUser)
  const setFirebaseUser = useStore(state => state.setFirebaseUser)

  const handleVerify = async () => {
    setError('')
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    if (!confirmationResult) {
      setError('Session expired. Please go back and request a new OTP.')
      return
    }

    setLoading(true)
    try {
      // Confirm OTP with Firebase
      const result = await confirmationResult.confirm(otp)
      const firebaseUser = result.user
      setFirebaseUser(firebaseUser)

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken()

      // Send token to our backend
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Backend login failed')
      }

      const data = await response.json()
      setUser({ ...data.user, token })
      navigate('/home')

    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Wrong OTP. Please check and try again.')
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please go back and request a new one.')
      } else {
        setError('Verification failed. Please try again.')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📱</div>
          <h1 className="text-2xl font-bold text-gray-800">Enter OTP</h1>
          <p className="text-gray-500 mt-1">We sent a 6-digit code to your number</p>
        </div>

        {/* OTP Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            6-digit OTP
          </label>
          <input
            type="tel"
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter OTP"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 text-center text-2xl tracking-widest"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          {loading ? 'Verifying...' : 'Verify OTP →'}
        </button>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm py-2"
        >
          ← Back to Login
        </button>

      </div>
    </div>
  )
}