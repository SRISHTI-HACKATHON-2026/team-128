import React, { useEffect, useRef, useState } from "react";

function getLabel(score) {
  if (score >= 80) return { label: "EXCELLENT", color: "#bbf7d0", textColor: "#14532d" };
  if (score >= 60) return { label: "GOOD",      color: "#d1fae5", textColor: "#166534" };
  if (score >= 40) return { label: "FAIR",      color: "#fef9c3", textColor: "#713f12" };
  if (score >= 20) return { label: "POOR",      color: "#fed7aa", textColor: "#9a3412" };
  return             { label: "CRITICAL",       color: "#fecaca", textColor: "#991b1b" };
}

export default function ScoreCard({ score, totalLogs, scoreDelta }) {
  const { label, color, textColor } = getLabel(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const [pulsing, setPulsing] = useState(false);
  const prevScore = useRef(score);
  const pulseTimer = useRef(null);

  useEffect(() => {
    if (score !== prevScore.current) {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      setPulsing(true);
      pulseTimer.current = setTimeout(() => setPulsing(false), 750);
      prevScore.current = score;
    }
    return () => { if (pulseTimer.current) clearTimeout(pulseTimer.current); };
  }, [score]);

  const isPositive = scoreDelta > 0;

  return (
    <div style={card}>
      {/* Background blob decoration */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 160, height: 160, borderRadius: "50%",
        background: "rgba(255,255,255,0.07)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -20, left: -20,
        width: 100, height: 100, borderRadius: "50%",
        background: "rgba(255,255,255,0.05)", pointerEvents: "none",
      }} />

      <p style={subtitle}>COMMUNITY IMPACT SCORE</p>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
        {/* Ring */}
        <div style={{
          ...ringWrap,
          animation: pulsing ? "ecoPulse 0.7s ease" : "none",
        }}>
          <svg width={140} height={140} style={{ position: "absolute" }}>
            <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={11} />
            <circle
              cx={70} cy={70} r={54}
              fill="none"
              stroke="white"
              strokeWidth={11}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
          </svg>
          <div style={ringInner}>
            <span style={scoreNum}>{score}</span>
            <span style={{ fontSize: "0.68rem", fontWeight: 800, color: textColor, letterSpacing: 1.2, background: color, padding: "1px 7px", borderRadius: 10 }}>
              {label}
            </span>
          </div>
        </div>

        {/* Delta badge */}
        {scoreDelta !== null && scoreDelta !== 0 && (
          <div style={{
            position: "absolute", top: -6, right: "calc(50% - 90px)",
            background: isPositive ? "#dcfce7" : "#fee2e2",
            color: isPositive ? "#16a34a" : "#dc2626",
            border: `2px solid ${isPositive ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: 20, padding: "4px 12px",
            fontSize: "0.88rem", fontWeight: 800,
            animation: "ecoDeltaSlide 0.4s ease both",
            boxShadow: isPositive ? "0 4px 12px rgba(22,163,74,0.2)" : "0 4px 12px rgba(220,38,38,0.2)",
            display: "flex", alignItems: "center", gap: 4,
            zIndex: 2,
          }}>
            {isPositive ? "↑" : "↓"}
            {isPositive ? "+" : ""}{scoreDelta}
          </div>
        )}
      </div>

      <h2 style={headline}>Real-time ecological health of your community</h2>
      <p style={basedon}>Based on {totalLogs} community report{totalLogs !== 1 ? "s" : ""}</p>
    </div>
  );
}

const card = {
  background: "linear-gradient(135deg, #16a34a 0%, #15803d 55%, #166534 100%)",
  borderRadius: 20,
  padding: "36px 24px 28px",
  textAlign: "center",
  color: "white",
  boxShadow: "0 8px 32px rgba(22,163,74,0.28), 0 2px 8px rgba(0,0,0,0.08)",
  marginBottom: 16,
  position: "relative",
  overflow: "hidden",
};
const subtitle = {
  fontSize: "0.68rem", letterSpacing: 3.5, opacity: 0.75,
  margin: "0 0 22px", fontWeight: 700, textTransform: "uppercase",
};
const ringWrap = {
  position: "relative", width: 140, height: 140,
  margin: "0 auto 22px",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const ringInner = {
  position: "relative",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  background: "white", borderRadius: "50%", width: 98, height: 98,
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
};
const scoreNum = {
  fontSize: "2.5rem", fontWeight: 900, color: "#1a1a1a", lineHeight: 1,
  letterSpacing: -1,
};
const headline = {
  fontSize: "1.12rem", fontWeight: 700, margin: "0 0 6px", lineHeight: 1.35,
};
const basedon = { fontSize: "0.8rem", opacity: 0.72, margin: 0 };
