import { useState, useEffect } from "react"

const API = "http://localhost:8000"

// ─────────────────────────────────────────
// CARBON COLOR HELPER
// ─────────────────────────────────────────
function carbonColor(score) {
  if (score <= 1.0) return { bg: "#d1fae5", text: "#065f46", label: "A+" }
  if (score <= 2.5) return { bg: "#bbf7d0", text: "#166534", label: "A"  }
  if (score <= 5.0) return { bg: "#fef9c3", text: "#854d0e", label: "B"  }
  if (score <= 10)  return { bg: "#fed7aa", text: "#9a3412", label: "C"  }
  return               { bg: "#fecaca", text: "#991b1b", label: "D"  }
}

function ecoGrade(items) {
  if (!items.length) return "—"
  const avg = items.reduce((s, i) => s + (i.carbon_score || 0), 0) / items.length
  if (avg < 1.0)  return "A+"
  if (avg < 2.5)  return "A"
  if (avg < 5.0)  return "B"
  if (avg < 10.0) return "C"
  if (avg < 15.0) return "D"
  return "F"
}

function gradeColor(g) {
  if (g === "A+" || g === "A") return "#16a34a"
  if (g === "B")               return "#ca8a04"
  if (g === "C")               return "#ea580c"
  return                              "#dc2626"
}

// ─────────────────────────────────────────
// PHASE A — PINCODE SCREEN
// ─────────────────────────────────────────
function PincodeScreen({ onConfirm }) {
  const [pin, setPin] = useState("")
  const [err, setErr] = useState("")

  function handleSubmit() {
    if (!/^\d{6}$/.test(pin)) { setErr("Enter a valid 6-digit pincode"); return }
    onConfirm(pin)
  }

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
        <h2 style={styles.title}>Where are you shopping?</h2>
        <p style={styles.sub}>We'll show Blinkit products available at your location</p>
        <input
          style={styles.input}
          placeholder="Enter pincode (e.g. 121001)"
          value={pin}
          maxLength={6}
          onChange={e => { setPin(e.target.value); setErr("") }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        {err && <p style={styles.err}>{err}</p>}
        <button style={styles.btn} onClick={handleSubmit}>
          🛒 Start Shopping
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────
function ProductCard({ product, onAdd, inCart }) {
  const c = carbonColor(product.carbon_score)
  return (
    <div style={{ ...styles.productCard, opacity: inCart ? 0.6 : 1 }}>
      <div style={styles.productEmoji}>{product.image}</div>
      <div style={styles.productName}>{product.name}</div>
      <div style={styles.productBrand}>{product.brand}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={styles.price}>₹{product.price}</span>
        <span style={{ ...styles.badge, background: c.bg, color: c.text }}>
          CO₂ {product.carbon_score} kg
        </span>
      </div>
      <button
        style={{ ...styles.addBtn, background: inCart ? "#6b7280" : "#16a34a" }}
        onClick={() => !inCart && onAdd(product)}
      >
        {inCart ? "✓ Added" : "+ Add to Cart"}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────
// CART ITEM ROW
// ─────────────────────────────────────────
function CartItem({ item, onRemove, onSwap, swapProduct }) {
  const c = carbonColor(item.carbon_score)
  const hasSwap = item.carbon_score > 2.5 && item.alternative

  return (
    <div style={styles.cartItem}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{item.image} {item.raw_name}</span>
        <button onClick={() => onRemove(item.id)} style={styles.removeBtn}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
        <span style={styles.price}>₹{item.price}</span>
        <span style={{ ...styles.badge, background: c.bg, color: c.text, fontSize: 11 }}>
          {c.label} · {item.carbon_score}kg CO₂
        </span>
      </div>
      {hasSwap && swapProduct && (
        <button
          style={styles.swapBtn}
          onClick={() => onSwap(item, swapProduct)}
        >
          🌱 Swap → {swapProduct.raw_name} (CO₂ {swapProduct.carbon_score}kg) · ₹{swapProduct.price}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// PHASE D — REDIRECT + SCREENSHOT UPLOAD
// ─────────────────────────────────────────
function VerifyScreen({ sessionId, cartItems, token, onDone }) {
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [err, setErr]         = useState("")
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  function fmt(s) {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  async function handleVerify() {
    if (!screenshot) { setErr("Please upload your order screenshot"); return }
    setLoading(true); setErr("")
    const form = new FormData()
    form.append("screenshot", screenshot)
    form.append("session_id", sessionId)
    try {
      const res = await fetch(`${API}/api/online/verify-purchase`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setErr("Verification failed. Try again.")
    }
    setLoading(false)
  }

  if (result) return (
    <div style={styles.center}>
      <div style={styles.card}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <h2 style={styles.title}>Order Verified!</h2>
        <p style={{ color: "#16a34a", fontWeight: 700, fontSize: 20 }}>
          +{result.points_earned} pts earned
        </p>
        <p style={{ color: "#6b7280" }}>Eco Score: <b>{result.eco_score}</b></p>
        <p style={{ color: "#6b7280" }}>{result.items_confirmed?.length || 0} items confirmed</p>
        <button style={styles.btn} onClick={onDone}>Back to Home</button>
      </div>
    </div>
  )

  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <div style={{ fontSize: 48 }}>⏱️</div>
        <h2 style={styles.title}>Complete your order on Blinkit</h2>
        <p style={styles.sub}>Time since redirect: <b>{fmt(elapsed)}</b></p>
        <p style={styles.sub}>Once you've placed the order, upload your confirmation screenshot below.</p>

        <label style={styles.uploadBox}>
          {screenshot
            ? <span>✅ {screenshot.name}</span>
            : <span>📸 Click to upload order screenshot</span>
          }
          <input
            type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => setScreenshot(e.target.files[0])}
          />
        </label>

        {err && <p style={styles.err}>{err}</p>}

        <button style={styles.btn} onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "✅ I've placed my order — Verify"}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
export default function OnlineMode() {
  const [phase, setPhase]         = useState("pincode")   // pincode | shop | verify
  const [pincode, setPincode]     = useState("")
  const [query, setQuery]         = useState("")
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [cart, setCart]           = useState([])
  const [swapped, setSwapped]     = useState([])           // ids that were swapped
  const [sessionId, setSessionId] = useState(null)
  const [token, setToken]         = useState(null)
  const [searchErr, setSearchErr] = useState("")

  // Get Firebase token on mount
  useEffect(() => {
    import("../firebase").then(({ auth }) => {
      const user = auth.currentUser
      if (user) user.getIdToken().then(setToken)
    }).catch(() => {})
  }, [])

  // ── SEARCH ──
  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true); setSearchErr(""); setProducts([])
    try {
      const res  = await fetch(`${API}/api/online/search?query=${encodeURIComponent(query)}&pincode=${pincode}`)
      const data = await res.json()
      if (!data.results?.length) setSearchErr("No products found. Try another search.")
      setProducts(data.results || [])
    } catch {
      setSearchErr("Could not reach server. Is backend running?")
    }
    setLoading(false)
  }

  // ── CART ──
  function addToCart(product) {
    if (cart.find(p => p.id === product.id)) return
    setCart(prev => [...prev, product])
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p.id !== id))
    setSwapped(prev => prev.filter(i => i !== id))
  }

  // Find a lower-carbon product from current search results to swap to
  function findSwapProduct(item) {
    return products.find(p =>
      p.id !== item.id &&
      p.carbon_score < item.carbon_score &&
      !cart.find(c => c.id === p.id)
    ) || null
  }

  function handleSwap(item, swapProduct) {
    setCart(prev => prev.map(p => p.id === item.id ? swapProduct : p))
    setSwapped(prev => [...prev, swapProduct.id])
  }

  function optimiseAll() {
    let updated = [...cart]
    cart.forEach(item => {
      if (item.carbon_score > 2.5) {
        const swap = products.find(p =>
          p.id !== item.id &&
          p.carbon_score < item.carbon_score &&
          !updated.find(c => c.id === p.id)
        )
        if (swap) {
          updated = updated.map(p => p.id === item.id ? swap : p)
          setSwapped(prev => [...prev, swap.id])
        }
      }
    })
    setCart(updated)
  }

  // ── REDIRECT TO BLINKIT ──
  async function handleRedirect() {
    if (!cart.length) return
    const altAccepted = swapped.length
    const totalCarbon = cart.reduce((s, i) => s + i.carbon_score, 0)

    try {
      const res = await fetch(`${API}/api/online/cart/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pincode,
          items: cart,
          alternatives_accepted: altAccepted,
          total_carbon: totalCarbon,
        }),
      })
      const data = await res.json()
      setSessionId(data.session_id)

      await fetch(`${API}/api/online/redirect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: data.session_id }),
      })
    } catch (e) {
      console.error("Cart save failed:", e)
    }

    window.open("https://blinkit.com", "_blank")
    setPhase("verify")
  }

  // ── TOTALS ──
  const totalCarbon  = cart.reduce((s, i) => s + (i.carbon_score || 0), 0).toFixed(1)
  const totalPrice   = cart.reduce((s, i) => s + (i.price || 0), 0).toFixed(0)
  const grade        = ecoGrade(cart)
  const gradeClr     = gradeColor(grade)

  // ────────────────────────────────────────
  if (phase === "pincode") return <PincodeScreen onConfirm={p => { setPincode(p); setPhase("shop") }} />
  if (phase === "verify")  return <VerifyScreen sessionId={sessionId} cartItems={cart} token={token} onDone={() => window.location.href = "/home"} />

  // ── SHOP PHASE ──
  return (
    <div style={styles.shopLayout}>

      {/* ── LEFT: Search + Products ── */}
      <div style={styles.leftPanel}>
        <div style={styles.searchBar}>
          <button style={styles.backBtn} onClick={() => setPhase("pincode")}>← {pincode}</button>
          <input
            style={styles.searchInput}
            placeholder="Search groceries... (butter, milk, rice)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button style={styles.searchBtn} onClick={handleSearch} disabled={loading}>
            {loading ? "..." : "Search"}
          </button>
        </div>

        {searchErr && <p style={{ color: "#dc2626", padding: "0 16px" }}>{searchErr}</p>}

        {loading && (
          <div style={styles.center}>
            <p style={{ color: "#6b7280", marginTop: 60 }}>🔍 Searching Blinkit...</p>
          </div>
        )}

        <div style={styles.productGrid}>
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={addToCart}
              inCart={!!cart.find(c => c.id === p.id)}
            />
          ))}
        </div>

        {!loading && !products.length && !searchErr && (
          <div style={styles.emptyState}>
            <p>🛒 Search for groceries above to see eco scores</p>
          </div>
        )}
      </div>

      {/* ── RIGHT: Cart ── */}
      <div style={styles.cartPanel}>
        <h3 style={styles.cartTitle}>🛒 Your Cart</h3>

        {!cart.length && (
          <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", marginTop: 20 }}>
            Add products to see eco scores
          </p>
        )}

        {cart.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={removeFromCart}
            onSwap={handleSwap}
            swapProduct={findSwapProduct(item)}
          />
        ))}

        {cart.length > 0 && (
          <>
            <div style={styles.cartSummary}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>Total CO₂</span>
                <span style={{ fontWeight: 700 }}>{totalCarbon} kg</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>Total Price</span>
                <span style={{ fontWeight: 700 }}>₹{totalPrice}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>Eco Score</span>
                <span style={{ fontWeight: 700, color: gradeClr, fontSize: 18 }}>{grade}</span>
              </div>
            </div>

            <button style={styles.optimiseBtn} onClick={optimiseAll}>
              🌿 Optimise Cart
            </button>
            <button style={styles.orderBtn} onClick={handleRedirect}>
              Order on Blinkit →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = {
  center:       { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f9fafb" },
  card:         { background: "#fff", borderRadius: 16, padding: 36, maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  title:        { fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 },
  sub:          { color: "#6b7280", fontSize: 14, marginBottom: 20 },
  input:        { width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #d1d5db", fontSize: 16, outline: "none", boxSizing: "border-box", marginBottom: 8 },
  btn:          { width: "100%", padding: "13px 0", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  err:          { color: "#dc2626", fontSize: 13, marginBottom: 8 },
  uploadBox:    { display: "block", border: "2px dashed #d1d5db", borderRadius: 10, padding: "24px 16px", cursor: "pointer", color: "#6b7280", marginBottom: 16, marginTop: 8 },

  shopLayout:   { display: "flex", minHeight: "100vh", background: "#f3f4f6" },
  leftPanel:    { flex: 1, padding: 0, overflowY: "auto" },
  rightPanel:   { width: 320 },

  searchBar:    { display: "flex", gap: 8, padding: 16, background: "#fff", borderBottom: "1px solid #e5e7eb", alignItems: "center" },
  backBtn:      { background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13, color: "#374151", whiteSpace: "nowrap" },
  searchInput:  { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 15, outline: "none" },
  searchBtn:    { padding: "10px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" },

  productGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, padding: 16 },
  productCard:  { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "opacity 0.2s" },
  productEmoji: { fontSize: 36, textAlign: "center", marginBottom: 8 },
  productName:  { fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2, lineHeight: 1.3 },
  productBrand: { fontSize: 11, color: "#9ca3af", marginBottom: 4 },
  price:        { fontWeight: 700, color: "#111827", fontSize: 15 },
  badge:        { fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 7px" },
  addBtn:       { width: "100%", marginTop: 10, padding: "8px 0", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 },

  cartPanel:    { width: 300, background: "#fff", borderLeft: "1px solid #e5e7eb", padding: 16, overflowY: "auto", display: "flex", flexDirection: "column" },
  cartTitle:    { fontWeight: 700, fontSize: 17, marginBottom: 12, color: "#111827" },
  cartItem:     { background: "#f9fafb", borderRadius: 10, padding: 12, marginBottom: 10 },
  removeBtn:    { background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 14 },
  swapBtn:      { marginTop: 6, width: "100%", padding: "6px 8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 7, color: "#15803d", fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left" },
  cartSummary:  { background: "#f9fafb", borderRadius: 10, padding: 12, margin: "12px 0" },
  optimiseBtn:  { width: "100%", padding: "10px 0", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 9, color: "#15803d", fontWeight: 600, cursor: "pointer", marginBottom: 8, fontSize: 14 },
  orderBtn:     { width: "100%", padding: "13px 0", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 15 },
  emptyState:   { textAlign: "center", color: "#9ca3af", padding: 60, fontSize: 15 },
}
