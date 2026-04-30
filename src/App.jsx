import React, { useState, useEffect, useCallback, useRef } from "react";
import ReportPage from "./ReportPage";
import DashboardPage from "./DashboardPage";

const BASE = "http://localhost:3000";

// Inject global keyframes + responsive CSS once
const ANIM_STYLE_ID = "eco-global-animations";
if (!document.getElementById(ANIM_STYLE_ID)) {
  const s = document.createElement("style");
  s.id = ANIM_STYLE_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    @keyframes ecoPulse { 0%,100%{transform:scale(1)} 45%{transform:scale(1.09)} 75%{transform:scale(0.97)} }
    @keyframes ecoFadeInDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ecoFadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ecoFadeOut { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-10px)} }
    @keyframes ecoDeltaSlide { from{opacity:0;transform:translateY(8px) scale(0.8)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes ecoChainDot { 0%,100%{opacity:0.3} 50%{opacity:1} }
    @keyframes ecoGlowPulse { 0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,0.0)} 50%{box-shadow:0 0 18px 4px rgba(22,163,74,0.18)} }
    @keyframes ecoCardIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ecoTabSlide { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
    @keyframes ecoSlideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:200px} }

    .eco-card-anim { animation: ecoCardIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
    .eco-card-anim:nth-child(1){animation-delay:0.05s}
    .eco-card-anim:nth-child(2){animation-delay:0.12s}
    .eco-card-anim:nth-child(3){animation-delay:0.19s}
    .eco-card-anim:nth-child(4){animation-delay:0.26s}
    .eco-card-anim:nth-child(5){animation-delay:0.33s}
    .eco-btn-hover:hover { filter: brightness(1.08); transform: translateY(-1px); transition: all 0.15s ease; }
    .eco-card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; }
    .eco-card-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.11) !important; transform: translateY(-2px); }
    .eco-page { animation: ecoTabSlide 0.35s cubic-bezier(0.22,1,0.36,1) both; }

    /* ── RESPONSIVE LAYOUT ── */
    html, body { overflow-x: hidden; }
    * { max-width: 100%; }

    .eco-dash-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .eco-report-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
    .eco-nav-sub { display: block; }
    .eco-nav-label { display: block; }

    /* Tablet — ≤ 1024px */
    @media (max-width: 1024px) {
      .eco-dash-grid-2 { grid-template-columns: 1fr; }
    }

    /* Large phone — ≤ 640px */
    @media (max-width: 640px) {
      .eco-dash-grid-2 { grid-template-columns: 1fr; gap: 12px; }
      .eco-report-grid-3 { grid-template-columns: repeat(3,1fr); gap: 8px; }
      .eco-nav-sub { display: none; }
      .eco-nav-label { font-size: 0.78rem; }
    }

    /* Small phone — ≤ 430px */
    @media (max-width: 430px) {
      .eco-report-grid-3 { grid-template-columns: 1fr; gap: 8px; }

      /* Nav: tighten up */
      .eco-nav-label { font-size: 0.72rem; }

      /* Score ring: shrink */
      .eco-score-ring svg { width: 110px !important; height: 110px !important; }
      .eco-score-ring { width: 110px !important; height: 110px !important; }

      /* Cards: reduce padding */
      .eco-card-pad { padding: 14px 14px !important; }

      /* Buttons: full width */
      .eco-call-btn { display: flex !important; width: 100% !important; justify-content: center; }

      /* Active issue rows: stack resolve button */
      .eco-issue-row { flex-wrap: wrap !important; }
      .eco-resolve-btn { width: 100% !important; margin-top: 6px; }

      /* Why it matters: single col */
      .eco-why-grid { grid-template-columns: 1fr !important; }

      /* Cause-effect: wrap chips tighter */
      .eco-cause-chain { gap: 4px !important; }
      .eco-cause-chip { font-size: 0.7rem !important; padding: 3px 7px !important; }
    }

    /* Very small — ≤ 360px */
    @media (max-width: 360px) {
      .eco-nav-label { display: none; }
      .eco-report-grid-3 { grid-template-columns: 1fr; }
      h1 { font-size: 1.35rem !important; }
      h2 { font-size: 1.1rem !important; }
    }
  `;
  document.head.appendChild(s);
}

function NavBar({ activePage, onNavigate, error, totalLogs }) {
  const tabs = [
    { id: "report",    icon: "👥", label: "Report Issue",  sub: "For residents" },
    { id: "dashboard", icon: "🏛️", label: "Dashboard",     sub: "For authorities" },
  ];
  return (
    <header style={{
      background: "white",
      borderBottom: "1.5px solid #e5e7eb",
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        padding: "0 16px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        height: 60,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            borderRadius: 10, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1rem",
            boxShadow: "0 4px 10px rgba(22,163,74,0.3)", flexShrink: 0,
          }}>🌿</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#14532d", letterSpacing: -0.3 }}>EcoReport</div>
            <div className="eco-nav-sub" style={{ fontSize: "0.6rem", color: "#9ca3af", lineHeight: 1 }}>Civic eco-tech</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: 10, border: "none",
                cursor: "pointer", fontFamily: "inherit",
                background: activePage === tab.id ? "#f0fdf4" : "transparent",
                color: activePage === tab.id ? "#16a34a" : "#6b7280",
                fontWeight: activePage === tab.id ? 800 : 600,
                fontSize: "0.82rem",
                boxShadow: activePage === tab.id ? "0 0 0 2px #bbf7d0" : "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (activePage !== tab.id) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (activePage !== tab.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: "0.95rem" }}>{tab.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div className="eco-nav-label">{tab.label}</div>
                <div className="eco-nav-sub" style={{ fontSize: "0.58rem", opacity: 0.6, fontWeight: 400, lineHeight: 1 }}>{tab.sub}</div>
              </div>
              {tab.id === "dashboard" && totalLogs > 0 && (
                <span style={{
                  background: "#16a34a", color: "white",
                  fontSize: "0.58rem", fontWeight: 800,
                  padding: "1px 5px", borderRadius: 99, minWidth: 16, textAlign: "center",
                }}>
                  {totalLogs}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Live dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.7rem", color: error ? "#ef4444" : "#16a34a", fontWeight: 700, flexShrink: 0 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: error ? "#ef4444" : "#16a34a",
            display: "inline-block",
            animation: error ? "none" : "ecoChainDot 2s infinite",
          }} />
          {error ? "Offline" : "Live"}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [page, setPage] = useState("report");
  const [score, setScore] = useState(50);
  const [totalLogs, setTotalLogs] = useState(0);
  const [insight, setInsight] = useState("Awaiting community signals...");
  const [severity, setSeverity] = useState("low");
  const [stats, setStats] = useState({ waterWaste: 0, electricityIssues: 0, wasteProblems: 0 });
  const [leaderboard, setLeaderboard] = useState({});
  const [activeIssues, setActiveIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [error, setError] = useState(false);

  const prevScoreRef = useRef(null);
  const [scoreDelta, setScoreDelta] = useState(null);
  const deltaTimerRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [scoreRes, insightRes, leaderRes, activeRes, resolvedRes] = await Promise.all([
        fetch(`${BASE}/score`),
        fetch(`${BASE}/insight`),
        fetch(`${BASE}/leaderboard`),
        fetch(`${BASE}/active-issues`),
        fetch(`${BASE}/resolved-issues`),
      ]);
      const scoreData    = await scoreRes.json();
      const insightData  = await insightRes.json();
      const leaderData   = await leaderRes.json();
      const activeData   = await activeRes.json();
      const resolvedData = await resolvedRes.json();

      const newScore = scoreData.eco_score;
      if (prevScoreRef.current !== null && newScore !== prevScoreRef.current) {
        const delta = newScore - prevScoreRef.current;
        if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
        setScoreDelta(delta);
        deltaTimerRef.current = setTimeout(() => setScoreDelta(null), 3500);
      }
      prevScoreRef.current = newScore;

      setScore(newScore);
      setTotalLogs(scoreData.total_logs);
      setInsight(insightData.insight);
      setSeverity(insightData.severity);
      setStats(insightData.stats);
      setLeaderboard(leaderData);
      setActiveIssues(Array.isArray(activeData) ? activeData : []);
      setResolvedIssues(Array.isArray(resolvedData) ? resolvedData : []);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 5000);
    return () => {
      clearInterval(timer);
      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
    };
  }, [fetchAll]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #eef5ef 0%, #e8f5e9 50%, #f0f7f0 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <NavBar activePage={page} onNavigate={setPage} error={error} totalLogs={totalLogs} />

      <div key={page} className="eco-page">
        {page === "report" ? (
          <ReportPage onReport={fetchAll} />
        ) : (
          <DashboardPage
            score={score}
            totalLogs={totalLogs}
            insight={insight}
            severity={severity}
            stats={stats}
            leaderboard={leaderboard}
            activeIssues={activeIssues}
            resolvedIssues={resolvedIssues}
            error={error}
            scoreDelta={scoreDelta}
            onRefresh={fetchAll}
          />
        )}
      </div>
    </div>
  );
}
