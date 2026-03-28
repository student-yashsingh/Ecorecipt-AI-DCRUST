import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

const API = "http://127.0.0.1:8000";

const GRADE_CONFIG = {
  "A+": { color: "#1a6b3c", bg: "rgba(26,107,60,0.08)", border: "rgba(26,107,60,0.25)", label: "Outstanding", emoji: "🌟" },
  "A":  { color: "#2d9b5a", bg: "rgba(45,155,90,0.08)", border: "rgba(45,155,90,0.25)", label: "Excellent",    emoji: "✨" },
  "B":  { color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.25)",  label: "Good",         emoji: "👍" },
  "C":  { color: "#ea580c", bg: "rgba(234,88,12,0.08)",  border: "rgba(234,88,12,0.25)",  label: "Average",      emoji: "⚠️" },
  "D":  { color: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.25)",  label: "Poor",         emoji: "📉" },
  "F":  { color: "#9b1c1c", bg: "rgba(155,28,28,0.08)",  border: "rgba(155,28,28,0.25)",  label: "Very High Impact", emoji: "🔴" },
};

const CARBON_COLOR = (kg) =>
  kg > 5 ? "#dc2626" : kg > 2 ? "#ea580c" : kg > 1 ? "#d97706" : "#1a6b3c";

export default function ReceiptMode() {
  const navigate = useNavigate();
  const { user, setUser, firebaseUser } = useStore();
  const fileInputRef = useRef(null);

  const [image,    setImage]    = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [result,   setResult]   = useState(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    setError("");
    setResult(null);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function analyseReceipt() {
    if (!image) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", image);
      const res  = await fetch(`${API}/api/receipt/analyze`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${await firebaseUser.getIdToken()}` },
        body:    form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Analysis failed");
      setResult(data);
      if (data.new_total_points !== undefined)
        setUser({ ...user, points: data.new_total_points, tier: data.tier });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError("");
  }

  const grade = result ? (GRADE_CONFIG[result.eco_score] || GRADE_CONFIG["C"]) : null;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(145deg,#e8f5e9 0%,#f0f7f0 50%,#e0f2f1 100%)" }}
    >
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          background:    "rgba(255,255,255,0.7)",
          backdropFilter:"blur(20px)",
          borderBottom:  "1px solid rgba(26,107,60,0.08)",
        }}
      >
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 font-semibold text-sm transition-all hover:scale-105"
          style={{ color: "#1a6b3c" }}
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🧾</span>
          <span
            className="font-black text-lg"
            style={{ color: "#1a3d1a", fontFamily: "Fraunces, serif" }}
          >
            Receipt Mode
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: "rgba(26,107,60,0.08)", color: "#1a6b3c" }}
        >
          🌿 {user?.points || 0} pts
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* ── Upload Phase ── */}
        {!result && (
          <>
            {/* Hero text */}
            <div className="text-center pt-2 pb-1">
              <h1
                className="text-3xl font-black mb-2"
                style={{ color: "#1a3d1a", fontFamily: "Fraunces, serif" }}
              >
                Scan Your Receipt
              </h1>
              <p className="text-sm" style={{ color: "#5a7a5a" }}>
                Upload any grocery receipt and our AI calculates your carbon footprint instantly
              </p>
            </div>

            {/* Points reminder */}
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: "rgba(255,255,255,0.6)",
                border:     "1px solid rgba(26,107,60,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              {[
                { pts: "+10",  label: "Submitting", icon: "📤" },
                { pts: "+50",  label: "Eco Score A+", icon: "🌟" },
                { pts: "+40",  label: "Eco Score A",  icon: "✨" },
              ].map((item, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="text-lg mb-0.5">{item.icon}</div>
                  <div className="font-black text-sm" style={{ color: "#1a6b3c" }}>{item.pts}</div>
                  <div className="text-xs" style={{ color: "#5a7a5a" }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className="rounded-3xl p-8 text-center cursor-pointer transition-all duration-300"
              style={{
                background:   dragging
                  ? "rgba(26,107,60,0.08)"
                  : "rgba(255,255,255,0.55)",
                border:       `2px dashed ${dragging ? "#1a6b3c" : "rgba(26,107,60,0.25)"}`,
                backdropFilter: "blur(10px)",
                transform:    dragging ? "scale(1.01)" : "scale(1)",
              }}
            >
              {preview ? (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Receipt preview"
                    className="max-h-64 mx-auto rounded-2xl object-contain shadow-lg"
                    style={{ border: "1px solid rgba(26,107,60,0.15)" }}
                  />
                  <p className="text-sm font-medium" style={{ color: "#1a6b3c" }}>
                    ✅ {image.name}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105"
                    style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto"
                    style={{ background: "rgba(26,107,60,0.08)" }}
                  >
                    🧾
                  </div>
                  <div>
                    <p className="font-black text-lg" style={{ color: "#1a3d1a", fontFamily: "Fraunces, serif" }}>
                      Drop your receipt here
                    </p>
                    <p className="text-sm mt-1" style={{ color: "#5a7a5a" }}>
                      or click to browse files
                    </p>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ background: "rgba(26,107,60,0.08)", color: "#1a6b3c" }}
                  >
                    📁 JPG, PNG · Max 10MB
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {/* Error */}
            {error && (
              <div
                className="rounded-2xl p-4 text-sm flex items-start gap-3"
                style={{
                  background: "rgba(220,38,38,0.06)",
                  border:     "1px solid rgba(220,38,38,0.2)",
                  color:      "#dc2626",
                }}
              >
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Analyse button */}
            <button
              onClick={analyseReceipt}
              disabled={!image || loading}
              className="w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: image && !loading
                  ? "linear-gradient(135deg, #1a3d1a, #1a6b3c)"
                  : "rgba(26,107,60,0.1)",
                color:      image && !loading ? "white" : "#9db89d",
                cursor:     image && !loading ? "pointer" : "not-allowed",
                boxShadow:  image && !loading
                  ? "0 8px 32px rgba(26,107,60,0.25)"
                  : "none",
                fontFamily: "Fraunces, serif",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Analysing with AI...
                </span>
              ) : (
                "🔍 Analyse Receipt"
              )}
            </button>
          </>
        )}

        {/* ── Results Phase ── */}
        {result && grade && (
          <div className="space-y-5">

            {/* Eco score hero */}
            <div
              className="rounded-3xl p-8 text-center relative overflow-hidden"
              style={{
                background:     grade.bg,
                border:         `1px solid ${grade.border}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
                style={{ background: `radial-gradient(circle, ${grade.color}, transparent)` }}
              />
              <p className="text-sm font-semibold mb-2" style={{ color: grade.color }}>
                {grade.emoji} {grade.label}
              </p>
              <div
                className="text-8xl font-black mb-3"
                style={{ color: grade.color, fontFamily: "Fraunces, serif" }}
              >
                {result.eco_score}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm" style={{ color: "#5a7a5a" }}>
                <span>🌍 {result.total_carbon_kg} kg CO₂</span>
                <span>·</span>
                <span>🛒 {result.item_count} items</span>
              </div>
            </div>

            {/* Points earned */}
            <div
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{
                background:     "rgba(255,255,255,0.6)",
                border:         "1px solid rgba(26,107,60,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div>
                <p
                  className="font-black text-xl"
                  style={{ color: "#1a6b3c", fontFamily: "Fraunces, serif" }}
                >
                  +{result.points_earned} pts earned!
                </p>
                <p className="text-sm mt-0.5" style={{ color: "#5a7a5a" }}>
                  Total: {result.new_total_points} pts · {result.tier}
                </p>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "rgba(26,107,60,0.08)" }}
              >
                🏆
              </div>
            </div>

            {/* Items list */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background:     "rgba(255,255,255,0.6)",
                border:         "1px solid rgba(26,107,60,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid rgba(26,107,60,0.08)" }}
              >
                <h2
                  className="font-black"
                  style={{ color: "#1a3d1a", fontFamily: "Fraunces, serif" }}
                >
                  Items Analysed
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: "rgba(26,107,60,0.06)" }}>
                {result.items.map((item, i) => (
                  <div key={i} className="px-5 py-4 flex items-start gap-3">
                    {/* Carbon dot indicator */}
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ background: CARBON_COLOR(item.carbon_kg) }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold capitalize truncate"
                        style={{ color: "#1a3d1a" }}
                      >
                        {item.item_name}
                      </p>
                      {item.alternative && item.category !== "Low" && (
                        <p className="text-xs mt-0.5" style={{ color: "#1a6b3c" }}>
                          💡 {item.alternative}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-black text-sm"
                        style={{ color: CARBON_COLOR(item.carbon_kg) }}
                      >
                        {item.carbon_kg} kg
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#9db89d" }}>
                        {item.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carbon breakdown bar */}
            <div
              className="rounded-2xl p-5"
              style={{
                background:     "rgba(255,255,255,0.6)",
                border:         "1px solid rgba(26,107,60,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p className="text-sm font-bold mb-3" style={{ color: "#1a3d1a" }}>
                Impact Breakdown
              </p>
              <div className="space-y-2">
                {result.items
                  .slice()
                  .sort((a, b) => b.carbon_kg - a.carbon_kg)
                  .slice(0, 5)
                  .map((item, i) => {
                    const max  = result.total_carbon_kg || 1;
                    const pct  = Math.max(4, (item.carbon_kg / max) * 100);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <p
                          className="text-xs capitalize w-28 truncate flex-shrink-0"
                          style={{ color: "#5a7a5a" }}
                        >
                          {item.item_name}
                        </p>
                        <div
                          className="flex-1 rounded-full h-2"
                          style={{ background: "rgba(26,107,60,0.08)" }}
                        >
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{
                              width:      `${pct}%`,
                              background: CARBON_COLOR(item.carbon_kg),
                            }}
                          />
                        </div>
                        <p
                          className="text-xs font-bold w-12 text-right flex-shrink-0"
                          style={{ color: CARBON_COLOR(item.carbon_kg) }}
                        >
                          {item.carbon_kg}kg
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pb-4">
              <button
                onClick={reset}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border:     "1px solid rgba(26,107,60,0.2)",
                  color:      "#1a6b3c",
                }}
              >
                📷 Scan Another
              </button>
              <button
                onClick={() => navigate("/home")}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #1a3d1a, #1a6b3c)",
                  color:      "white",
                  boxShadow:  "0 4px 16px rgba(26,107,60,0.25)",
                  fontFamily: "Fraunces, serif",
                }}
              >
                🏠 Home
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}