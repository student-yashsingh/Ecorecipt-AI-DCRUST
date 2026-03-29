import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { API } from '../api'

const TIER_CONFIG = {
  Bronze:   { gradient: 'linear-gradient(135deg,#cd7f32,#a0522d)', emoji: '🥉', next: 500  },
  Silver:   { gradient: 'linear-gradient(135deg,#9aa0a6,#6b7280)', emoji: '🥈', next: 2000 },
  Gold:     { gradient: 'linear-gradient(135deg,#d4a017,#b8860b)', emoji: '🥇', next: 5000 },
  Platinum: { gradient: 'linear-gradient(135deg,#00b4d8,#0077b6)', emoji: '💎', next: 5000 },
}

const GRADE_COLOR = {
  'A+': '#1a6b3c', 'A': '#2d9b5a', 'B': '#d97706',
  'C':  '#ea580c', 'D': '#dc2626', 'F': '#9b1c1c',
}

export default function Profile() {
  const navigate     = useNavigate()
  const user         = useStore(s => s.user)
  const setUser      = useStore(s => s.setUser)
  const firebaseUser = useStore(s => s.firebaseUser)
  const logout       = useStore(s => s.logout)

  const [name,        setName]        = useState(user?.name    || '')
  const [city,        setCity]        = useState(user?.city    || '')
  const [pincode,     setPincode]     = useState(user?.pincode || '')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')
  const [activeTab,   setActiveTab]   = useState('profile')
  const [history,     setHistory]     = useState([])
  const [histLoading, setHistLoading] = useState(false)

  useEffect(() => {
    if (!user || !firebaseUser) return
    firebaseUser.getIdToken().then(token => {
      // Profile fetch
      fetch(`${API}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          setUser({ ...user, ...data })
          setName(data.name    || '')
          setCity(data.city    || '')
          setPincode(data.pincode || '')
        })
        .catch(() => {})

      // History fetch
      setHistLoading(true)
      fetch(`${API}/api/user/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { setHistory(data.history || []); setHistLoading(false) })
        .catch(() => setHistLoading(false))
    })
  }, [])

  async function handleSave() {
    if (!firebaseUser) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const token = await firebaseUser.getIdToken()
      const res   = await fetch(`${API}/api/user/profile`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ name, city, pincode }),
      })
      if (!res.ok) throw new Error('Save failed')
      const data = await res.json()
      setUser({ ...user, ...data })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Could not save. Try again.')
    }
    setSaving(false)
  }

  function handleLogout() { logout(); navigate('/') }

  if (!user) { navigate('/'); return null }

  const tier     = user.tier || 'Bronze'
  const tc       = TIER_CONFIG[tier]
  const points   = user.points || 0
  const carbon   = user.carbon_saved || 0
  const streak   = user.streak_days  || 0
  const cashback = (points * 0.10).toFixed(0)
  const progress = tier === 'Platinum' ? 100 : Math.min((points / tc.next) * 100, 100)

  const ACHIEVEMENTS = [
    { icon: '🌱', title: 'First Scan',    desc: 'Upload your first receipt',      done: points > 100  },
    { icon: '🔥', title: 'On Fire',       desc: '7 day streak achieved',           done: streak >= 7   },
    { icon: '🌍', title: 'Carbon Saver',  desc: 'Save 1kg of CO₂',                done: carbon >= 1   },
    { icon: '🛒', title: 'Eco Shopper',   desc: 'Make first eco swap on Blinkit',  done: points > 200  },
    { icon: '🥈', title: 'Silver Status', desc: 'Reach Silver tier',              done: ['Silver','Gold','Platinum'].includes(tier) },
    { icon: '💎', title: 'Legend',        desc: 'Reach Platinum tier',            done: tier === 'Platinum' },
  ]

  const TABS = [
    { id: 'profile',      label: '👤 Profile'      },
    { id: 'history',      label: '📊 History'      },
    { id: 'achievements', label: '🏆 Badges'       },
    { id: 'account',      label: '⚙️ Account'      },
  ]

  return (
    <div style={s.page}>
      <div style={s.bgBase} />
      <div style={s.bgGlow1} />
      <div style={s.bgGlow2} />

      {['🌿','🥦','🍅','🌾','🥕'].map((e, i) => (
        <div key={i} style={{
          position: 'fixed',
          left: `${[5,88,12,80,50][i]}%`,
          top:  `${[12,8,78,72,5][i]}%`,
          fontSize: 26, opacity: 0.05,
          animation: `floatItem ${[7,8,6,9,7][i]}s ease-in-out ${i*0.4}s infinite`,
          pointerEvents: 'none', zIndex: 0,
        }}>{e}</div>
      ))}

      {/* Navbar */}
      <nav style={s.nav}>
        <button style={s.backBtn} onClick={() => navigate('/home')}>← Home</button>
        <span style={s.navTitle}>My Profile</span>
        <button style={s.logoutBtn} onClick={handleLogout}>↩ Logout</button>
      </nav>

      <div style={s.wrap}>

        {/* ── HERO CARD ── */}
        <div style={s.heroCard}>
          <div style={s.heroDeco1} />
          <div style={s.heroDeco2} />

          <div style={s.avatarSection}>
            <div style={{ ...s.avatarRing, background: tc.gradient }}>
              <div style={s.avatarInner}>
                <span style={s.avatarText}>
                  {name ? name[0].toUpperCase() : '🌿'}
                </span>
              </div>
            </div>
            <div style={s.avatarInfo}>
              <h2 style={s.avatarName}>{name || 'Eco Warrior'}</h2>
              <div style={{ ...s.tierBadge, background: tc.gradient }}>
                {tc.emoji} {tier}
              </div>
              <p style={s.avatarPhone}>📱 {user.phone || 'No phone'}</p>
            </div>
          </div>

          {tier !== 'Platinum' && (
            <div style={s.progressWrap}>
              <div style={s.progressLabels}>
                <span>{points.toLocaleString()} pts</span>
                <span>{tc.next.toLocaleString()} for next tier</span>
              </div>
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div style={s.statsGrid}>
            {[
              { icon: '⭐', val: points.toLocaleString(), label: 'Total Points' },
              { icon: '🌍', val: `${carbon.toFixed(1)}kg`, label: 'CO₂ Saved'  },
              { icon: '🔥', val: `${streak}d`,             label: 'Day Streak' },
              { icon: '💰', val: `₹${cashback}`,           label: 'Cashback'   },
            ].map((st, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statIcon}>{st.icon}</div>
                <div style={s.statVal}>{st.val}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={s.tabs}>
          {TABS.map(tab => (
            <button key={tab.id}
              style={{
                ...s.tab,
                background: activeTab === tab.id ? 'rgba(255,255,255,0.95)' : 'transparent',
                color:      activeTab === tab.id ? 'var(--brown)' : 'var(--brown-light)',
                fontWeight: activeTab === tab.id ? 800 : 500,
                boxShadow:  activeTab === tab.id ? '0 2px 12px rgba(45,31,20,0.08)' : 'none',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div style={s.card}>
            <div style={s.cardAccent} />
            <h3 style={s.cardTitle}>Personal Information</h3>
            <p style={s.cardSub}>This helps us personalise your eco journey</p>

            {[
              { label: 'Full Name',        val: name,    set: setName,    ph: 'Your name',                  maxLen: 50  },
              { label: 'City',             val: city,    set: setCity,    ph: 'e.g. Delhi, Mumbai',         maxLen: 50  },
              { label: 'Default Pincode',  val: pincode, set: setPincode, ph: 'e.g. 121001',                maxLen: 6,
                hint: 'Used for Blinkit product search by default',
                filter: v => v.replace(/\D/g,'') },
            ].map((field, i) => (
              <div key={i} style={s.formGroup}>
                <label style={s.label}>{field.label}</label>
                <input
                  style={s.input}
                  placeholder={field.ph}
                  value={field.val}
                  maxLength={field.maxLen}
                  onChange={e => field.set(field.filter ? field.filter(e.target.value) : e.target.value)}
                />
                {field.hint && <p style={s.inputHint}>{field.hint}</p>}
              </div>
            ))}

            {error && <div style={s.errorBox}>⚠️ {error}</div>}
            {saved  && <div style={s.successBox}>✅ Profile saved successfully!</div>}

            <button
              style={{
                ...s.saveBtn,
                opacity: saving ? 0.7 : 1,
                cursor:  saving ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <span style={s.spinner} /> Saving...
                  </span>
                : '💾 Save Profile'
              }
            </button>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Chart card */}
            <div style={s.card}>
              <div style={s.cardAccent} />
              <h3 style={s.cardTitle}>CO₂ Per Purchase</h3>
              <p style={s.cardSub}>Your last {Math.min(history.length, 8)} purchases</p>

              {histLoading && (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--brown-light)' }}>
                  Loading chart...
                </div>
              )}

              {!histLoading && history.length === 0 && (
                <div style={{ textAlign:'center', padding:'32px 0' }}>
                  <div style={{ fontSize:40, marginBottom:8 }}>🌱</div>
                  <p style={{ color:'var(--brown-light)', fontSize:14 }}>
                    No purchases yet. Scan a receipt or shop online!
                  </p>
                </div>
              )}

              {!histLoading && history.length > 0 && (() => {
                const recent    = history.slice(0, 8).reverse()
                const maxCarbon = Math.max(...recent.map(p => p.total_carbon_kg), 1)
                return (
                  <div>
                    {/* Bars */}
                    <div style={{
                      display:'flex', alignItems:'flex-end', gap:8,
                      height:130, marginBottom:8,
                    }}>
                      {recent.map((p, i) => {
                        const pct   = (p.total_carbon_kg / maxCarbon) * 100
                        const color = GRADE_COLOR[p.eco_score] || '#9db89d'
                        return (
                          <div key={i} style={{
                            flex:1, display:'flex', flexDirection:'column',
                            alignItems:'center', gap:4,
                          }}>
                            <span style={{ fontSize:9, color:'var(--brown-light)', fontWeight:700 }}>
                              {p.total_carbon_kg.toFixed(1)}
                            </span>
                            <div style={{
                              width:'100%',
                              height:`${Math.max(pct, 5)}%`,
                              background: color,
                              borderRadius:'6px 6px 0 0',
                              transition:'height 0.6s ease',
                              minHeight:6,
                            }} />
                            <span style={{ fontSize:9, color:'var(--brown-light)' }}>
                              {p.eco_score}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* X axis */}
                    <div style={{ height:1, background:'var(--beige-dark)', marginBottom:10 }} />

                    {/* Legend */}
                    <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                      {[
                        { color:'#1a6b3c', label:'A+/A — Low'    },
                        { color:'#d97706', label:'B/C — Medium'   },
                        { color:'#dc2626', label:'D/F — High'     },
                      ].map((l, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:10, height:10, borderRadius:3, background:l.color }} />
                          <span style={{ fontSize:10, color:'var(--brown-light)' }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Purchase list */}
            <div style={s.card}>
              <div style={s.cardAccent} />
              <h3 style={s.cardTitle}>Purchase History</h3>
              <p style={s.cardSub}>{history.length} total purchases</p>

              {histLoading && (
                <div style={{ textAlign:'center', padding:'20px 0', color:'var(--brown-light)' }}>
                  Loading...
                </div>
              )}

              {!histLoading && history.length === 0 && (
                <p style={{ color:'var(--brown-light)', fontSize:14, textAlign:'center', padding:'20px 0' }}>
                  No history yet.
                </p>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {history.map((p) => {
                  const gradeColor = GRADE_COLOR[p.eco_score] || '#9db89d'
                  const modeIcon   = p.mode === 'receipt' ? '🧾' : '🛒'
                  const modeLabel  = p.mode === 'receipt' ? 'Receipt Scan' : 'Online Shop'
                  return (
                    <div key={p.id} style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'12px 14px', background:'var(--beige)',
                      borderRadius:14, border:'1px solid var(--beige-dark)',
                    }}>
                      <div style={{
                        width:40, height:40, borderRadius:12, flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:20, background:'rgba(255,255,255,0.6)',
                      }}>
                        {modeIcon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                          <span style={{ fontSize:13, fontWeight:700, color:'var(--brown)' }}>
                            {modeLabel}
                          </span>
                          <span style={{
                            fontSize:10, fontWeight:800,
                            color: gradeColor,
                            background:`${gradeColor}18`,
                            padding:'2px 7px', borderRadius:100,
                          }}>
                            {p.eco_score}
                          </span>
                        </div>
                        <div style={{ fontSize:11, color:'var(--brown-light)' }}>
                          {p.item_count} items · {p.total_carbon_kg.toFixed(2)} kg CO₂ · {p.created_at}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:'var(--olive-dark)' }}>
                          +{p.points_earned}
                        </div>
                        <div style={{ fontSize:10, color:'var(--brown-light)' }}>pts</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── ACHIEVEMENTS TAB ── */}
        {activeTab === 'achievements' && (
          <div style={s.card}>
            <div style={s.cardAccent} />
            <h3 style={s.cardTitle}>Achievements</h3>
            <p style={s.cardSub}>
              {ACHIEVEMENTS.filter(a => a.done).length} of {ACHIEVEMENTS.length} unlocked
            </p>

            <div style={s.achProgressTrack}>
              <div style={{
                ...s.achProgressFill,
                width: `${(ACHIEVEMENTS.filter(a=>a.done).length / ACHIEVEMENTS.length) * 100}%`
              }} />
            </div>

            <div style={s.achievementGrid}>
              {ACHIEVEMENTS.map((ach, i) => (
                <div key={i} style={{
                  ...s.achCard,
                  opacity:    ach.done ? 1 : 0.4,
                  background: ach.done ? 'rgba(74,124,89,0.08)' : 'var(--beige)',
                  border:     ach.done ? '1.5px solid rgba(74,124,89,0.2)' : '1px solid var(--beige-dark)',
                }}>
                  <div style={{ ...s.achIcon, filter: ach.done ? 'none' : 'grayscale(100%)' }}>
                    {ach.icon}
                  </div>
                  <div style={{ ...s.achTitle, color: ach.done ? 'var(--olive-dark)' : 'var(--brown-light)' }}>
                    {ach.title}
                  </div>
                  <div style={s.achDesc}>{ach.desc}</div>
                  {ach.done && <div style={s.achDone}>✓ Done</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'account' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={s.card}>
              <div style={s.cardAccent} />
              <h3 style={s.cardTitle}>Account Details</h3>
              <div style={s.accountRows}>
                {[
                  { label:'Phone',        val: user.phone || '—',             icon:'📱' },
                  { label:'Tier',         val: `${tc.emoji} ${tier}`,         icon:'🏅' },
                  { label:'Member Since', val: 'Active',                      icon:'📅' },
                  { label:'Points',       val: `${points.toLocaleString()} pts`, icon:'⭐' },
                ].map((row, i) => (
                  <div key={i} style={s.accountRow}>
                    <span style={s.accountIcon}>{row.icon}</span>
                    <div style={s.accountInfo}>
                      <div style={s.accountLabel}>{row.label}</div>
                      <div style={s.accountVal}>{row.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.card}>
              <h3 style={s.cardTitle}>Quick Actions</h3>
              <div style={s.quickLinks}>
                {[
                  { icon:'🏆', label:'View Leaderboard', path:'/leaderboard' },
                  { icon:'🧾', label:'Scan a Receipt',   path:'/receipt'     },
                  { icon:'🛒', label:'Shop on Blinkit',  path:'/online'      },
                  { icon:'🏠', label:'Go to Dashboard',  path:'/home'        },
                ].map((link, i) => (
                  <button key={i} style={s.quickLink}
                    onClick={() => navigate(link.path)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,124,89,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--beige)'}
                  >
                    <span style={{ fontSize:22 }}>{link.icon}</span>
                    <span style={s.quickLinkLabel}>{link.label}</span>
                    <span style={s.quickLinkArrow}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={s.dangerCard}>
              <h3 style={s.dangerTitle}>⚠️ Account Actions</h3>
              <p style={s.dangerSub}>These actions affect your session</p>
              <button style={s.logoutBigBtn} onClick={handleLogout}>↩ Sign Out</button>
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
        @keyframes glowPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shimmerFill {
          0%   { background-position:-200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}

const s = {
  page:    { minHeight:'100vh', fontFamily:'DM Sans, sans-serif', position:'relative', overflowX:'hidden' },
  bgBase:  { position:'fixed', inset:0, background:'linear-gradient(145deg,#faf6f1 0%,#f0e8dc 50%,#faf6f1 100%)', zIndex:0 },
  bgGlow1: { position:'fixed', top:'-10%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(74,124,89,0.08) 0%,transparent 70%)', pointerEvents:'none', zIndex:0, animation:'glowPulse 5s ease-in-out infinite' },
  bgGlow2: { position:'fixed', bottom:'-10%', left:'-5%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(193,102,58,0.07) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },

  nav:       { position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'rgba(250,246,241,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(45,31,20,0.06)' },
  backBtn:   { background:'var(--beige)', border:'1px solid var(--beige-dark)', borderRadius:100, padding:'8px 16px', fontSize:13, fontWeight:600, color:'var(--brown)', cursor:'pointer' },
  navTitle:  { fontFamily:'Playfair Display, serif', fontWeight:900, fontSize:18, color:'var(--brown)' },
  logoutBtn: { background:'rgba(193,102,58,0.08)', border:'1px solid rgba(193,102,58,0.2)', borderRadius:100, padding:'8px 14px', fontSize:13, fontWeight:600, color:'var(--terra)', cursor:'pointer' },

  wrap: { maxWidth:560, margin:'0 auto', padding:'24px 20px 60px', position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:16 },

  heroCard:  { borderRadius:24, padding:'28px 24px', background:'linear-gradient(135deg,#1c1208 0%,#2d1f14 55%,#3a2518 100%)', position:'relative', overflow:'hidden', boxShadow:'0 20px 60px rgba(45,31,20,0.25)' },
  heroDeco1: { position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(74,124,89,0.18) 0%,transparent 70%)', pointerEvents:'none' },
  heroDeco2: { position:'absolute', bottom:-30, left:-30, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle,rgba(193,102,58,0.12) 0%,transparent 70%)', pointerEvents:'none' },

  avatarSection: { display:'flex', alignItems:'center', gap:18, marginBottom:20, position:'relative', zIndex:1 },
  avatarRing:    { width:80, height:80, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', padding:3, boxShadow:'0 8px 24px rgba(0,0,0,0.25)' },
  avatarInner:   { width:'100%', height:'100%', borderRadius:'50%', background:'rgba(28,18,8,0.5)', display:'flex', alignItems:'center', justifyContent:'center' },
  avatarText:    { fontSize:30, fontWeight:900, color:'white', fontFamily:'Playfair Display, serif' },
  avatarInfo:    { flex:1 },
  avatarName:    { fontFamily:'Playfair Display, serif', fontWeight:900, fontSize:22, color:'var(--cream)', marginBottom:6 },
  tierBadge:     { display:'inline-block', padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:700, color:'white', marginBottom:6 },
  avatarPhone:   { fontSize:12, color:'rgba(250,246,241,0.4)', margin:0 },

  progressWrap:   { marginBottom:20, position:'relative', zIndex:1 },
  progressLabels: { display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(250,246,241,0.4)', marginBottom:8 },
  progressTrack:  { height:6, background:'rgba(255,255,255,0.08)', borderRadius:10, overflow:'hidden' },
  progressFill:   { height:'100%', borderRadius:10, background:'linear-gradient(90deg,var(--olive),var(--terra-light))', backgroundSize:'200% auto', animation:'shimmerFill 3s linear infinite', transition:'width 1s cubic-bezier(0.22,1,0.36,1)' },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, position:'relative', zIndex:1 },
  statCard:  { background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'12px 6px', textAlign:'center', border:'1px solid rgba(255,255,255,0.06)' },
  statIcon:  { fontSize:18, marginBottom:4 },
  statVal:   { fontFamily:'Playfair Display, serif', fontWeight:900, fontSize:15, color:'var(--cream)', marginBottom:2 },
  statLabel: { fontSize:9, color:'rgba(250,246,241,0.35)', fontWeight:500 },

  tabs: { display:'flex', gap:6, background:'rgba(255,255,255,0.5)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.9)', borderRadius:16, padding:4 },
  tab:  { flex:1, padding:'10px 6px', borderRadius:12, border:'none', fontSize:12, cursor:'pointer', transition:'all 0.25s ease', fontFamily:'DM Sans, sans-serif' },

  card:      { background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.95)', borderRadius:20, padding:'24px', overflow:'hidden', position:'relative', boxShadow:'0 4px 20px rgba(45,31,20,0.07)' },
  cardAccent:{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,var(--olive),var(--terra),var(--olive-light))', backgroundSize:'200% auto', animation:'shimmerFill 3s linear infinite' },
  cardTitle: { fontFamily:'Playfair Display, serif', fontWeight:900, fontSize:18, color:'var(--brown)', marginBottom:4 },
  cardSub:   { fontSize:12, color:'var(--brown-light)', marginBottom:20 },

  formGroup: { marginBottom:16 },
  label:     { display:'block', fontSize:11, fontWeight:700, color:'var(--olive-dark)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 },
  input:     { width:'100%', padding:'13px 16px', borderRadius:12, border:'1.5px solid var(--beige-dark)', background:'rgba(255,255,255,0.9)', fontSize:15, fontFamily:'DM Sans, sans-serif', color:'var(--brown)', outline:'none', transition:'all 0.3s ease', boxSizing:'border-box' },
  inputHint: { fontSize:11, color:'var(--brown-light)', marginTop:6 },
  errorBox:  { background:'#fff5f2', border:'1.5px solid #f5c5b0', color:'var(--terra-dark)', borderRadius:12, padding:'10px 14px', fontSize:13, fontWeight:500, marginBottom:14 },
  successBox:{ background:'rgba(74,124,89,0.08)', border:'1.5px solid rgba(74,124,89,0.2)', color:'var(--olive-dark)', borderRadius:12, padding:'10px 14px', fontSize:13, fontWeight:500, marginBottom:14 },
  saveBtn:   { width:'100%', padding:'14px 0', fontSize:15, fontWeight:700, background:'linear-gradient(135deg,#2d1f14,#4a3728)', color:'white', border:'none', borderRadius:14, cursor:'pointer', fontFamily:'DM Sans, sans-serif' },
  spinner:   { width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' },

  achProgressTrack: { height:6, background:'var(--beige)', borderRadius:10, overflow:'hidden', marginBottom:20 },
  achProgressFill:  { height:'100%', borderRadius:10, background:'linear-gradient(90deg,var(--olive),var(--terra-light))', transition:'width 1s cubic-bezier(0.22,1,0.36,1)' },
  achievementGrid:  { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 },
  achCard:   { borderRadius:14, padding:'16px 14px', display:'flex', flexDirection:'column', gap:4, transition:'all 0.2s ease' },
  achIcon:   { fontSize:28, marginBottom:4 },
  achTitle:  { fontSize:13, fontWeight:800 },
  achDesc:   { fontSize:11, color:'var(--brown-light)', lineHeight:1.4 },
  achDone:   { fontSize:10, fontWeight:800, color:'var(--olive)', background:'rgba(74,124,89,0.12)', borderRadius:100, padding:'3px 10px', alignSelf:'flex-start', marginTop:4 },

  accountRows: { display:'flex', flexDirection:'column', gap:12 },
  accountRow:  { display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--beige)', borderRadius:12, border:'1px solid var(--beige-dark)' },
  accountIcon: { fontSize:22, flexShrink:0 },
  accountInfo: { flex:1 },
  accountLabel:{ fontSize:11, color:'var(--brown-light)', fontWeight:600, marginBottom:2 },
  accountVal:  { fontSize:14, fontWeight:700, color:'var(--brown)' },

  quickLinks:    { display:'flex', flexDirection:'column', gap:8, marginTop:16 },
  quickLink:     { display:'flex', alignItems:'center', gap:12, padding:'13px 14px', background:'var(--beige)', borderRadius:12, border:'1px solid var(--beige-dark)', cursor:'pointer', transition:'background 0.2s ease', fontFamily:'DM Sans, sans-serif' },
  quickLinkLabel:{ flex:1, fontSize:14, fontWeight:600, color:'var(--brown)', textAlign:'left' },
  quickLinkArrow:{ fontSize:16, color:'var(--brown-light)' },

  dangerCard:   { background:'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(193,102,58,0.15)', borderRadius:20, padding:'24px', boxShadow:'0 4px 20px rgba(45,31,20,0.07)' },
  dangerTitle:  { fontFamily:'Playfair Display, serif', fontWeight:900, fontSize:17, color:'var(--terra-dark)', marginBottom:4 },
  dangerSub:    { fontSize:12, color:'var(--brown-light)', marginBottom:16 },
  logoutBigBtn: { width:'100%', padding:'13px 0', background:'rgba(193,102,58,0.08)', border:'1.5px solid rgba(193,102,58,0.25)', borderRadius:12, color:'var(--terra-dark)', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', transition:'all 0.2s ease' },
}