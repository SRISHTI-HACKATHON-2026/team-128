import React, { useState, useRef } from "react";
import VoiceInput from "./components/VoiceInput";

const BASE = "http://localhost:3000";

const ISSUE_BUTTONS = [
  { emoji: "💧", label: "Water Issue",   text: "water leak reported",   color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd", impact: "liters saved" },
  { emoji: "⚡", label: "Electricity",   text: "light left on",         color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", impact: "kWh saved" },
  { emoji: "♻️", label: "Waste Problem", text: "garbage not collected", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", impact: "kg waste cleared" },
];

const IMPACT_MAP = {
  water:       { unit: "L water saved",    multiplier: 200, icon: "💧", color: "#0ea5e9", credit: "Water Credits",  badge: "💧 Hydro Guardian"   },
  electricity: { unit: "kWh saved",        multiplier: 5,   icon: "⚡", color: "#f59e0b", credit: "Energy Credits", badge: "⚡ Power Saver"      },
  waste:       { unit: "kg waste cleared", multiplier: 12,  icon: "♻️", color: "#16a34a", credit: "Green Credits",  badge: "♻️ Eco Warrior"     },
  general:     { unit: "impact points",    multiplier: 10,  icon: "📝", color: "#7c3aed", credit: "Civic Credits",  badge: "📝 Community Voice" },
};

function getMilestone(count) {
  if (count >= 20) return { label: "Legend",      color: "#7c3aed", icon: "👑" };
  if (count >= 10) return { label: "Champion",    color: "#dc2626", icon: "🏆" };
  if (count >= 5)  return { label: "Contributor", color: "#d97706", icon: "⭐" };
  if (count >= 1)  return { label: "Reporter",    color: "#16a34a", icon: "🌱" };
  return null;
}

function CauseEffectBanner({ data, onDismiss }) {
  if (!data) return null;
  const meta = IMPACT_MAP[data.category] || IMPACT_MAP.general;
  return (
    <div style={{
      background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
      border: "2px solid #86efac", borderRadius: 16,
      padding: "14px 18px", marginBottom: 20,
      animation: "ecoFadeInDown 0.4s cubic-bezier(0.22,1,0.36,1) both",
      boxShadow: "0 8px 24px rgba(22,163,74,0.15)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: "1rem" }}>🌿</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#16a34a", letterSpacing: 1.5, textTransform: "uppercase" }}>Impact Trail</span>
        <button onClick={onDismiss} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "1.1rem", lineHeight: 1, padding: "0 4px" }}>×</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        {[
          { label: `"${data.input?.slice(0,28)}${(data.input?.length ?? 0) > 28 ? '…' : ''}"`, bg: "#f3f4f6", color: "#374151" },
          { label: `${meta.icon} ${data.category} detected`, bg: meta.color + "18", color: meta.color },
          { label: `Score updated`, bg: "#f5f3ff", color: "#7c3aed" },
          { label: `✓ ${meta.credit} earned!`, bg: "#dcfce7", color: "#16a34a" },
        ].map((step, i) => (
          <React.Fragment key={i}>
            <span style={{
              background: step.bg, color: step.color,
              padding: "4px 10px", borderRadius: 20,
              fontSize: "0.78rem", fontWeight: 700,
              animation: `ecoDeltaSlide 0.4s ${0.08 + i * 0.1}s both ease`,
            }}>{step.label}</span>
            {i < 3 && <span style={{ color: "#d1d5db", fontWeight: 700 }}>→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function RewardSection({ reports }) {
  const total = reports.length;
  const milestone = getMilestone(total);
  const nextMilestoneAt = total < 1 ? 1 : total < 5 ? 5 : total < 10 ? 10 : 20;
  const nextMilestoneLabel = total < 1 ? "Reporter" : total < 5 ? "Contributor" : total < 10 ? "Champion" : "Legend";
  const progress = total < 1 ? 0 : total >= 20 ? 100 : (total / nextMilestoneAt) * 100;

  const totalWater = reports.filter(r => r.category === "water").length;
  const totalElec  = reports.filter(r => r.category === "electricity").length;
  const totalWaste = reports.filter(r => r.category === "waste").length;

  const impacts = [
    { ...IMPACT_MAP.water,       count: totalWater },
    { ...IMPACT_MAP.electricity, count: totalElec },
    { ...IMPACT_MAP.waste,       count: totalWaste },
  ].filter(i => i.count > 0);

  const glowing = total > 0 && total % 5 === 0;

  return (
    <div style={{
      background: "linear-gradient(135deg, #fefce8, #f0fdf4)",
      border: "2px solid #d9f99d",
      borderRadius: 18, padding: "20px",
      boxShadow: glowing
        ? "0 0 28px 6px rgba(22,163,74,0.22), 0 4px 16px rgba(0,0,0,0.06)"
        : "0 4px 16px rgba(0,0,0,0.06)",
      transition: "box-shadow 0.6s ease",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          borderRadius: 12, width: 40, height: 40, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
          boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
        }}>🎁</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "#14532d" }}>Your Impact & Rewards</div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>Every report earns community impact.</div>
        </div>
      </div>

      {total === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0", color: "#9ca3af", fontSize: "0.88rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>🌱</div>
          Submit your first report to start earning impact!
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "white", borderRadius: 12, padding: "12px 14px", border: "1.5px solid #bbf7d0", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#16a34a", lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }}>Reports filed</div>
            </div>
            {milestone && (
              <div style={{ background: "white", borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${milestone.color}33`, textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", lineHeight: 1 }}>{milestone.icon}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: milestone.color, marginTop: 2 }}>{milestone.label}</div>
              </div>
            )}
          </div>

          {impacts.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {impacts.map(({ icon, color, count, multiplier, unit, credit, badge }) => (
                <div key={unit} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: color + "10", border: `1.5px solid ${color}33`,
                  borderRadius: 10, padding: "8px 12px", marginBottom: 7,
                }}>
                  <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1a1a" }}>
                      {count} report{count !== 1 ? "s" : ""} → <span style={{ color }}>{count * multiplier} {unit}</span>
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>Earned: <strong>{badge}</strong></div>
                  </div>
                  <span style={{ background: color, color: "white", fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {credit}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 5 }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>
                Next: <strong style={{ color: "#16a34a" }}>{nextMilestoneLabel}</strong>
                {" · Faster resolution → faster rewards"}
              </span>
              <span style={{ color: "#16a34a", fontWeight: 700 }}>{total} / {nextMilestoneAt}</span>
            </div>
            <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(progress, 100)}%`, height: "100%",
                background: "linear-gradient(90deg, #16a34a, #86efac)",
                borderRadius: 99,
                transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: glowing ? "0 0 8px rgba(22,163,74,0.6)" : "none",
              }} />
            </div>
            <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginTop: 4, textAlign: "center" }}>
              {total >= 20
                ? "🏆 Maximum rank achieved!"
                : `${nextMilestoneAt - total} more report${nextMilestoneAt - total !== 1 ? "s" : ""} to reach ${nextMilestoneLabel}`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportPage({ onReport }) {
  const [quickText, setQuickText] = useState("");
  const [userReports, setUserReports] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("eco_user_reports") || "[]"); } catch { return []; }
  });
  const [causeEffect, setCauseEffect] = useState(null);
  const [activeQuick, setActiveQuick] = useState(null);
  const [callStatus, setCallStatus] = useState(null); // null | "connecting" | "connected"
  const causeTimer = useRef(null);
  const callTimer = useRef(null);

  function saveReport(data) {
    const updated = [...userReports, data];
    setUserReports(updated);
    try { sessionStorage.setItem("eco_user_reports", JSON.stringify(updated)); } catch {}
  }

  function handleReport(data) {
    saveReport(data);
    if (causeTimer.current) clearTimeout(causeTimer.current);
    setCauseEffect(data);
    causeTimer.current = setTimeout(() => setCauseEffect(null), 5000);
    if (onReport) onReport(data);
  }

  function handleQuickClick(btn) {
    setQuickText(btn.text);
    setActiveQuick(btn.label);
  }

  async function handleCallClick() {
    setCallStatus("connecting");
    // Log call initiation to backend
    try {
      await fetch(`${BASE}/voice-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: "call initiated via helpline 1800-ECO-HELP" }),
      });
      if (onReport) onReport({ category: "general", type: "issue", input: "call initiated" });
    } catch { /* offline — proceed anyway */ }
    if (callTimer.current) clearTimeout(callTimer.current);
    callTimer.current = setTimeout(() => setCallStatus("connected"), 1200);
    setTimeout(() => setCallStatus(null), 5000);
  }

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 16px 48px" }}>

      {/* ── Header ── */}
      <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
        <div style={{
          width: 60, height: 60,
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", margin: "0 auto 14px",
          boxShadow: "0 8px 24px rgba(22,163,74,0.3)",
        }}>📢</div>
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: "1.7rem", color: "#14532d", letterSpacing: -0.5 }}>Report an Issue</h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>No internet needed — just call or speak</p>
      </div>

      {/* ── Cause Effect Banner ── */}
      {causeEffect && <CauseEffectBanner data={causeEffect} onDismiss={() => setCauseEffect(null)} />}

      {/* ── Call Section ── */}
      <div style={{
        background: "linear-gradient(135deg, #14532d, #16a34a)",
        borderRadius: 18, padding: "22px 20px", marginBottom: 20,
        boxShadow: "0 8px 24px rgba(22,163,74,0.25)", color: "white", textAlign: "center",
      }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 2, opacity: 0.75, marginBottom: 8, textTransform: "uppercase" }}>
          📞 Toll-Free Helpline
        </div>
        <div style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>1800-ECO-HELP</div>
        <div style={{ fontSize: "0.78rem", opacity: 0.8, marginBottom: 16 }}>
          Works on any phone · No internet required · Free call
        </div>

        <a
          href="tel:+911800326435"
          onClick={handleCallClick}
          className="eco-call-btn"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: callStatus === "connecting" ? "rgba(255,255,255,0.85)" : "white",
            color: "#16a34a",
            borderRadius: 12, padding: "13px 32px", fontWeight: 800,
            fontSize: "0.95rem", textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.2s ease",
            animation: callStatus === "connecting" ? "ecoPulse 1s infinite" : "none",
            minWidth: 180, justifyContent: "center",
          }}
          onMouseEnter={e => { if (!callStatus) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <span style={{ fontSize: "1.1rem" }}>
            {callStatus === "connecting" ? "📡" : callStatus === "connected" ? "✅" : "📞"}
          </span>
          {callStatus === "connecting"
            ? "Connecting call..."
            : callStatus === "connected"
            ? "Call initiated!"
            : "Call Now"}
        </a>

        {callStatus === "connected" && (
          <div style={{
            marginTop: 12, fontSize: "0.75rem", opacity: 0.9,
            animation: "ecoFadeInUp 0.3s ease both",
          }}>
            ✓ Report logged · Your call is being connected
          </div>
        )}
      </div>

      {/* ── Quick Issue Buttons ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          Quick Report
        </div>
        <div className="eco-report-grid-3">
          {ISSUE_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              onClick={() => handleQuickClick(btn)}
              style={{
                border: `2px solid ${activeQuick === btn.label ? btn.color : btn.border}`,
                background: activeQuick === btn.label ? btn.bg : "white",
                borderRadius: 14, padding: "14px 8px", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                transition: "all 0.15s ease",
                transform: activeQuick === btn.label ? "translateY(-2px)" : "translateY(0)",
                boxShadow: activeQuick === btn.label ? `0 6px 18px ${btn.color}33` : "0 2px 8px rgba(0,0,0,0.04)",
                width: "100%",
              }}
              onMouseEnter={e => {
                if (activeQuick !== btn.label) {
                  e.currentTarget.style.background = btn.bg;
                  e.currentTarget.style.borderColor = btn.color;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                if (activeQuick !== btn.label) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = btn.border;
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{btn.emoji}</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: btn.color }}>{btn.label}</span>
              <span style={{ fontSize: "0.62rem", color: "#9ca3af" }}>tap to select</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Voice / Text Input ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#6b7280", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          🎙️ Speak or Type Your Report
        </div>
        <VoiceInput
          onSubmit={() => {}}
          onReport={handleReport}
          prefillText={quickText}
          onPrefillConsumed={() => { setQuickText(""); setActiveQuick(null); }}
        />
      </div>

      {/* ── Reward Section ── */}
      <RewardSection reports={userReports} />

      {/* ── Why it matters ── */}
      <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          🌍 Why Your Report Matters
        </div>
        {[
          { icon: "💧", text: "Early leak detection prevents hundreds of liters of daily waste" },
          { icon: "⚡", text: "Reporting idle electricity saves community energy costs by up to 30%" },
          { icon: "♻️", text: "Waste reports trigger faster municipal action and prevent health hazards" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 2 ? 10 : 0, alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
