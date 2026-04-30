require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SUPABASE_URL = (process.env.SUPABASE_URL || "https://qirilambqoegldaahhqc.supabase.co").replace(/^["']|["']$/g, "").trim();
const SUPABASE_KEY = (process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcmlsYW1icW9lZ2xkYWFoaHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDg3MjQsImV4cCI6MjA5MzAyNDcyNH0.t5tITzKCMH-d23Pc7y2ampv_jfFWO5yW7eyFOwlEPnI").replace(/^["']|["']$/g, "").trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("🔗 Supabase connecting to:", SUPABASE_URL);

function classifyInput(text) {
  const t = (text || "").toLowerCase();
  if (/tap|leak|water|pipe|drain|drip|flood|paani|nal/.test(t)) {
    return { category: "water", type: /save|fix|repair/.test(t) ? "saved" : "waste" };
  }
  if (/light|fan|electric|power|bulb|switch|current|socket|bijli/.test(t)) {
    return { category: "electricity", type: /save|off|repair/.test(t) ? "saved" : "waste" };
  }
  if (/garbage|waste|trash|litter|dump|bin|rubbish|kachra/.test(t)) {
    return { category: "waste", type: /recycle|clean|clear/.test(t) ? "saved" : "issue" };
  }
  return { category: "general", type: "issue" };
}

function randomLane() {
  const lanes = ["lane_1", "lane_2", "lane_3", "lane_4", "lane_5"];
  return lanes[Math.floor(Math.random() * lanes.length)];
}

// ─── VOICE LOG ────────────────────────────────────────────────────────────────
app.post("/voice-log", async (req, res) => {
  const { input, lane } = req.body;
  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Missing input" });
  }
  const { category, type } = classifyInput(input);
  const lane_id = lane || randomLane();
  const { data, error } = await supabase
    .from("logs")
    .insert([{ text: input, category, type, lane_id, status: "open" }])
    .select()
    .single();
  if (error) {
    console.error("Supabase insert error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true, log: { ...data, input, category, type } });
});

// ─── RESOLVE ─────────────────────────────────────────────────────────────────
app.post("/resolve", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });
  const { error } = await supabase
    .from("logs")
    .update({ status: "resolved", type: "saved" })
    .eq("id", id);
  if (error) {
    console.error("Supabase resolve error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
});

// ─── ACTIVE ISSUES ────────────────────────────────────────────────────────────
app.get("/active-issues", async (req, res) => {
  const { data, error } = await supabase
    .from("logs")
    .select("id, text, category, type, lane_id, created_at, status")
    .or("status.eq.open,status.is.null")
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) {
    console.error("Supabase active-issues error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json(data || []);
});

// ─── RESOLVED ISSUES ──────────────────────────────────────────────────────────
app.get("/resolved-issues", async (req, res) => {
  const { data, error } = await supabase
    .from("logs")
    .select("id, text, category, type, lane_id, created_at, status")
    .eq("status", "resolved")
    .order("created_at", { ascending: false })
    .limit(15);
  if (error) {
    console.error("Supabase resolved-issues error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.json(data || []);
});

// ─── SCORE ────────────────────────────────────────────────────────────────────
app.get("/score", async (req, res) => {
  const { data, error } = await supabase.from("logs").select("type");
  if (error) {
    console.error("Supabase score error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  let score = 50;
  for (const log of data) {
    if (log.type === "saved") score += 2;
    else score -= 2;
  }
  score = Math.max(0, Math.min(100, score));
  res.json({ eco_score: score, total_logs: data.length });
});

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
app.get("/leaderboard", async (req, res) => {
  const { data, error } = await supabase.from("logs").select("lane_id, type");
  if (error) {
    console.error("Supabase leaderboard error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  const laneScores = {};
  for (const log of data) {
    const lane = log.lane_id || "lane_1";
    if (!laneScores[lane]) laneScores[lane] = 50;
    if (log.type === "saved") laneScores[lane] += 2;
    else laneScores[lane] -= 2;
  }
  for (const lane in laneScores) {
    laneScores[lane] = Math.max(0, Math.min(100, laneScores[lane]));
  }
  const sorted = Object.entries(laneScores)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
  res.json(sorted);
});

// ─── INSIGHT ──────────────────────────────────────────────────────────────────
app.get("/insight", async (req, res) => {
  const { data, error } = await supabase.from("logs").select("category, type");
  if (error) {
    console.error("Supabase insight error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  const waterWaste        = data.filter(l => l.category === "water"       && l.type !== "saved").length;
  const electricityIssues = data.filter(l => l.category === "electricity" && l.type !== "saved").length;
  const wasteProblems     = data.filter(l => l.category === "waste"       && l.type !== "saved").length;
  let insight = "No issues reported yet. Start logging to track community health.";
  let severity = "low";
  const max = Math.max(waterWaste, electricityIssues, wasteProblems);
  if (max > 0) {
    if (waterWaste >= electricityIssues && waterWaste >= wasteProblems) {
      insight = waterWaste > 3
        ? "Critical: High water waste reported across lanes. Immediate action needed — check taps and pipes."
        : "Water waste detected in your community. Encourage residents to fix leaking taps.";
      severity = waterWaste > 3 ? "high" : "medium";
    } else if (electricityIssues >= waterWaste && electricityIssues >= wasteProblems) {
      insight = electricityIssues > 3
        ? "Critical: Electricity misuse is widespread. Switch off unused lights and fans immediately."
        : "Electricity issues spotted. Remind residents to reduce idle power consumption.";
      severity = electricityIssues > 3 ? "high" : "medium";
    } else {
      insight = wasteProblems > 3
        ? "Waste management crisis across lanes. Coordinate with municipal services urgently."
        : "Waste problems reported. Organize a community cleanup and log the results.";
      severity = wasteProblems > 3 ? "high" : "medium";
    }
  }
  res.json({ insight, severity, stats: { waterWaste, electricityIssues, wasteProblems } });
});

// ─── IVR ──────────────────────────────────────────────────────────────────────
app.post("/ivr", (req, res) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-IN">Welcome to EcoReport. Press 1 for water issue. Press 2 for electricity issue. Press 3 for waste problem. Or describe your issue after the beep.</Say>
  <Gather input="speech dtmf" timeout="5" numDigits="1" action="/ivr/gather" method="POST">
    <Say voice="alice" language="en-IN">Please press a number or speak now.</Say>
  </Gather>
  <Record transcribe="true" transcribeCallback="/transcription" maxLength="30" playBeep="true" />
  <Say voice="alice" language="en-IN">Thank you. Your report has been received. Goodbye.</Say>
</Response>`;
  res.type("text/xml");
  res.send(twiml);
});

app.post("/ivr/gather", async (req, res) => {
  const digit = req.body.Digits;
  const speech = req.body.SpeechResult;
  const callSid = req.body.CallSid || "unknown";
  let inputText = speech || "";
  if (!inputText) {
    if (digit === "1") inputText = "water leak tap issue";
    else if (digit === "2") inputText = "light fan electricity issue";
    else if (digit === "3") inputText = "garbage waste not collected";
    else inputText = "general issue reported via IVR";
  }
  console.log("IVR input received:", inputText, "| CallSid:", callSid);
  const { category, type } = classifyInput(inputText);
  const lane_id = randomLane();
  await supabase.from("logs").insert([{ text: inputText, category, type, lane_id, status: "open" }]);
  res.type("text/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-IN">Thank you. Your ${category} report has been recorded. Goodbye.</Say>
  <Hangup/>
</Response>`);
});

app.post("/transcription", async (req, res) => {
  try {
    const text = (req.body.TranscriptionText || req.body.SpeechResult || "").toLowerCase();
    const callSid = req.body.CallSid || "unknown";
    console.log("IVR transcription received:", text, "| CallSid:", callSid);
    if (!text.trim()) return res.sendStatus(200);
    let category = "general";
    if (/tap|leak|water|paani|nal|pipe|drain|drip|flood/.test(text)) category = "water";
    else if (/light|fan|electric|power|bulb|switch|bijli|current|socket/.test(text)) category = "electricity";
    else if (/garbage|waste|trash|litter|dump|bin|rubbish|kachra/.test(text)) category = "waste";
    const lane_id = randomLane();
    const { error } = await supabase.from("logs").insert([{ text, category, type: "issue", lane_id, status: "open" }]);
    if (error) console.error("Transcription insert error:", error.message);
    else console.log(`Transcription stored — category: ${category}, lane: ${lane_id}`);
    res.sendStatus(200);
  } catch (err) {
    console.error("IVR error:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ EcoReport API running at http://localhost:${PORT}`));
