import React, { useState } from "react";
import StatusBanner from "./components/StatusBanner";
import ScoreCard from "./components/ScoreCard";
import InsightCard from "./components/InsightCard";
import Summary from "./components/Summary";
import ActionBox from "./components/ActionBox";
import Leaderboard from "./components/Leaderboard";

const BASE = "http://localhost:3000";

const IMPACT_RATES = {
  waterWaste:        { label: "Water issues",       unit: "L water saved",    rate: 200, icon: "💧", color: "#0ea5e9" },
  electricityIssues: { label: "Electricity issues", unit: "kWh saved",        rate: 5,   icon: "⚡", color: "#f59e0b" },
  wasteProblems:     { label: "Waste problems",     unit: "kg waste cleared", rate: 12,  icon: "♻️", color: "#16a34a" },
};

const REWARD_MILESTONES = [
  { threshold: 5,  reward: "Community awareness alert sent",       icon: "📢", color: "#0ea5e9" },
  { threshold: 10, reward: "Priority maintenance crew dispatched", icon: "🔧", color: "#f59e0b" },
  { threshold: 20, reward: "Extra resource allocation unlocked",   icon: "🎁", color: "#7c3aed" },
  { threshold: 30, reward: "Civic recognition certificate issued", icon: "🏆", color: "#16a34a" },
];

const CAT_META = {
  water:       { icon: "💧", label: "Water",       color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd", impact: "~200L water saved" },
  electricity: { icon: "⚡", label: "Electricity", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", impact: "~5 kWh saved" },
  waste:       { icon: "♻️", label: "Waste",       color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", impact: "~12 kg waste cleared" },
  general:     { icon: "📝", label: "General",     color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", impact: "community impact recorded" },
};

function fmtTime(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function toLaneName(id) {
  const num = parseInt(String(id).replace(/\D/g, ""), 10);
  const names = ["Lane A","Lane B","Lane C","Lane D","Lane E","Lane F","Lane G","Lane H","Lane I","Lane J"];
  if (!isNaN(num) && num >= 1 && num <= names.length) return names[num - 1];
  const alpha = String(id).replace(/[^a-zA-Z]/g, "").toUpperCase().slice(-1);
  if (alpha && alpha >= "A" && alpha <= "J") return `Lane ${alpha}`;
  return id;
}

// ── Active Issues ─────────────────────────────────────────────────────────────
function ActiveIssuesSection({ issues, onRefresh }) {
  const [resolving, setResolving] = useState(null);
  const [feedback, setFeedback] = useState(null); // { id, text, color, impact }

  async function handleResolve(issue) {
    setResolving(issue.id);
    try {
      const res = await fetch(`${BASE}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: issue.id }),
      });
      if (!res.ok) throw new Error("resolve failed");
      const meta = CAT_META[issue.category] || CAT_META.general;
      setFeedback({
        id: issue.id,
        text: `${meta.icon} ${meta.label} issue resolved → ${meta.impact} · Impact improved ✓`,
        color: meta.color,
      });
      setTimeout(() => setFeedback(null), 5000);
      onRefresh();
    } catch { /* silent */ }
    setResolving(null);
  }

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: "1.5px solid #f0f0f0",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      marginBottom: 16, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px 14px",
        borderBottom: "1px solid #f3f4f6",
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1a1a1a", display: "flex", alignItems: "center", gap: 7 }}>
            🔔 Active Issues
            {issues.length > 0 && (
              <span style={{
                background: "#ef4444", color: "white",
                fontSize: "0.6rem", fontWeight: 800,
                padding: "2px 7px", borderRadius: 99,
              }}>{issues.length}</span>
            )}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>
            Open community reports — mark resolved to update the score
          </div>
        </div>
        <div style={{
          background: issues.length > 0 ? "#fff1f2" : "#f0fdf4",
          color: issues.length > 0 ? "#dc2626" : "#16a34a",
          fontSize: "0.68rem", fontWeight: 800,
          padding: "4px 10px", borderRadius: 20,
          border: `1.5px solid ${issues.length > 0 ? "#fecdd3" : "#bbf7d0"}`,
        }}>
          {issues.length === 0 ? "All Clear ✓" : `${issues.length} Open`}
        </div>
      </div>

      {/* Impact feedback toast */}
      {feedback && (
        <div style={{
          margin: "0 16px 0",
          padding: "10px 14px",
          background: feedback.color + "12",
          border: `1.5px solid ${feedback.color}33`,
          borderRadius: 10,
          color: feedback.color,
          fontSize: "0.82rem", fontWeight: 700,
          animation: "ecoFadeInDown 0.35s ease both",
          marginTop: 12,
        }}>
          {feedback.text}
        </div>
      )}

      {/* Issue List */}
      <div style={{ padding: "12px 16px 16px" }}>
        {issues.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: "2rem", marginBottom: 6 }}>✅</div>
            <div style={{ fontSize: "0.88rem" }}>No open issues — community is clean!</div>
          </div>
        ) : (
          issues.map((issue, i) => {
            const meta = CAT_META[issue.category] || CAT_META.general;
            const isResolving = resolving === issue.id;
            return (
              <div
                key={issue.id}
                className="eco-issue-row"
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 12px", borderRadius: 12, marginBottom: 8,
                  background: meta.bg, border: `1.5px solid ${meta.border}`,
                  animation: `ecoCardIn 0.35s ${i * 0.05}s both ease`,
                  opacity: isResolving ? 0.55 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                {/* Category badge */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: meta.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem",
                }}>
                  {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a1a", wordBreak: "break-word", lineHeight: 1.35 }}>
                    {issue.text || "Issue reported"}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 5, alignItems: "center" }}>
                    <span style={{
                      background: meta.color, color: "white",
                      fontSize: "0.6rem", fontWeight: 800,
                      padding: "1px 7px", borderRadius: 20,
                    }}>{meta.label}</span>
                    <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>
                      📍 {toLaneName(issue.lane_id || "lane_1")}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "#9ca3af" }}>
                      🕐 {fmtTime(issue.created_at) || "just now"}
                    </span>
                  </div>
                </div>

                {/* Resolve button */}
                <button
                  onClick={() => handleResolve(issue)}
                  disabled={isResolving}
                  title="Mark as resolved"
                  className="eco-resolve-btn"
                  style={{
                    background: isResolving ? "#e5e7eb" : "#16a34a",
                    color: isResolving ? "#9ca3af" : "white",
                    border: "none", borderRadius: 8,
                    padding: "7px 12px", cursor: isResolving ? "not-allowed" : "pointer",
                    fontSize: "0.75rem", fontWeight: 700,
                    whiteSpace: "nowrap", flexShrink: 0,
                    transition: "all 0.15s ease",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                  onMouseEnter={e => { if (!isResolving) e.currentTarget.style.background = "#15803d"; }}
                  onMouseLeave={e => { if (!isResolving) e.currentTarget.style.background = "#16a34a"; }}
                >
                  {isResolving ? "..." : "✅ Resolve"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Resolved Issues ───────────────────────────────────────────────────────────
function ResolvedIssuesSection({ issues }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? issues : issues.slice(0, 3);

  if (issues.length === 0) return null;

  return (
    <div style={{
      background: "#f0fdf4", borderRadius: 14,
      border: "1.5px solid #bbf7d0",
      padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#14532d", display: "flex", alignItems: "center", gap: 7 }}>
            ✅ Resolved Issues
            <span style={{
              background: "#16a34a", color: "white",
              fontSize: "0.6rem", fontWeight: 800, padding: "2px 7px", borderRadius: 99,
            }}>{issues.length}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 1 }}>
            Fixed by community action
          </div>
        </div>
      </div>

      {shown.map((issue, i) => {
        const meta = CAT_META[issue.category] || CAT_META.general;
        return (
          <div key={issue.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 10, marginBottom: 6,
            background: "white", border: "1.5px solid #dcfce7",
            animation: `ecoCardIn 0.3s ${i * 0.04}s both ease`,
          }}>
            <span style={{ fontSize: "0.95rem", flexShrink: 0 }}>{meta.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", wordBreak: "break-word" }}>
                {issue.text || "Issue resolved"}
              </div>
              <div style={{ fontSize: "0.66rem", color: "#9ca3af", marginTop: 2 }}>
                📍 {toLaneName(issue.lane_id || "lane_1")} · {meta.impact}
              </div>
            </div>
            <span style={{
              background: "#dcfce7", color: "#16a34a",
              fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20, flexShrink: 0,
            }}>Fixed</span>
          </div>
        );
      })}

      {issues.length > 3 && (
        <button
          onClick={() => setExpanded(x => !x)}
          style={{
            width: "100%", marginTop: 4, background: "none", border: "1.5px solid #bbf7d0",
            borderRadius: 8, padding: "7px", cursor: "pointer",
            fontSize: "0.75rem", color: "#16a34a", fontWeight: 700,
            transition: "background 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          {expanded ? "Show less ▲" : `Show ${issues.length - 3} more ▼`}
        </button>
      )}
    </div>
  );
}

// ── Community Reward ──────────────────────────────────────────────────────────
function CommunityRewardSection({ stats, totalLogs }) {
  const water = stats?.waterWaste ?? 0;
  const elec  = stats?.electricityIssues ?? 0;
  const waste = stats?.wasteProblems ?? 0;

  const impacts = Object.entries({ waterWaste: water, electricityIssues: elec, wasteProblems: waste })
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ ...IMPACT_RATES[k], count: v, saved: v * IMPACT_RATES[k].rate }));

  const nextMilestone = REWARD_MILESTONES.find(m => totalLogs < m.threshold) || null;
  const unlockedMilestones = REWARD_MILESTONES.filter(m => totalLogs >= m.threshold);
  const progressPct = nextMilestone
    ? Math.min((totalLogs / nextMilestone.threshold) * 100, 100)
    : 100;

  return (
    <div style={{
      background: "linear-gradient(135deg, #fefce8, #f0fdf4)",
      border: "2px solid #d9f99d", borderRadius: 18,
      padding: "20px", marginBottom: 16,
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          borderRadius: 12, width: 40, height: 40, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.2rem", boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
        }}>🎁</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "#14532d" }}>Community Reward Status</div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
            5 reports → 1,000L water saved · Faster resolution → faster rewards
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 12, padding: "12px 16px", border: "1.5px solid #bbf7d0", marginBottom: 14 }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#6b7280", letterSpacing: 1.2, marginBottom: 10, textTransform: "uppercase" }}>
          Today's Community Impact
        </div>
        {impacts.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: "0.82rem" }}>No reports yet today.</div>
        ) : (
          impacts.map(({ icon, label, count, saved, unit, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: "1.1rem", width: 24 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1a1a" }}>
                  {count} report{count !== 1 ? "s" : ""} → <span style={{ color }}>{saved.toLocaleString()} {unit}</span>
                </div>
              </div>
              <span style={{ fontSize: "0.65rem", background: color + "18", color, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>
                {label}
              </span>
            </div>
          ))
        )}
      </div>

      {unlockedMilestones.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#6b7280", letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" }}>
            Rewards Unlocked
          </div>
          {unlockedMilestones.map(({ threshold, reward, icon, color }) => (
            <div key={threshold} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: color + "12", border: `1.5px solid ${color}33`,
              borderRadius: 10, padding: "8px 12px", marginBottom: 6,
            }}>
              <span style={{ fontSize: "1.1rem" }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1a1a" }}>{reward}</span>
              </div>
              <span style={{ fontSize: "0.65rem", background: color, color: "white", fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>
                {threshold}+ reports
              </span>
            </div>
          ))}
        </div>
      )}

      {nextMilestone && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 5 }}>
            <span style={{ color: "#6b7280", fontWeight: 600 }}>
              Next: <strong style={{ color: "#16a34a" }}>{nextMilestone.reward}</strong>
            </span>
            <span style={{ color: "#16a34a", fontWeight: 700 }}>{totalLogs} / {nextMilestone.threshold}</span>
          </div>
          <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              width: `${progressPct}%`, height: "100%",
              background: "linear-gradient(90deg, #16a34a, #86efac)",
              borderRadius: 99, transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
          <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginTop: 4 }}>
            {nextMilestone.threshold - totalLogs} more reports needed to unlock {nextMilestone.icon}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Top Contributors ──────────────────────────────────────────────────────────
function TopContributorsSection({ leaderboard }) {
  const entries = Object.entries(leaderboard || {})
    .map(([id, score]) => {
      const num = parseInt(String(id).replace(/\D/g, ""), 10);
      const name = !isNaN(num) && num >= 1 && num <= 10
        ? ["Lane A","Lane B","Lane C","Lane D","Lane E","Lane F","Lane G","Lane H","Lane I","Lane J"][num - 1]
        : id;
      return { id, name, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const medals = ["🏆","🥈","🥉","4️⃣","5️⃣"];
  const reportSim = entries.map((e, i) => ({ ...e, reports: Math.max(1, Math.floor(e.score / 10) - i) }));

  return (
    <div style={{
      background: "white", borderRadius: 14,
      padding: "18px 20px", marginBottom: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1.5px solid #f0f0f0",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <strong style={{ fontSize: "0.97rem", color: "#1a1a1a" }}>🏆 Top Contributors</strong>
          <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 1 }}>Lanes leading in reports & eco-score</div>
        </div>
        <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: 20, border: "1.5px solid #bbf7d0" }}>
          LIVE
        </span>
      </div>
      {entries.length === 0 ? (
        <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "0.85rem" }}>No data yet.</p>
      ) : (
        reportSim.map(({ id, name, score, reports }, i) => (
          <div key={id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, marginBottom: 7,
            background: i === 0 ? "#f0fdf4" : "#fafafa",
            border: `1.5px solid ${i === 0 ? "#bbf7d0" : "transparent"}`,
            animation: `ecoDeltaSlide 0.35s ${0.05 * i}s both ease`,
          }}>
            <span style={{ fontSize: "1.1rem", width: 26, textAlign: "center" }}>{medals[i]}</span>
            <span style={{ flex: 1, fontWeight: 700, fontSize: "0.88rem", color: i === 0 ? "#14532d" : "#374151" }}>{name}</span>
            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{reports} report{reports !== 1 ? "s" : ""}</span>
            <span style={{ fontWeight: 800, fontSize: "0.82rem", color: score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#ef4444", width: 36, textAlign: "right" }}>
              {score}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ── Why It Matters ────────────────────────────────────────────────────────────
function WhyItMatters() {
  const items = [
    { icon: "💧", title: "Water leaks detected early",    desc: "Prevents hundreds of liters of daily waste before it becomes a crisis." },
    { icon: "⚡", title: "Electricity idle reports",      desc: "Community action reduces common-area energy bills by up to 30%." },
    { icon: "♻️", title: "Waste cleared faster",          desc: "Early reporting cuts response time in half and prevents health hazards." },
    { icon: "📊", title: "Data drives decisions",          desc: "Every report improves the score model, helping allocate resources better." },
  ];
  return (
    <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
        🌍 Why It Matters
      </div>
      <div className="eco-why-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: "white", borderRadius: 10, padding: "12px", border: "1.5px solid #f0f0f0" }}>
            <div style={{ fontSize: "1.3rem", marginBottom: 5 }}>{item.icon}</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1a1a", marginBottom: 3 }}>{item.title}</div>
            <div style={{ fontSize: "0.72rem", color: "#6b7280", lineHeight: 1.45 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function DashboardPage({
  score, totalLogs, insight, severity, stats, leaderboard,
  activeIssues = [], resolvedIssues = [],
  error, scoreDelta, onRefresh,
}) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ padding: "20px 0 14px" }}>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: "1.3rem", color: "#14532d" }}>🏛️ Authority Dashboard</h2>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.82rem" }}>Real-time community ecological health · Refreshes every 5s</p>
      </div>

      <StatusBanner score={score} totalLogs={totalLogs} error={error} />

      {/* ── Active + Resolved Issues at top ── */}
      <ActiveIssuesSection issues={activeIssues} onRefresh={onRefresh} />
      <ResolvedIssuesSection issues={resolvedIssues} />

      <ScoreCard score={score} totalLogs={totalLogs} scoreDelta={scoreDelta} />
      <InsightCard insight={insight} severity={severity} />

      <CommunityRewardSection stats={stats} totalLogs={totalLogs} />

      <div className="eco-dash-grid-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ActionBox severity={severity} stats={stats} score={score} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Summary stats={stats} />
        </div>
      </div>

      <div className="eco-dash-grid-2">
        <Leaderboard data={leaderboard} />
        <TopContributorsSection leaderboard={leaderboard} />
      </div>

      <WhyItMatters />
    </div>
  );
}
