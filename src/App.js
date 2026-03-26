import { useEffect, useState } from "react";

function App() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState("");

  const [entries, setEntries] = useState([]);
  const [showMistakes, setShowMistakes] = useState(false);

  

  /* ===========================
     FETCH DATES
  =========================== */
  useEffect(() => {
    fetch("https://review-analysis-1-y6ud.onrender.com/")
      .then(res => res.json())
      .then(setDates);
  }, []);

  /* ===========================
     FETCH WORDS
  =========================== */
  useEffect(() => {
    if (!selectedDate) return;

    fetch(`https://review-analysis-1-y6ud.onrender.com//words/${selectedDate}`)
      .then(res => res.json())
      .then(setWords);
  }, [selectedDate]);

  /* ===========================
     FETCH ANALYTICS
  =========================== */
  useEffect(() => {
    if (!selectedWord || !selectedDate) return;

    fetch(
      `https://review-analysis-1-y6ud.onrender.com//analytics?word=${selectedWord}&date=${selectedDate}&mistaken=${showMistakes}`
    )
      .then(res => res.json())
      .then(setEntries);
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
    outline: "none",
    fontSize: "14px",
    cursor: "pointer",
    minWidth: "180px"
  }}
>
  <option value="">Select Date</option>
  {dates.map((d, i) => (
    <option key={i} value={d.date}>
      {d.date}
    </option>
  ))}
</select>

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
  background: selectedWord === w.word ? "#6366f1" : "#1f2937",
  color: "white",
  border: "1px solid #333",
  cursor: "pointer"
}}
          >
            {w.word}
          </button>
        ))}
      </div>

      {/* FILTER */}
      <button
  onClick={() => setShowMistakes(!showMistakes)}
  style={{
    marginTop: 20,
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

      {/* TABLE */}
      <table border="1" style={{ marginTop: 20, width: "100%" }}>
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
      {/* TOP ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {row.code}
          </div>
          <div style={{ fontSize: "14px", color: "#888" }}>
            Attempts: {row.attempts} | Time: {row.totalTime}s
          </div>
        </div>

        <div style={{ fontSize: "18px" }}>
          {row.solved ? "✅" : "❌"}
        </div>
      </div>

      {/* ATTEMPTS */}
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
              minWidth: "120px",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>
              {highlightDiff(selectedWord, c.word)}
            </div>

            <div style={{ fontSize: "15px", color: "#aaa" }}>
              {c.timeTaken}s
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
      </table>
    </div>
  );
}

export default App;