import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Splash        from './pages/Splash'
import Login         from './pages/Login'
import VerifyOTP     from './pages/VerifyOTP'
import HowItWorks    from './pages/HowItWorks'
import Home          from './pages/Home'
import ReceiptMode   from './pages/ReceiptMode'
import OnlineMode    from './pages/OnlineMode'
import Leaderboard   from './pages/Leaderboard'
import Profile       from './pages/Profile'
import OrderSuccess  from './pages/OrderSuccess'
import useStore      from './store/useStore'

function ProtectedRoute({ children }) {
  const user = useStore(state => state.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"            element={<Splash />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/verify"      element={<VerifyOTP />} />
        <Route path="/onboarding"  element={<HowItWorks />} />

        {/* Protected */}
        <Route path="/home"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/receipt"     element={<ProtectedRoute><ReceiptMode /></ProtectedRoute>} />
        <Route path="/online"      element={<ProtectedRoute><OnlineMode /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/success"     element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}