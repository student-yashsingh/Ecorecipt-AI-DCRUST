import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function VerifyOTP() {
  const navigate           = useNavigate()
  const confirmationResult = useStore(s => s.confirmationResult)
  const setUser            = useStore(s => s.setUser)
  const setFirebaseUser    = useStore(s => s.setFirebaseUser)

  const [otp, setOtp]       = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const inputs = useRef([])

  // Handle each box input
  function handleChange(val, idx) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  async function handleVerify() {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter all 6 digits'); return }
    if (!confirmationResult) { setError('Session expired. Go back and request a new OTP.'); return }

    setError('')
    setLoading(true)
    try {
      const result      = await confirmationResult.confirm(code)
      const fbUser      = result.user
      setFirebaseUser(fbUser)
      const token       = await fbUser.getIdToken()

      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Backend login failed')

      const data = await res.json()
      setUser({ ...data.user, token })
      setSuccess(true)
      setTimeout(() => navigate('/home'), 900)
    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Wrong OTP. Please check and try again.')
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Go back and request a new one.')
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #e8f5e9 0%, #f0f7f0 40%, #e0f2f1 100%)' }}>

      {/* Background decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2d9b5a, transparent)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1a6b3c, transparent)', filter: 'blur(60px)' }} />

      {/* Floating leaves */}
      <div className="absolute top-20 left-10 text-4xl opacity-20 float-anim pointer-events-none">🍃</div>
      <div className="absolute bottom-32 right-16 text-3xl opacity-20 pointer-events-none"
        style={{ animation: 'float 7s ease-in-out infinite', animationDelay: '2s' }}>🌿</div>
      <div className="absolute top-1/2 left-8 text-2xl opacity-10 pointer-events-none"
        style={{ animation: 'float 9s ease-in-out infinite', animationDelay: '4s' }}>🍀</div>

      {/* Card */}
      <div className="glass p-8 lg:p-10 w-full max-w-md mx-4 relative z-10">

        {/* Back button */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold mb-6 transition-all hover:-translate-x-1"
          style={{ color: '#1a6b3c' }}>
          ← Back
        </button>

        {/* Icon */}
        <div className="fade-in-up text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4"
            style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}>
            <span className="text-4xl">📱</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1a6b3c, #2d9b5a)' }}>
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
            Verify OTP
          </h1>
          <p className="text-sm" style={{ color: '#5a7a5a' }}>
            We sent a 6-digit code to your mobile.<br />
            Enter it below to continue.
          </p>
        </div>

        {/* OTP boxes */}
        <div className="fade-in-up delay-1 flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputs.current[idx] = el}
              type="tel"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(e.target.value, idx)}
              onKeyDown={e => handleKeyDown(e, idx)}
              className="w-12 h-14 text-center text-2xl font-black rounded-2xl outline-none transition-all duration-200"
              style={{
                background: digit ? 'white' : 'rgba(255,255,255,0.6)',
                border: digit ? '2px solid #1a6b3c' : '1.5px solid #c8e6c9',
                color: '#1a3d1a',
                boxShadow: digit ? '0 0 0 4px rgba(26,107,60,0.08)' : 'none',
                fontFamily: 'Manrope, sans-serif',
              }}
            />
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((d, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: d ? '#1a6b3c' : '#c8e6c9' }} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="fade-in-up mb-4 px-4 py-3 rounded-2xl text-sm font-medium"
            style={{ background: '#fff0f0', border: '1.5px solid #ffcdd2', color: '#c62828' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="fade-in-up mb-4 px-4 py-3 rounded-2xl text-sm font-medium text-center"
            style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#15803d' }}>
            ✅ Verified! Taking you in...
          </div>
        )}

        {/* Verify button */}
        <div className="fade-in-up delay-2">
          <button
            onClick={handleVerify}
            disabled={loading || success || otp.join('').length < 6}
            className="btn-primary w-full py-4 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                  style={{ animation: 'spin 0.8s linear infinite' }} />
                Verifying...
              </span>
            ) : success ? '✅ Verified!' : 'Verify & Continue →'}
          </button>
        </div>

        {/* Resend */}
        <div className="fade-in-up delay-3 text-center mt-5">
          <p className="text-sm" style={{ color: '#9db89d' }}>
            Didn't receive it?{' '}
            <button onClick={() => navigate('/')}
              className="font-bold transition-colors"
              style={{ color: '#1a6b3c' }}>
              Resend OTP
            </button>
          </p>
        </div>

        {/* Security note */}
        <div className="fade-in-up delay-4 flex items-center justify-center gap-2 mt-6 pt-6"
          style={{ borderTop: '1px solid #e8f5e9' }}>
          <span style={{ color: '#9db89d' }} className="text-xs">🔒 Secured by Firebase Authentication</span>
        </div>

      </div>
    </div>
  )
}
