import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import VerifyOTP from './pages/VerifyOTP'
import Home from './pages/Home'
import ReceiptMode from './pages/ReceiptMode'
import OnlineMode from './pages/OnlineMode'
import Leaderboard from './pages/Leaderboard'
import useStore from './store/useStore'

function ProtectedRoute({ children }) {
  const user = useStore(state => state.user)
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/receipt" element={
          <ProtectedRoute><ReceiptMode /></ProtectedRoute>
        } />
        <Route path="/online" element={
          <ProtectedRoute><OnlineMode /></ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute><Leaderboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}