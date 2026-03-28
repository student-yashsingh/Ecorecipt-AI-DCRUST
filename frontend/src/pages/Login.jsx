import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../firebase'
import useStore from '../store/useStore'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const setConfirmationResult = useStore(state => state.setConfirmationResult)
  const recaptchaRef = useRef(null)

  useEffect(() => {
    // Set up invisible reCAPTCHA
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
  }, [])

  const handleSendOTP = async () => {
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const fullPhone = `+91${digits}`
      const result = await signInWithPhoneNumber(auth, fullPhone, recaptchaRef.current)
      setConfirmationResult(result)
      navigate('/verify')
    } catch (err) {
      setError('Failed to send OTP. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-gray-800">EcoReceipt AI</h1>
          <p className="text-gray-500 mt-1">Shop smarter. Save the planet.</p>
        </div>

        {/* Phone Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit number"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Send OTP Button */}
        <button
          onClick={handleSendOTP}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          {loading ? 'Sending OTP...' : 'Send OTP →'}
        </button>

        {/* reCAPTCHA container (invisible) */}
        <div id="recaptcha-container"></div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to receive an OTP on your number
        </p>
      </div>
    </div>
  )
}