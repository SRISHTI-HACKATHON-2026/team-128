import React from "react";

const SEVERITY = {
  low: {
    bg: "#f0fdf4", border: "#bbf7d0",
    glow: "0 0 0 0 transparent",
    glowActive: "0 0 16px 3px rgba(22,163,74,0.18)",
    icon: "✅", badgeBg: "#16a34a", badgeTxt: "white",
    barColor: "#16a34a", label: "LOW",
  },
  medium: {
    bg: "#fffbeb", border: "#fde68a",
    glow: "0 0 0 0 transparent",
    glowActive: "0 0 16px 3px rgba(217,119,6,0.18)",
    icon: "⚠️", badgeBg: "#d97706", badgeTxt: "white",
    barColor: "#f59e0b", label: "MEDIUM",
  },
  high: {
    bg: "#fff1f2", border: "#fecdd3",
    glow: "0 0 0 0 transparent",
    glowActive: "0 0 18px 5px rgba(220,38,38,0.18)",
    icon: "🚨", badgeBg: "#dc2626", badgeTxt: "white",
    barColor: "#ef4444", label: "HIGH",
  },
  info: {
    bg: "#eff6ff", border: "#bfdbfe",
    glow: "0 0 0 0 transparent",
    glowActive: "0 0 14px 3px rgba(37,99,235,0.15)",
    icon: "ℹ️", badgeBg: "#2563eb", badgeTxt: "white",
    barColor: "#3b82f6", label: "INFO",
  },
};

export default function InsightCard({ insight, severity }) {
  const s = SEVERITY[severity] || SEVERITY.low;
  const severityScore = { low: 25, info: 40, medium: 70, high: 100 }[severity] || 25;

  return (
    <div style={{
      background: s.bg,
      border: `1.5px solid ${s.border}`,
      borderRadius: 14,
      padding: "16px 20px",
      marginBottom: 16,
      boxShadow: s.glowActive,
      transition: "box-shadow 0.4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: "1.25rem" }}>{s.icon}</span>
        <span style={{
          fontSize: "0.68rem", fontWeight: 800,
          background: s.badgeBg, color: s.badgeTxt,
          padding: "3px 10px", borderRadius: 20, letterSpacing: 1.2,
        }}>
          {s.label} · Live Insight
        </span>

        {/* Severity bar */}
        <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 99, overflow: "hidden", marginLeft: 4 }}>
          <div style={{
            width: `${severityScore}%`, height: "100%",
            background: s.barColor, borderRadius: 99,
            transition: "width 0.6s ease",
          }} />
        </div>
        <span style={{ fontSize: "0.68rem", color: s.badgeBg, fontWeight: 700, whiteSpace: "nowrap" }}>
          {s.label}
        </span>
      </div>

      <p style={{
        margin: 0, fontWeight: 600, fontSize: "0.97rem", color: "#1a1a1a", lineHeight: 1.5,
      }}>
        {insight}
      </p>
    </div>
  );
}
