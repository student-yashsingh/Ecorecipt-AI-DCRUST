import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase'
import useStore from '../store/useStore'

export default function Login() {
  const navigate = useNavigate()
  const setConfirmationResult = useStore(s => s.setConfirmationResult)
  const [phone, setPhone]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function sendOTP() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth, 'recaptcha-container', { size: 'invisible' }
        )
      }
      const result = await signInWithPhoneNumber(auth, `+91${digits}`, window.recaptchaVerifier)
      setConfirmationResult(result)
      setSent(true)
      setTimeout(() => navigate('/verify'), 800)
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Try again.')
      window.recaptchaVerifier = null
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(145deg, #e8f5e9 0%, #f0f7f0 40%, #e0f2f1 100%)' }}>

      {/* ── Left Panel — Illustration side ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a3d1a 0%, #1a6b3c 50%, #2d9b5a 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #52c77e, transparent)' }} />
        <div className="absolute bottom-20 -right-10 w-60 h-60 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a3d977, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />

        {/* Logo */}
        <div className="fade-in-up relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(255,255,255,0.15)' }}>🌿</div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'Fraunces, serif' }}>
              EcoReceipt AI
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="float-anim">
            <div className="text-8xl mb-6">🌳</div>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight"
            style={{ fontFamily: 'Fraunces, serif' }}>
            Small Actions,<br />
            <span style={{ color: '#a3d977' }}>Big Impact.</span>
          </h1>
          <p className="text-green-200 text-lg leading-relaxed max-w-sm">
            Every grocery choice you make has a carbon footprint. Track it, improve it, and earn rewards along the way.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 pt-4">
            {[
              { val: '2.4kg', label: 'Avg CO₂ saved' },
              { val: '500+', label: 'Eco warriors' },
              { val: '₹0.10', label: 'Per point value' },
            ].map((s, i) => (
              <div key={i} className="fade-in-up" style={{ animationDelay: `${0.2 + i * 0.1}s`, opacity: 0 }}>
                <div className="text-2xl font-black text-white">{s.val}</div>
                <div className="text-green-300 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badges */}
        <div className="fade-in-up delay-4 flex gap-3 relative z-10">
          {['🥉 Bronze', '🥈 Silver', '🥇 Gold', '💎 Platinum'].map((t, i) => (
            <div key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel — Login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 fade-in-up">
            <span className="text-5xl">🌿</span>
            <h2 className="text-2xl font-black mt-2" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
              EcoReceipt AI
            </h2>
          </div>

          {/* Form card */}
          <div className="glass p-8 lg:p-10">
            <div className="fade-in-up mb-8">
              <h2 className="text-3xl font-black mb-2" style={{ color: '#1a3d1a', fontFamily: 'Fraunces, serif' }}>
                Welcome back 👋
              </h2>
              <p style={{ color: '#5a7a5a' }} className="text-sm">
                Enter your mobile number to continue your eco journey
              </p>
            </div>

            {/* Phone field */}
            <div className="fade-in-up delay-1 mb-5">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: '#1a6b3c' }}>
                Mobile Number
              </label>
              <div className="flex gap-3">
                <div className="nature-input flex items-center justify-center font-bold text-center"
                  style={{ width: '70px', flexShrink: 0, color: '#1a6b3c' }}>
                  +91
                </div>
                <input
                  className="nature-input"
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && sendOTP()}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="fade-in-up mb-4 px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: '#fff0f0', border: '1.5px solid #ffcdd2', color: '#c62828' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Success */}
            {sent && (
              <div className="fade-in-up mb-4 px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#15803d' }}>
                ✅ OTP sent! Redirecting...
              </div>
            )}

            {/* Submit */}
            <div className="fade-in-up delay-2">
              <button
                onClick={sendOTP}
                disabled={loading || sent || phone.length < 10}
                className="btn-primary w-full py-4 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Sending OTP...
                  </span>
                ) : 'Continue →'}
              </button>
            </div>

            {/* Divider */}
            <div className="fade-in-up delay-3 flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: '#e2f0e2' }} />
              <span className="text-xs" style={{ color: '#9db89d' }}>secure & private</span>
              <div className="flex-1 h-px" style={{ background: '#e2f0e2' }} />
            </div>

            {/* Trust badges */}
            <div className="fade-in-up delay-4 grid grid-cols-3 gap-3">
              {[
                { icon: '🔒', text: 'OTP Auth' },
                { icon: '🌿', text: 'Eco Rewards' },
                { icon: '📊', text: 'AI Analysis' },
              ].map((b, i) => (
                <div key={i} className="text-center py-3 px-2 rounded-2xl"
                  style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                  <div className="text-xl mb-1">{b.icon}</div>
                  <div className="text-xs font-semibold" style={{ color: '#1a6b3c' }}>{b.text}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#9db89d' }}>
            By continuing, you agree to our Terms of Service.<br />Your data is never sold.
          </p>
        </div>
      </div>

      <div id="recaptcha-container" />
    </div>
  )
}