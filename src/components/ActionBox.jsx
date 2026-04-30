import React from "react";

function getDominantIssue(stats) {
  if (!stats) return null;
  const { waterWaste = 0, electricityIssues = 0, wasteProblems = 0 } = stats;
  const max = Math.max(waterWaste, electricityIssues, wasteProblems);
  if (max === 0) return null;
  if (waterWaste === max) return "water";
  if (electricityIssues === max) return "electricity";
  return "waste";
}

const CONFIGS = {
  emergency: {
    icon: "🚨",
    badge: "#dc2626",
    badgeTxt: "white",
    bg: "#fff1f2",
    border: "#fecdd3",
    titleColor: "#991b1b",
    heading: "Emergency response needed",
    subtitle: "Critical severity detected — act now",
    actions: [
      "Report every issue immediately — even minor ones.",
      "Alert your lane representative or local authority.",
      "Document and photograph visible waste or hazards.",
    ],
  },
  water: {
    icon: "💧",
    badge: "#0284c7",
    badgeTxt: "white",
    bg: "#f0f9ff",
    border: "#bae6fd",
    titleColor: "#0c4a6e",
    heading: "Water conservation priority",
    subtitle: "Water is your dominant reported issue",
    actions: [
      "Log any dripping taps or pipe leaks immediately.",
      "Remind neighbors to report standing water.",
      "Check overhead tanks — overflows go unnoticed.",
    ],
  },
  electricity: {
    icon: "⚡",
    badge: "#d97706",
    badgeTxt: "white",
    bg: "#fffbeb",
    border: "#fde68a",
    titleColor: "#78350f",
    heading: "Electricity waste in focus",
    subtitle: "Most reports relate to electrical issues",
    actions: [
      "Report street lights or fans left on in empty areas.",
      "Encourage one neighbor to switch off idle appliances.",
      "Check common areas — corridors, stairwells, halls.",
    ],
  },
  waste: {
    icon: "♻️",
    badge: "#16a34a",
    badgeTxt: "white",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    titleColor: "#14532d",
    heading: "Waste management drive",
    subtitle: "Waste problems are leading today",
    actions: [
      "Report uncollected garbage with photo if possible.",
      "Locate the nearest complaint number and share it.",
      "Organize a quick 15-min lane cleanup — log results.",
    ],
  },
  improving: {
    icon: "📈",
    badge: "#7c3aed",
    badgeTxt: "white",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    titleColor: "#4c1d95",
    heading: "Momentum is building!",
    subtitle: "Score is trending up — keep going",
    actions: [
      "Keep reporting — even small wins count.",
      "Encourage one neighbor to log a report today.",
      "Pick one green habit to maintain this week.",
    ],
  },
  default: {
    icon: "📢",
    badge: "#16a34a",
    badgeTxt: "white",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    titleColor: "#14532d",
    heading: "Maintain the green streak",
    subtitle: "Community health looks stable",
    actions: [
      "Keep reporting — even small wins count.",
      "Encourage one neighbor to log a report.",
      "Pick one habit to keep this week.",
    ],
  },
};

function resolveConfig(severity, stats, score) {
  if (severity === "high") return CONFIGS.emergency;
  const dominant = getDominantIssue(stats);
  if (dominant === "water") return CONFIGS.water;
  if (dominant === "electricity") return CONFIGS.electricity;
  if (dominant === "waste") return CONFIGS.waste;
  if (score >= 65) return CONFIGS.improving;
  return CONFIGS.default;
}

export default function ActionBox({ severity, stats, score }) {
  const cfg = resolveConfig(severity, stats, score);

  return (
    <div style={{
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 14,
      padding: "16px 20px",
      transition: "all 0.5s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          background: cfg.badge, borderRadius: 8,
          width: 34, height: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.05rem",
          boxShadow: `0 4px 10px ${cfg.badge}44`,
        }}>
          {cfg.icon}
        </div>
        <div>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: cfg.badge, letterSpacing: 1.5, textTransform: "uppercase" }}>
            What to do now
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.97rem", color: cfg.titleColor }}>{cfg.heading}</div>
        </div>
        <span style={{
          marginLeft: "auto", fontSize: "0.65rem", fontWeight: 700,
          background: cfg.badge, color: cfg.badgeTxt,
          padding: "2px 8px", borderRadius: 20, letterSpacing: 0.8,
          textTransform: "uppercase",
        }}>
          {cfg.subtitle.split(" ")[0]}
        </span>
      </div>

      <div style={{ fontSize: "0.75rem", color: cfg.badge, opacity: 0.8, marginBottom: 10, fontStyle: "italic" }}>
        {cfg.subtitle}
      </div>

      {cfg.actions.map((action, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8,
          animation: `ecoDeltaSlide 0.35s ${0.05 + i * 0.08}s both ease`,
        }}>
          <span style={{
            background: cfg.badge, color: "white",
            borderRadius: "50%", width: 22, height: 22,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.72rem", fontWeight: 800, flexShrink: 0, marginTop: 1,
          }}>
            {i + 1}
          </span>
          <span style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.45 }}>{action}</span>
        </div>
      ))}
    </div>
  );
}
