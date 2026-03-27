import { useEffect, useState } from "react";

const BASE_URL = "https://review-analysis-3.onrender.com";

function App() {
  const [activeTab, setActiveTab] = useState("word");
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState("");

  const [entries, setEntries] = useState([]);
  const [showMistakes, setShowMistakes] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userData, setUserData] = useState([]);
  

  /* ===========================
     FETCH DATES
  =========================== */
  useEffect(() => {
  fetch(`${BASE_URL}/dates`)
    .then(res => res.json())
    .then((data) => {
      console.log("DATES:", data);

      if (Array.isArray(data)) {
        setDates(data);
      } else {
        setDates([]);
      }
    })
    .catch(() => setDates([]));
}, []);

  /* ===========================
     FETCH USERS
  =========================== */
useEffect(() => {
  if (!selectedDate) return;

  console.log("SELECTED DATE:", selectedDate); // 👈 ADD THIS

  fetch(`${BASE_URL}/users/${selectedDate}`)
    .then(res => res.json())
    .then((data) => {
      console.log("USERS API RESPONSE:", data); // 👈 ADD THIS

      if (Array.isArray(data)) {
        setUsers([...data]);
      } else {
        setUsers([]);
      }
    })
    .catch((err) => {
      console.error("USER FETCH ERROR:", err);
      setUsers([]);
    });
}, [selectedDate]);

  /* ===========================
     FETCH USERS ANALYTICS
  =========================== */

  useEffect(() => {
  if (!selectedUser || !selectedDate) return;

  fetch(`${BASE_URL}/user-analytics?code=${selectedUser}&date=${selectedDate}`)
    .then(res => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setUserData(data);
      }
    });
}, [selectedUser, selectedDate]);

  /* ===========================
     FETCH WORDS
  =========================== */
  useEffect(() => {
  if (!selectedDate) return;

  fetch(`${BASE_URL}/words/${selectedDate}`)
    .then(res => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setWords(data);
      } else {
        setWords([]);
      }
    });
}, [selectedDate]);

  /* ===========================
     FETCH ANALYTICS
  =========================== */
  useEffect(() => {
  if (!selectedWord || !selectedDate) return;

  fetch(
    `${BASE_URL}/analytics?word=${selectedWord}&date=${selectedDate}&mistaken=${showMistakes}`
  )
    .then(res => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setEntries(data);
      } else {
        setEntries([]);
      }
    });
}, [selectedWord, selectedDate, showMistakes]);

  /* ===========================
     PROCESS DATA
  =========================== */
const processed = entries.map(e => {
  const checks = e.data.check;

  const solved = checks.some(c => c.isCorrect);

  const correctIndex = checks.findIndex(c => c.isCorrect);
  const attempts = correctIndex === -1 ? checks.length : correctIndex + 1;

  const totalTime = checks.reduce((s, c) => s + c.timeTaken, 0).toFixed(2);

  const mistakes = checks.filter(c => !c.isCorrect);

  return {
    ...e,
    solved,
    attempts,
    totalTime,
    checks,
    mistakes
  };
});

  const filtered = showMistakes
  ? processed.filter(p => p.mistakes.length > 0)
  : processed;

  function highlightDiff(correct, typed) {
  return typed.split("").map((ch, i) => {
    const isCorrect = ch === correct[i];
    return (
      <span key={i} style={{ color: isCorrect ? "#4ade80" : "#f87171" }}>
        {ch}
      </span>
    );
  });
}

  return (
  <div
    style={{
      padding: "40px",
      background: "#0a0b0f",
      color: "white",
      minHeight: "100vh",
      maxWidth: "900px",
      margin: "auto",
    }}
  >
    <h2>Word Analytics</h2>

    {/* DATE SELECT */}
    <select
      onChange={(e) => setSelectedDate(e.target.value)}
      style={{
        marginTop: "10px",
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#111318",
        color: "white",
        border: "1px solid #2a2f3a",
        fontSize: "14px",
        cursor: "pointer",
        minWidth: "180px"
      }}
    >
      <option value="">Select Date</option>
      {Array.isArray(dates) &&
        dates.map((d, i) => (
          <option key={i} value={d.date.split("T")[0]}>
            {d.date.split("T")[0]}
          </option>
        ))}
    </select>

    {/* 🔥 TAB SWITCH */}
    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
      <button
        onClick={() => setActiveTab("word")}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: activeTab === "word" ? "#6366f1" : "#1f2937",
          color: "white"
        }}
      >
        Word Analysis
      </button>

      <button
        onClick={() => setActiveTab("user")}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: activeTab === "user" ? "#6366f1" : "#1f2937",
          color: "white"
        }}
      >
        User Analysis
      </button>
    </div>

    {/* ================= WORD TAB ================= */}
    {activeTab === "word" && (
      <>
        {/* WORD SELECT */}
        <div style={{ marginTop: 20 }}>
          {words.map((w, i) => (
            <button
              key={i}
              onClick={() => setSelectedWord(w.word)}
              style={{
                margin: 6,
                padding: "8px 14px",
                borderRadius: "8px",
                background:
                  selectedWord === w.word ? "#6366f1" : "#1f2937",
                color: "white",
                border: "1px solid #333",
                cursor: "pointer"
              }}
            >
              {w.word}
            </button>
          ))}
        </div>

        {/* DOWNLOAD */}
        <button
          onClick={() => {
            if (!selectedWord || !selectedDate) return;
            window.open(
              `${BASE_URL}/download?word=${selectedWord}&date=${selectedDate}`
            );
          }}
          style={{
            marginTop: 20,
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#22c55e",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Download Excel
        </button>

        {/* FILTER */}
        <button
          onClick={() => setShowMistakes(!showMistakes)}
          style={{
            marginTop: 20,
            marginLeft: 10,
            padding: "8px 16px",
            borderRadius: "8px",
            background: showMistakes ? "#ef4444" : "#374151",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          {showMistakes ? "Showing Mistakes Only" : "Show All"}
        </button>

        {/* CARDS */}
        <div style={{ marginTop: 30 }}>
          {filtered.map((row, i) => (
            <div
              key={i}
              style={{
                background: "#111318",
                padding: "16px",
                marginBottom: "14px",
                borderRadius: "10px",
                border: "1px solid #222",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>
                    {row.code}
                  </div>
                  <div style={{ fontSize: "14px", color: "#888" }}>
                    Attempts: {row.attempts} | Time: {row.totalTime}s
                  </div>
                </div>

                <div>{row.solved ? "✅" : "❌"}</div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {row.checks.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: c.isCorrect
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(239,68,68,0.1)",
                      border: c.isCorrect
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(239,68,68,0.3)",
                    }}
                  >
                    <div>
                      {highlightDiff(selectedWord, c.word)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#aaa" }}>
                      {c.timeTaken}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {/* ================= USER TAB ================= */}
    {activeTab === "user" && (
      <>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{
            marginTop: "20px",
            padding: "10px",
            borderRadius: "8px",
            background: "#111318",
            color: "white",
            border: "1px solid #2a2f3a"
          }}
        >
          <option value="">Select User</option>
          {Array.isArray(users) &&
            users.map((u, i) => (
              <option key={i} value={u.code}>
                {u.code}
              </option>
            ))}
        </select>

        <div style={{ marginTop: 30 }}>
          {userData.map((entry, i) => (
            <div
              key={i}
              style={{
                background: "#111318",
                padding: "14px",
                marginBottom: "12px",
                borderRadius: "8px"
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                Word: {entry.word}
              </div>

              {entry.data.check
                .filter(c => !c.isCorrect)
                .map((c, j) => (
                  <div key={j} style={{ color: "#f87171" }}>
                    ❌ {c.word} ({c.timeTaken}s)
                  </div>
                ))}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);
}

export default App;