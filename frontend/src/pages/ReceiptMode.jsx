import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

const API = "http://127.0.0.1:8000";

const gradeColor = {
  "A+": "text-emerald-400", A: "text-green-400", B: "text-yellow-400",
  C: "text-orange-400",     D: "text-red-400",   F: "text-red-600",
};

const gradeBackground = {
  "A+": "bg-emerald-900/40 border-emerald-500", A: "bg-green-900/40 border-green-500",
  B: "bg-yellow-900/40 border-yellow-500",       C: "bg-orange-900/40 border-orange-500",
  D: "bg-red-900/40 border-red-500",             F: "bg-red-950/40 border-red-700",
};

export default function ReceiptMode() {
  const navigate = useNavigate();
  const { user, setUser, firebaseUser } = useStore();
  const fileInputRef = useRef(null);

  const [image, setImage]       = useState(null);   // File object
  const [preview, setPreview]   = useState(null);   // data URL
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState(null);
  const [dragging, setDragging] = useState(false);

  // ── file helpers ──────────────────────────────
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

  function onFileChange(e) { handleFile(e.target.files[0]); }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  // ── submit to backend ─────────────────────────
  async function analyseReceipt() {
    if (!image) return;
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", image);

      const res = await fetch(`${API}/api/receipt/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${await firebaseUser.getIdToken()}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Analysis failed");

      setResult(data);

      // Update points in global store
      if (data.new_total_points !== undefined) {
        setUser({ ...user, points: data.new_total_points, tier: data.tier });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── reset ─────────────────────────────────────
  function reset() {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError("");
  }

  // ── render ────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("/home")}
          className="text-gray-400 hover:text-white text-2xl leading-none">←</button>
        <div>
          <h1 className="text-2xl font-bold">Receipt Mode</h1>
          <p className="text-gray-400 text-sm">Upload your grocery receipt for carbon analysis</p>
        </div>
      </div>

      {/* Upload area — hide once result is shown */}
      {!result && (
        <>
          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
              ${dragging ? "border-green-400 bg-green-900/20" : "border-gray-600 hover:border-gray-400"}`}
          >
            {preview ? (
              <img src={preview} alt="Receipt preview"
                className="max-h-64 mx-auto rounded-xl object-contain" />
            ) : (
              <div className="space-y-3">
                <div className="text-5xl">🧾</div>
                <p className="text-gray-300 font-medium">Click or drag your receipt here</p>
                <p className="text-gray-500 text-sm">JPG, PNG supported · Max 10MB</p>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*"
            className="hidden" onChange={onFileChange} />

          {/* Preview filename */}
          {image && (
            <p className="text-gray-400 text-sm mt-3 text-center">
              📎 {image.name}
              <button onClick={reset} className="ml-3 text-red-400 hover:text-red-300">✕ Remove</button>
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-900/40 border border-red-500 rounded-xl p-4 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Analyse button */}
          <button
            onClick={analyseReceipt}
            disabled={!image || loading}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all
              ${image && !loading
                ? "bg-green-500 hover:bg-green-400 text-black"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Analysing with AI...
              </span>
            ) : "🔍 Analyse Receipt"}
          </button>
        </>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5">

          {/* Eco score card */}
          <div className={`border rounded-2xl p-6 text-center ${gradeBackground[result.eco_score] || "bg-gray-800 border-gray-600"}`}>
            <p className="text-gray-400 text-sm mb-1">Your Eco Score</p>
            <p className={`text-7xl font-black ${gradeColor[result.eco_score]}`}>
              {result.eco_score}
            </p>
            <p className="text-gray-300 mt-2 text-sm">
              {result.total_carbon_kg} kg CO₂ · {result.item_count} items
            </p>
          </div>

          {/* Points earned */}
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-400 font-bold text-lg">+{result.points_earned} points earned!</p>
              <p className="text-gray-400 text-sm">Total: {result.new_total_points} pts · {result.tier}</p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>

          {/* Items list */}
          <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
            <h2 className="font-bold text-gray-300 mb-2">Items Analysed</h2>
            {result.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-gray-800 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-white capitalize">{item.item_name}</p>
                  {item.alternative && item.category !== "Low" && (
                    <p className="text-xs text-green-400 mt-0.5">💡 {item.alternative}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${
                    item.carbon_kg > 3 ? "text-red-400" :
                    item.carbon_kg > 1.5 ? "text-orange-400" : "text-green-400"
                  }`}>{item.carbon_kg} kg</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={reset}
              className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 transition-all">
              📷 Scan Another
            </button>
            <button onClick={() => navigate("/home")}
              className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold transition-all">
              🏠 Home
            </button>
          </div>

        </div>
      )}
    </div>
  );
}