import React from "react";

const LANE_NAMES = [
  "Lane A", "Lane B", "Lane C", "Lane D", "Lane E",
  "Lane F", "Lane G", "Lane H", "Lane I", "Lane J",
];

function toLaneName(laneId) {
  // Try to extract a number from the key and map to a nice name
  const num = parseInt(String(laneId).replace(/\D/g, ""), 10);
  if (!isNaN(num) && num >= 1 && num <= LANE_NAMES.length) {
    return LANE_NAMES[num - 1];
  }
  // Try alpha keys: lane_a, laneA, etc.
  const alpha = String(laneId).replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
  if (alpha && alpha >= "A" && alpha <= "J") {
    return `Lane ${alpha}`;
  }
  return laneId; // fallback
}

export default function Leaderboard({ data }) {
  const entries = Object.entries(data || {})
    .map(([id, score]) => ({ id, name: toLaneName(id), score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{
      background: "white", borderRadius: 14,
      padding: "18px 20px", marginBottom: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1.5px solid #f0f0f0",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <strong style={{ fontSize: "0.97rem", color: "#1a1a1a" }}>Top Responsible Lanes</strong>
          <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 1 }}>
            Ranked by eco-score · highest first
          </div>
        </div>
        <span style={{ fontSize: "1.4rem" }}>🏆</span>
      </div>

      {entries.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.85rem", margin: "18px 0" }}>
          No lane data yet.
        </p>
      ) : (
        entries.map(({ id, name, score }, i) => {
          const isTop  = i === 0;
          const isLast = i === entries.length - 1 && entries.length > 1;
          const barColor = score >= 70 ? "#16a34a" : score >= 40 ? "#f59e0b" : "#ef4444";
          const medal = i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

          return (
            <div key={id} style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 7, padding: "9px 10px",
              borderRadius: 10,
              background: isTop ? "#f0fdf4" : isLast ? "#fff1f2" : "#fafafa",
              border: `1.5px solid ${isTop ? "#bbf7d0" : isLast ? "#fecdd3" : "transparent"}`,
              transition: "all 0.2s ease",
              animation: `ecoDeltaSlide 0.35s ${0.04 * i}s both ease`,
            }}>
              <span style={{ width: 26, textAlign: "center", fontSize: "1rem", flexShrink: 0 }}>
                {medal || (isLast ? "⚠️" : <span style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 700 }}>#{i + 1}</span>)}
              </span>

              <span style={{ flex: 1, fontWeight: 700, fontSize: "0.88rem", color: isTop ? "#14532d" : isLast ? "#991b1b" : "#374151" }}>
                {name}
              </span>

              <div style={{ width: 72, background: "#e5e7eb", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{
                  width: `${score}%`, background: barColor, height: "100%",
                  borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }} />
              </div>

              <span style={{
                fontWeight: 800, fontSize: "0.9rem", color: barColor,
                width: 34, textAlign: "right",
              }}>
                {score}
              </span>
            </div>
          );
        })
      )}

      {entries.length > 1 && (
        <div style={{ marginTop: 10, padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#9ca3af" }}>
            <span>🏆 <strong style={{ color: "#16a34a" }}>{entries[0]?.name}</strong> leads</span>
            <span>⚠️ <strong style={{ color: "#dc2626" }}>{entries[entries.length - 1]?.name}</strong> needs help</span>
          </div>
        </div>
      )}
    </div>
  );
}
