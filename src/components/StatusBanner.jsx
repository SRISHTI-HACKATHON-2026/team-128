import React from "react";

const TIERS = [
  {
    test: (s) => s >= 70,
    dot: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    color: "#14532d",
    icon: "🟢",
    title: "Community is healthy",
    sub: "Keep up the green momentum — every report counts.",
  },
  {
    test: (s) => s >= 40,
    dot: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    color: "#92400e",
    icon: "🟡",
    title: "Needs attention",
    sub: "Some issues detected. Community action can turn this around.",
  },
  {
    test: () => true,
    dot: "#dc2626",
    bg: "#fff1f2",
    border: "#fecdd3",
    color: "#991b1b",
    icon: "🔴",
    title: "Critical condition",
    sub: "Urgent: multiple issues reported. Report and act now.",
  },
];

export default function StatusBanner({ score, totalLogs, error }) {
  // Offline / error state
  if (error) {
    return (
      <div style={wrap("#fff0f0", "#dc2626", "#fecdd3")}>
        <PulseDot color="#dc2626" />
        <div>
          <strong style={{ fontSize: "0.92rem" }}>⚠ Offline mode: reports stored locally</strong>
          <div style={{ fontSize: "0.78rem", marginTop: 2, opacity: 0.8 }}>Cannot reach the EcoReport API — retrying in 5s.</div>
        </div>
      </div>
    );
  }

  // Awaiting first data
  if (totalLogs === 0) {
    return (
      <div style={wrap("#f8fafc", "#64748b", "#e2e8f0")}>
        <PulseDot color="#94a3b8" pulse={false} />
        <div>
          <strong style={{ fontSize: "0.92rem" }}>— Awaiting community signals</strong>
          <div style={{ fontSize: "0.78rem", marginTop: 2, opacity: 0.75 }}>Waiting for the first reports to arrive.</div>
        </div>
      </div>
    );
  }

  const tier = TIERS.find((t) => t.test(score));

  return (
    <div style={wrap(tier.bg, tier.color, tier.border)}>
      <PulseDot color={tier.dot} pulse={score < 40} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong style={{ fontSize: "0.92rem" }}>
            {tier.icon} {tier.title}
          </strong>
          <span style={{
            background: tier.dot + "22", color: tier.dot,
            fontSize: "0.68rem", fontWeight: 800,
            padding: "2px 8px", borderRadius: 20,
            letterSpacing: 1, textTransform: "uppercase",
          }}>
            Score {score}
          </span>
        </div>
        <div style={{ fontSize: "0.78rem", marginTop: 2, opacity: 0.82 }}>{tier.sub}</div>
      </div>
    </div>
  );
}

function PulseDot({ color, pulse = true }) {
  return (
    <span style={{
      width: 11, height: 11,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
      display: "inline-block",
      boxShadow: `0 0 0 0 ${color}`,
      animation: pulse ? "ecoChainDot 1.6s infinite" : "none",
    }} />
  );
}

function wrap(bg, color, border) {
  return {
    background: bg,
    border: `1.5px solid ${border}`,
    borderRadius: 12,
    padding: "12px 18px",
    color,
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: "0.92rem",
    fontWeight: 500,
    marginBottom: 16,
    transition: "all 0.4s ease",
  };
}
