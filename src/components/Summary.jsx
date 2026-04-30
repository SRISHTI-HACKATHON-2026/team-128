import React, { useState } from "react";

function StatCard({ emoji, label, value, color }) {
  const [hovered, setHovered] = useState(false);
  const isHigh = value > 5;

  return (
    <div
      className="eco-card-hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? (isHigh ? "#fff1f2" : "#f0fdf4") : "white",
        borderRadius: 12, padding: "16px 12px", textAlign: "center",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        border: `1.5px solid ${isHigh ? "#fecdd3" : "#f0f0f0"}`,
        cursor: "default",
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{emoji}</div>
      <div style={{
        fontSize: "2rem", fontWeight: 900,
        color: isHigh ? "#dc2626" : color,
        lineHeight: 1,
        transition: "color 0.3s ease",
      }}>
        {value}
      </div>
      {isHigh && (
        <div style={{
          fontSize: "0.6rem", fontWeight: 700,
          background: "#fee2e2", color: "#dc2626",
          padding: "1px 6px", borderRadius: 20,
          marginTop: 4, display: "inline-block",
          letterSpacing: 0.8,
        }}>
          ▲ HIGH
        </div>
      )}
      <div style={{
        fontSize: "0.72rem", color: "#6b7280", marginTop: isHigh ? 2 : 6,
      }}>
        {label}
      </div>
    </div>
  );
}

export default function Summary({ stats }) {
  const waterWaste = stats?.waterWaste ?? 0;
  const electricityIssues = stats?.electricityIssues ?? 0;
  const wasteProblems = stats?.wasteProblems ?? 0;
  const total = waterWaste + electricityIssues + wasteProblems;

  const items = [
    { emoji: "💧", label: "Water issues",      value: waterWaste,       color: "#0ea5e9" },
    { emoji: "⚡", label: "Electricity issues", value: electricityIssues, color: "#f59e0b" },
    { emoji: "♻️", label: "Waste problems",     value: wasteProblems,    color: "#16a34a" },
  ];

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <strong style={{ fontSize: "0.95rem", color: "#374151" }}>Today's Impact Summary</strong>
        <span style={{
          fontSize: "0.75rem", color: total > 10 ? "#dc2626" : "#9ca3af",
          fontWeight: total > 10 ? 700 : 400,
        }}>
          {total} total {total > 10 ? "⚠" : ""}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {items.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* Mini progress bars */}
      {total > 0 && (
        <div style={{ marginTop: 14, background: "white", borderRadius: 10, padding: "10px 14px", border: "1.5px solid #f0f0f0" }}>
          <div style={{ fontSize: "0.68rem", color: "#9ca3af", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
            DISTRIBUTION
          </div>
          {items.map(({ emoji, label, value, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: "0.85rem", width: 20 }}>{emoji}</span>
              <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  width: `${total > 0 ? (value / total) * 100 : 0}%`,
                  height: "100%", background: color, borderRadius: 99,
                  transition: "width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }} />
              </div>
              <span style={{ fontSize: "0.72rem", color: "#6b7280", width: 24, textAlign: "right", fontWeight: 600 }}>
                {total > 0 ? Math.round((value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
