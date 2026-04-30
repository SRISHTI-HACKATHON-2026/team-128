# 🌿 EcoReport

Real-time community ecological health dashboard.

---

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
node server.js
```

Server runs at **http://localhost:3000**

---

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/voice-log` | Submit a community report |
| `GET` | `/score` | Get eco score + total logs |
| `GET` | `/insight` | Get AI insight + category stats |
| `GET` | `/leaderboard` | Get lane rankings |

### Example POST /voice-log

```bash
curl -X POST http://localhost:3000/voice-log \
  -H "Content-Type: application/json" \
  -d '{"input": "water leak in lane 3"}'
```

---

## 🎯 Features

- **Live Score**: Auto-refreshes every 5 seconds
- **Smart Classifier**: Converts text → category (water/electricity/waste)
- **Leaderboard**: Ranks community lanes by eco performance
- **Quick IVR Buttons**: One-tap reporting for common issues
- **Insight Engine**: Real-time contextual feedback

---

## 🗂 Project Structure

```
ecoreport/
├── backend/
│   ├── server.js        ← Express API
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── components/
            ├── StatusBanner.jsx
            ├── ScoreCard.jsx
            ├── InsightCard.jsx
            ├── Summary.jsx
            ├── ActionBox.jsx
            ├── Leaderboard.jsx
            └── VoiceInput.jsx
```
