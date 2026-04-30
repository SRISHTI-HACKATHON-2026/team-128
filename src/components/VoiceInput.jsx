import React, { useState, useRef, useEffect } from "react";

const BASE = "http://localhost:3000";

const ivrButtons = [
  { key: "1", emoji: "💧", label: "Water issue",  text: "water leak" },
  { key: "2", emoji: "⚡", label: "Electricity",  text: "light left on" },
  { key: "3", emoji: "♻️", label: "Waste",        text: "garbage not collected" },
];

const KEYWORD_MAP = [
  { pattern: /tap|leak|water|pipe|drain|drip|flood/i, category: "water",       icon: "💧", label: "Water issue" },
  { pattern: /light|fan|electric|power|bulb|switch|current|socket/i, category: "electricity", icon: "⚡", label: "Electricity issue" },
  { pattern: /garbage|waste|trash|litter|dump|bin|rubbish/i, category: "waste", icon: "♻️", label: "Waste problem" },
];

function interpret(text) {
  for (const { pattern, category, icon, label } of KEYWORD_MAP) {
    if (pattern.test(text)) return { category, icon, label };
  }
  return { category: "general", icon: "📝", label: "General report" };
}

function savePendingOffline(input) {
  try {
    const pending = JSON.parse(localStorage.getItem("eco_pending") || "[]");
    pending.push({ input, timestamp: Date.now() });
    localStorage.setItem("eco_pending", JSON.stringify(pending));
  } catch {}
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceInput({ onSubmit, onReport, prefillText, onPrefillConsumed }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [listening, setListening] = useState(false);
  const [interpretation, setInterpretation] = useState(null);
  const recognitionRef = useRef(null);
  const feedbackTimer = useRef(null);

  // Handle prefill from parent (quick buttons)
  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      setInterpretation(interpret(prefillText));
      if (onPrefillConsumed) onPrefillConsumed();
    }
  }, [prefillText]);

  function showFeedback(fb) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(fb);
    feedbackTimer.current = setTimeout(() => {
      setFeedback(null);
      setInterpretation(null);
    }, 4500);
  }

  function startListening() {
    if (!SpeechRecognition) {
      showFeedback({ ok: false, msg: "Speech recognition not supported in this browser." });
      return;
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      const interp = interpret(transcript);
      setInterpretation(interp);
    };
    recog.onerror = () => {
      setListening(false);
      showFeedback({ ok: false, msg: "Mic error — check browser permissions." });
    };
    recog.onend = () => setListening(false);
    recog.start();
    setListening(true);
    recognitionRef.current = recog;
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }

  async function send(input) {
    if (!input.trim()) return;
    setLoading(true);
    setFeedback(null);
    const interp = interpret(input);
    setInterpretation(interp);

    try {
      const res = await fetch(`${BASE}/voice-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      const category = data.log?.category || interp.category;
      const type = data.log?.type || "general";

      showFeedback({
        ok: true,
        msg: `Logged as "${category}" (${type})`,
        interp,
      });
      setText("");
      if (onSubmit) onSubmit();
      if (onReport) onReport({ category, type, input, interpreted: interp });
    } catch {
      savePendingOffline(input);
      showFeedback({
        ok: false,
        offline: true,
        msg: "Offline mode: report stored locally — will sync when connected.",
        interp,
      });
    }
    setLoading(false);
  }

  const hasSpeech = !!SpeechRecognition;

  return (
    <div style={{
      background: "white", borderRadius: 14,
      padding: "18px 20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      border: "1.5px solid #f0f0f0",
    }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
        <span style={{ fontSize: "1.1rem" }}>🎙️</span>
        <strong style={{ fontSize: "0.97rem", flex: 1 }}>Send a Report</strong>
        {hasSpeech && (
          <button
            onClick={listening ? stopListening : startListening}
            title={listening ? "Stop listening" : "Speak your report"}
            style={{
              border: "none", borderRadius: 8, padding: "6px 12px",
              fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
              background: listening ? "#fee2e2" : "#f0fdf4",
              color: listening ? "#dc2626" : "#16a34a",
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.2s ease",
              animation: listening ? "ecoPulse 1.2s infinite" : "none",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{listening ? "⏹" : "🎤"}</span>
            {listening ? "Stop" : "Speak"}
          </button>
        )}
      </div>

      {interpretation && text && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 8, padding: "5px 10px", marginBottom: 8,
          animation: "ecoFadeInUp 0.3s ease both",
          fontSize: "0.75rem", color: "#16a34a", fontWeight: 600,
        }}>
          <span>{interpretation.icon}</span>
          <span>Detected: <strong>{interpretation.label}</strong></span>
        </div>
      )}

      <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 10px" }}>
        Describe what you saw — e.g. "tap leaking in lane 2" or "lights left on".
      </p>

      <textarea
        rows={3}
        placeholder="Type your report or tap 🎤 to speak..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value) setInterpretation(interpret(e.target.value));
          else setInterpretation(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); }
        }}
        style={{
          width: "100%", border: "1.5px solid #e5e7eb",
          borderRadius: 10, padding: "10px 12px",
          fontSize: "0.9rem", resize: "none", outline: "none",
          fontFamily: "inherit", boxSizing: "border-box", color: "#1a1a1a",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => e.target.style.borderColor = "#16a34a"}
        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
      />

      <button
        onClick={() => send(text)}
        disabled={loading || !text.trim()}
        style={{
          width: "100%", marginTop: 10,
          background: loading ? "#9ca3af" : "linear-gradient(135deg, #16a34a, #15803d)",
          color: "white", border: "none", borderRadius: 10,
          padding: "11px", fontSize: "0.9rem", fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          boxShadow: loading ? "none" : "0 4px 12px rgba(22,163,74,0.25)",
        }}
        onMouseEnter={(e) => { if (!loading && text.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {loading ? "Sending..." : "✈ Send Report"}
      </button>

      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "0 0 7px", fontWeight: 700, letterSpacing: 1.2 }}>
          QUICK LOG
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {ivrButtons.map(({ key, emoji, label, text: t }) => (
            <button
              key={key}
              onClick={() => send(t)}
              style={{
                flex: 1, border: "1.5px solid #e5e7eb", background: "#fafafa",
                borderRadius: 10, padding: "8px 4px", cursor: "pointer",
                fontSize: "0.8rem", fontWeight: 600, color: "#374151",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "#bbf7d0";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fafafa";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
              <span style={{ fontSize: "0.65rem" }}>{key} · {label}</span>
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div style={{
          marginTop: 10, padding: "9px 12px", borderRadius: 9,
          background: feedback.ok ? "#f0fdf4" : feedback.offline ? "#fff7ed" : "#fff1f2",
          color: feedback.ok ? "#16a34a" : feedback.offline ? "#c2410c" : "#dc2626",
          fontSize: "0.82rem", fontWeight: 600,
          animation: "ecoFadeInUp 0.3s ease both",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>{feedback.ok ? "✓" : feedback.offline ? "📡" : "✗"}</span>
          <span>{feedback.msg}</span>
        </div>
      )}
    </div>
  );
}
