import { useEffect, useState } from "react";
import { api } from "../services/api";

const AdminMultiSelectScorers = ({ q, m, api, loadMatchDetails }) => {
  const totalOptions = q.options || [];
  const usesTeamId = totalOptions[0]?.teamId !== undefined;
  const teamAIdToken = usesTeamId ? totalOptions[0]?.teamId : null;

  // Helper to determine if an option belongs to Team A
  const isPlayerFromTeamA = (opt, index) => {
    if (opt.text?.includes("Conceded by Team A")) return true;
    if (opt.text?.includes("Conceded by Team B")) return false;
    return usesTeamId ? opt.teamId === teamAIdToken : index < 26;
  };
  useEffect(() => {
    if (q.options) {
      const savedIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      setLocalScorers(savedIds);
    }
  }, [q.options]);
  // Synchronize state with real database option items marked as correct
  const [localScorers, setLocalScorers] = useState(() => {
    const initial = [];
    totalOptions.forEach((o) => {
      if (o.isCorrect) initial.push(o.id);
    });
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);

  // Split options directly from data pool into columns
  const teamAOptions = [];
  const teamBOptions = [];
  totalOptions.forEach((opt, idx) => {
    if (isPlayerFromTeamA(opt, idx)) {
      teamAOptions.push({ opt, globalIndex: idx });
    } else {
      teamBOptions.push({ opt, globalIndex: idx });
    }
  });

  // Scoreboard counters (Football logic: Team B conceding an own goal adds to Team A's tally)
  const countA = localScorers.filter((id) => {
    const i = totalOptions.findIndex((o) => o.id === id);
    if (i === -1) return false;

    const opt = totalOptions[i];
    if (opt.text?.includes("Conceded by Team B")) return true;
    if (opt.text?.includes("Conceded by Team A")) return false;

    return isPlayerFromTeamA(opt, i);
  }).length;

  const countB = localScorers.filter((id) => {
    const i = totalOptions.findIndex((o) => o.id === id);
    if (i === -1) return false;

    const opt = totalOptions[i];
    if (opt.text?.includes("Conceded by Team A")) return true;
    if (opt.text?.includes("Conceded by Team B")) return false;

    return !isPlayerFromTeamA(opt, i);
  }).length;

  // MASTER SAVE LOGIC
  const handleAdminSave = async () => {
    setIsSaving(true);
    try {
      // Step A: Unmark any options no longer in our local array
      const itemsToUnmark = totalOptions.filter(
        (o) => o.isCorrect && !localScorers.includes(o.id),
      );
      for (const item of itemsToUnmark) {
        await api.patch(
          `/options/${item.id}/correct`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      }

      // Step B: Dynamically scale brackets for multiples (braces, duplicate own goals)
      const uniqueSelections = [...new Set(localScorers)];

      for (const selectionId of uniqueSelections) {
        const targetCount = localScorers.filter(
          (id) => id === selectionId,
        ).length;

        const found = totalOptions.find((o) => o.id === selectionId);
        if (!found) continue;
        const optionText = found.text;

        // Collect existing items matching this string identity
        let existingOptionsWithText = totalOptions.filter(
          (o) => o.text === optionText,
        );

        // Provision missing bracket slots dynamically if there's a multi-goal performance
        while (existingOptionsWithText.length < targetCount) {
          const res = await api.post(
            "/options",
            { questionId: q.id, text: optionText },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          existingOptionsWithText.push(
            res.data || { text: optionText, isCorrect: false },
          );
        }

        // Step C: Flush precise evaluation states to database rows
        for (let i = 0; i < existingOptionsWithText.length; i++) {
          const currentItem = existingOptionsWithText[i];
          const shouldBeCorrect = i < targetCount;

          if (currentItem.id && currentItem.isCorrect !== shouldBeCorrect) {
            await api.patch(
              `/options/${currentItem.id}/correct`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            );
          }
        }
      }

      alert("Official match answers successfully saved!");
      loadMatchDetails(m.id);
    } catch (err) {
      console.error("Error saving admin answers:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderAdminPlayerButton = (opt, index) => {
    const playerGoalCount = localScorers.filter((id) => id === opt.id).length;
    const isChecked = playerGoalCount > 0;

    const handleIncrement = () => {
      setLocalScorers((prev) => [...prev, opt.id]);
    };

    const handleDecrement = () => {
      if (playerGoalCount === 0) return;
      const indexToRemove = localScorers.indexOf(opt.id);
      const updated = [...localScorers];
      if (indexToRemove !== -1) updated.splice(indexToRemove, 1);
      setLocalScorers(updated);
    };

    return (
      <div
        key={opt.id}
        className="player-row block w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between transition-all"
        style={{
          background: isChecked
            ? "rgba(0,200,80,0.06)"
            : "rgba(255,255,255,0.03)",
          borderColor: isChecked
            ? "rgba(0,200,80,0.3)"
            : "rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="text-xs font-semibold truncate"
            style={{ color: isChecked ? "#e2e8f0" : "#94a3b8" }}
          >
            {opt.text}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {isChecked && (
            <button
              type="button"
              onClick={handleDecrement}
              className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 flex items-center justify-center text-xs font-black text-red-400 cursor-pointer"
            >
              —
            </button>
          )}

          {isChecked && (
            <span className="text-xs font-black min-w-[14px] text-center text-green-400">
              {playerGoalCount}
            </span>
          )}

          <button
            type="button"
            onClick={handleIncrement}
            className="w-6 h-6 rounded-lg bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 flex items-center justify-center text-xs font-black text-green-400 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 border-t border-gray-800 pt-4 mt-2">
      {/* Admin Control Banner */}
      <div
        className="flex flex-wrap gap-3 text-xs font-black tracking-wide py-2 px-3 rounded-xl justify-between items-center"
        style={{
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span className="text-gray-400 uppercase tracking-wider text-[10px]">
          Match Score Center (Admin Mode)
        </span>
        <div className="flex gap-4">
          <span className="text-green-400">
            🟢 {m.teamA?.name || "Team A"}: {countA} goals
          </span>
          <span className="text-blue-400">
            🔵 {m.teamB?.name || "Team B"}: {countB} goals
          </span>
        </div>
      </div>

      {/* Two Column Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team A Columns */}
        <div
          className="rounded-2xl p-3"
          style={{
            background: "rgba(0,200,80,0.04)",
            border: "1px solid rgba(0,200,80,0.12)",
          }}
        >
          <div className="mb-2.5 px-1 font-black uppercase tracking-widest text-green-400 text-[11px]">
            {m.teamA?.name || "Team A"}
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {teamAOptions.map(({ opt, globalIndex }) =>
              renderAdminPlayerButton(opt, globalIndex),
            )}
          </div>
        </div>

        {/* Team B Columns */}
        <div
          className="rounded-2xl p-3"
          style={{
            background: "rgba(0,150,255,0.04)",
            border: "1px solid rgba(0,150,255,0.12)",
          }}
        >
          <div className="mb-2.5 px-1 font-black uppercase tracking-widest text-blue-400 text-[11px]">
            {m.teamB?.name || "Team B"}
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {teamBOptions.map(({ opt, globalIndex }) =>
              renderAdminPlayerButton(opt, globalIndex),
            )}
          </div>
        </div>
      </div>

      {/* Save Button Action Trigger */}
      <button
        type="button"
        disabled={isSaving}
        onClick={handleAdminSave}
        className="w-full py-2.5 rounded-xl font-black text-sm tracking-wide transition-all uppercase"
        style={{
          background: "linear-gradient(135deg, #16a34a, #15803d)",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(22,163,74,0.2)",
          opacity: isSaving ? 0.6 : 1,
          cursor: isSaving ? "not-allowed" : "pointer",
        }}
      >
        {isSaving ? "Syncing Database..." : "💾 Save Official Match Results"}
      </button>
    </div>
  );
};

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [teamA, setTeamA] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [teamB, setTeamB] = useState("");
  const [kickoffAt, setKickoffAt] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("OPTION");
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [optionText, setOptionText] = useState("");
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [matchDetails, setMatchDetails] = useState({});
  const [newQuestions, setNewQuestions] = useState({});
  const [optionInputs, setOptionInputs] = useState({});
  const [questionTypes, setQuestionTypes] = useState({});
  const [pageVisible, setPageVisible] = useState(false);
  const [editingTextAnswer, setEditingTextAnswer] = useState({});
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [completingMatch, setCompletingMatch] = useState({});

  useEffect(() => {
    loadMatches();
    loadQuestions();
    loadTeams();
    setTimeout(() => setPageVisible(true), 80);
  }, []);

  const loadMatches = async () => {
    const res = await api.get("/admin/matches", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setMatches(res.data);
  };
  const loadTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const loadMatchDetails = async (matchId) => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatchDetails((prev) => ({ ...prev, [matchId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };
  const createMatch = async () => {
    if (!teamAId || !teamBId || !kickoffAt) {
      alert("⚠️ Please enter Team A, Team B and Kickoff Time");
      return;
    }
    try {
      setCreatingMatch(true);
      await api.post(
        "/admin/matches",
        { teamAId, teamBId, kickoffAt },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setTeamAId("");
      setTeamBId("");
      setKickoffAt("");
      loadMatches();
    } catch (err) {
      console.log(err.response?.data);
      alert(JSON.stringify(err.response?.data));
      console.error(err);
      alert("Failed to create match");
    } finally {
      setCreatingMatch(false);
    }
  };
  const toggleLock = async (id, isLocked) => {
    await api.patch(
      `/admin/matches/${id}/${isLocked ? "unlock" : "lock"}`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    );
    loadMatches();
  };
  const createQuestion = async () => {
    try {
      await api.post(
        "/questions",
        { text: questionText, type: questionType, matchId: selectedMatchId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Question created successfully");
      setQuestionText("");
      setQuestionType("OPTION");
      setSelectedMatchId("");
    } catch (err) {
      console.error(err);
      alert("Failed to create question");
    }
  };
  const loadQuestions = async () => {
    const res = await api.get("/questions");
    setQuestions(res.data);
  };
  const formatKickoff = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };
  const createOption = async () => {
    if (!selectedQuestionId || !optionText) {
      alert("Select a question and enter option text");
      return;
    }
    try {
      await api.post(
        "/options",
        { questionId: selectedQuestionId, text: optionText },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      alert("Option created");
      setOptionText("");
      setSelectedQuestionId("");
    } catch (err) {
      console.error(err);
      alert("Failed to create option");
    }
  };

  const inputBase = {
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    color: "#f1f5f9",
    padding: "11px 14px",
    width: "100%",
    outline: "none",
    fontSize: "0.875rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'Iner', sans-serif",
  };
  const focusInput = (e) => {
    e.currentTarget.style.borderColor = "rgba(0,200,80,0.5)";
    e.currentTarget.style.boxShadow = "0 0 16px rgba(0,200,80,0.1)";
  };
  const blurInput = (e) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
    e.currentTarget.style.boxShadow = "none";
  };

  const glass = {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
  };

  console.log(matches);

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background: "#060810",
        opacity: pageVisible ? 1 : 0,
        transition: "opacity 0.6s ease",
        fontFamily: "'Iner', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;800;900&family=Iner:wght@400;500;600&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .admin-btn { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-flex; align-items: center; gap: 6px; font-weight: 800; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 10px; padding: 9px 16px; border: none; cursor: pointer; font-family: 'Rajdhani', sans-serif; }
        .admin-btn:hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.12); }
        .admin-btn:active { transform: scale(0.97); }
        .match-row { animation: fadeUp 0.4s ease both; }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.5) sepia(1) saturate(3) hue-rotate(90deg); cursor: pointer; }
        select option { background: #0f1219; color: #f1f5f9; }
        .scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,200,80,0.3); border-radius: 2px; }
        .shimmer-title {
          background: linear-gradient(90deg, #00c850, #00e5ff, #ffd700, #00c850);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.028 }}
        >
          <defs>
            <pattern
              id="adminGrid"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="80"
                height="80"
                fill="none"
                stroke="#00c850"
                strokeWidth="0.5"
              />
              <circle
                cx="40"
                cy="40"
                r="13"
                fill="none"
                stroke="#00c850"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#adminGrid)" />
        </svg>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,200,80,0.06) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(0,150,255,0.06)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(168,85,247,0.04)" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* ── Header ── */}
        <div
          className="mb-10 text-center"
          style={{ animation: "fadeDown 0.5s ease both" }}
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-4 text-xs font-black tracking-[0.2em] uppercase"
            style={{
              background: "rgba(255,215,0,0.08)",
              border: "1px solid rgba(255,215,0,0.22)",
              color: "#ffd700",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Admin Control Panel
          </div>
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(2.8rem, 8vw, 5rem)",
              fontWeight: 900,
              lineHeight: 0.95,
            }}
          >
            <span className="shimmer-title">Match Manager</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.2em] uppercase mt-3 font-medium">
            Create · Configure · Control
          </p>
          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-green-500/40" />
            <span className="text-xl">🏟️</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-green-500/40" />
          </div>
        </div>

        {/* ── CREATE MATCH ── */}
        <section
          className="rounded-2xl p-6 sm:p-7 mb-8"
          style={{ ...glass, animation: "fadeUp 0.5s ease 0.1s both" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
              style={{
                background: "rgba(0,150,255,0.15)",
                border: "1px solid rgba(0,150,255,0.3)",
              }}
            >
              ➕
            </div>
            <div>
              <h2
                className="text-sm font-black tracking-[0.15em] uppercase text-blue-300"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Create Match
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Schedule a new fixture
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Team A (Home)
              </label>
              <select
                style={inputBase}
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                <option value="">Select Team A</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                Team B (Away)
              </label>
              <select
                style={inputBase}
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                <option value="">Select Team B</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              Kickoff Time
            </label>
            <input
              type="datetime-local"
              style={inputBase}
              value={kickoffAt}
              onChange={(e) => setKickoffAt(e.target.value)}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </div>
          <button
            onClick={createMatch}
            disabled={creatingMatch}
            className="admin-btn"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
              color: "#fff",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
              opacity: creatingMatch ? 0.7 : 1,
            }}
          >
            {creatingMatch ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Creating…</span>
              </>
            ) : (
              <>
                <span>🏟️</span>
                <span>Create Match</span>
              </>
            )}
          </button>
        </section>

        {/* ── Fixtures count ── */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.1))",
            }}
          />
          <p
            className="text-xs font-black uppercase tracking-widest text-gray-500"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {matches.length} {matches.length === 1 ? "Fixture" : "Fixtures"}
          </p>
          <div
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)",
            }}
          />
        </div>

        {/* ── Match List ── */}
        <div className="space-y-5">
          {matches.map((m, idx) => (
            <div
              key={m.id}
              className="match-row rounded-2xl overflow-hidden"
              style={{ ...glass, animationDelay: 0.1 + idx * 0.06 + "s" }}
            >
              {/* Top bar */}
              <div
                className="h-0.5 w-full"
                style={{
                  background: m.isLocked
                    ? "linear-gradient(90deg,#ef4444,#f97316)"
                    : "linear-gradient(90deg,#00c850,#00e5ff,#ffd700)",
                }}
              />

              <div className="p-5 sm:p-6">
                {/* Match header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black"
                      style={{
                        background: "rgba(0,200,80,0.12)",
                        border: "1px solid rgba(0,200,80,0.25)",
                        color: "#00c850",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {m.teamA?.name?.charAt(0)}
                    </div>
                    <div>
                      <h2
                        className="text-base sm:text-lg font-black text-white tracking-wide"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        {m.teamA?.name}{" "}
                        <span className="text-gray-500 font-normal text-sm">
                          vs
                        </span>{" "}
                        {m.teamB?.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span>⏰</span>
                        <span>{formatKickoff(m.kickoffAt)}</span>
                      </p>
                    </div>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-black"
                      style={{
                        background: "rgba(0,150,255,0.12)",
                        border: "1px solid rgba(0,150,255,0.25)",
                        color: "#60a5fa",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {m.teamB?.name?.charAt(0)}
                    </div>
                  </div>
                  {/* Status */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                    style={{
                      background: m.isLocked
                        ? "rgba(239,68,68,0.1)"
                        : "rgba(0,200,80,0.1)",
                      border: `1px solid ${m.isLocked ? "rgba(239,68,68,0.3)" : "rgba(0,200,80,0.3)"}`,
                      color: m.isLocked ? "#f87171" : "#00c850",
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    <span>{m.isLocked ? "🔒" : "🟢"}</span>
                    {m.isLocked ? "Locked" : "Open"}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <button
                    className="admin-btn"
                    onClick={() => {
                      setExpandedMatchId(
                        expandedMatchId === m.id ? null : m.id,
                      );
                      if (!matchDetails[m.id]) loadMatchDetails(m.id);
                    }}
                    style={{
                      background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
                      color: "#fff",
                      boxShadow: "0 0 14px rgba(59,130,246,0.2)",
                    }}
                  >
                    📋 {expandedMatchId === m.id ? "Hide" : "View"} Questions
                  </button>

                  <button
                    className="admin-btn"
                    onClick={() => toggleLock(m.id, m.isLocked)}
                    style={{
                      background: m.isLocked
                        ? "linear-gradient(135deg, #16a34a, #15803d)"
                        : "linear-gradient(135deg, #dc2626, #b91c1c)",
                      color: "#fff",
                      boxShadow: m.isLocked
                        ? "0 0 14px rgba(0,200,80,0.2)"
                        : "0 0 14px rgba(239,68,68,0.2)",
                    }}
                  >
                    {m.isLocked ? "🔓 Unlock" : "🔒 Lock"}
                  </button>

                  <button
                    className="admin-btn"
                    disabled={completingMatch[m.id]}
                    onClick={async () => {
                      if (!confirm("Complete this match and calculate scores?"))
                        return;
                      try {
                        setCompletingMatch((p) => ({ ...p, [m.id]: true }));
                        await api.patch(
                          `/admin/matches/${m.id}/complete`,
                          {},
                          {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                          },
                        );
                        alert("Match completed & scores calculated!");
                        loadMatches();
                      } catch (err) {
                        console.error(err);
                        alert("Failed to complete match");
                      } finally {
                        setCompletingMatch((p) => ({ ...p, [m.id]: false }));
                      }
                    }}
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                      color: "#fff",
                      boxShadow: "0 0 14px rgba(124,58,237,0.2)",
                      opacity: completingMatch[m.id] ? 0.6 : 1,
                    }}
                  >
                    {completingMatch[m.id] ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Processing…</span>
                      </>
                    ) : (
                      <>
                        <span>🏁</span>
                        <span>Complete Match</span>
                      </>
                    )}
                  </button>
                  <button
                    className="admin-btn"
                    onClick={async () => {
                      if (
                        !confirm(
                          "Are you sure you want to delete this match?\n\nThis action cannot be undone.",
                        )
                      )
                        return;

                      try {
                        await api.delete(`/admin/matches/${m.id}`, {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                          },
                        });

                        alert("Match deleted successfully!");

                        loadMatches();
                      } catch (err) {
                        console.error(err);
                        alert("Failed to delete match");
                      }
                    }}
                    style={{
                      background: "linear-gradient(135deg, #dc2626, #991b1b)",
                      color: "#fff",
                      boxShadow: "0 0 14px rgba(220,38,38,0.2)",
                    }}
                  >
                    <span>🗑️</span>
                    <span>Delete Match</span>
                  </button>
                </div>

                {/* ── Expanded Questions ── */}
                {expandedMatchId === m.id &&
                  matchDetails[m.id]?.questions?.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="mt-4 rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        animation: `fadeUp 0.3s ease ${qIdx * 0.06}s both`,
                      }}
                    >
                      {/* Q header */}
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                            style={{
                              background: "rgba(168,85,247,0.16)",
                              border: "1px solid rgba(168,85,247,0.25)",
                              color: "#c084fc",
                              fontFamily: "'Rajdhani', sans-serif",
                            }}
                          >
                            {qIdx + 1}
                          </span>
                          <h3 className="font-bold text-sm text-white">
                            {q.text}
                          </h3>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest"
                            style={{
                              background:
                                q.type === "OPTION"
                                  ? "rgba(59,130,246,0.12)"
                                  : q.type === "SCORE"
                                    ? "rgba(255,215,0,0.1)"
                                    : "rgba(168,85,247,0.1)",
                              border: `1px solid ${q.type === "OPTION" ? "rgba(59,130,246,0.25)" : q.type === "SCORE" ? "rgba(255,215,0,0.2)" : "rgba(168,85,247,0.2)"}`,
                              color:
                                q.type === "OPTION"
                                  ? "#60a5fa"
                                  : q.type === "SCORE"
                                    ? "#ffd700"
                                    : "#c084fc",
                              fontFamily: "'Rajdhani', sans-serif",
                            }}
                          >
                            {q.type}
                          </span>
                        </div>
                      </div>

                      <div className="px-4 py-4">
                        {/* SCORE */}
                        {q.type === "SCORE" && (
                          <div
                            className="p-4 rounded-xl max-w-md"
                            style={{
                              background: "rgba(255,215,0,0.04)",
                              border: "1px solid rgba(255,215,0,0.12)",
                            }}
                          >
                            <p className="text-xs font-black uppercase tracking-widest text-yellow-500/60 mb-3">
                              🏆 Set Official Result
                            </p>
                            <p
                              className="font-bold text-sm text-white mb-4"
                              style={{
                                fontFamily: "'Rajdhani', sans-serif",
                              }}
                            >
                              {m.teamA.name}{" "}
                              <span className="text-gray-500 font-normal">
                                vs
                              </span>{" "}
                              {m.teamB.name}
                            </p>
                            <div className="flex items-end gap-3">
                              <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">
                                  {m.teamA.name}
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="w-20 px-3 py-2.5 rounded-xl font-mono text-center text-white text-xl font-black"
                                  style={{
                                    background: "rgba(0,0,0,0.45)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    outline: "none",
                                    fontFamily: "'Rajdhani', sans-serif",
                                  }}
                                  value={optionInputs[`scoreA_${q.id}`] ?? ""}
                                  onChange={(e) =>
                                    setOptionInputs((p) => ({
                                      ...p,
                                      [`scoreA_${q.id}`]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div
                                className="text-xl font-black text-gray-600 pb-2"
                                style={{
                                  fontFamily: "'Rajdhani', sans-serif",
                                }}
                              >
                                —
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">
                                  {m.teamB.name}
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="w-20 px-3 py-2.5 rounded-xl font-mono text-center text-white text-xl font-black"
                                  style={{
                                    background: "rgba(0,0,0,0.45)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    outline: "none",
                                    fontFamily: "'Rajdhani', sans-serif",
                                  }}
                                  value={optionInputs[`scoreB_${q.id}`] ?? ""}
                                  onChange={(e) =>
                                    setOptionInputs((p) => ({
                                      ...p,
                                      [`scoreB_${q.id}`]: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <button
                                className="admin-btn ml-2"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #16a34a, #15803d)",
                                  color: "#fff",
                                  boxShadow: "0 0 12px rgba(0,200,80,0.2)",
                                }}
                                onClick={async () => {
                                  try {
                                    const valA =
                                      optionInputs[`scoreA_${q.id}`] || "0";
                                    const valB =
                                      optionInputs[`scoreB_${q.id}`] || "0";
                                    await api.patch(
                                      `/questions/${q.id}/correct-text`,
                                      { answer: `${valA}-${valB}` },
                                      {
                                        headers: {
                                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                                        },
                                      },
                                    );
                                    loadMatchDetails(m.id);
                                  } catch (err) {
                                    console.error(
                                      "Failed saving final score:",
                                      err,
                                    );
                                  }
                                }}
                              >
                                💾 Save
                              </button>
                            </div>
                            {q.correctTextAnswer && (
                              <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold pt-3 border-t border-white/5">
                                <span>✅ Verified:</span>
                                <span
                                  className="px-2.5 py-0.5 rounded-lg font-mono text-sm"
                                  style={{
                                    background: "rgba(0,200,80,0.1)",
                                    border: "1px solid rgba(0,200,80,0.2)",
                                  }}
                                >
                                  {q.correctTextAnswer}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* OPTION / MULTI_SELECT */}
                        {q.type === "OPTION" && (
                          <>
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
                              Options
                            </p>
                            {q.options?.length > 0 ? (
                              <div className="space-y-2 mb-4">
                                {q.options.map((o) => (
                                  <div
                                    key={o.id}
                                    className="flex items-center gap-2 flex-wrap"
                                  >
                                    <div
                                      className="flex-1 min-w-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                                      style={{
                                        background: o.isCorrect
                                          ? "rgba(0,200,80,0.08)"
                                          : "rgba(255,255,255,0.04)",
                                        border: `1px solid ${o.isCorrect ? "rgba(0,200,80,0.3)" : "rgba(255,255,255,0.07)"}`,
                                        color: o.isCorrect
                                          ? "#00c850"
                                          : "#94a3b8",
                                      }}
                                    >
                                      <span>{o.isCorrect ? "✔" : "•"}</span>
                                      <span className="truncate">{o.text}</span>
                                      {o.isCorrect && (
                                        <span className="ml-auto text-xs font-black text-green-400 uppercase tracking-widest">
                                          Correct
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      className="admin-btn"
                                      style={{
                                        background: "rgba(255,215,0,0.1)",
                                        border:
                                          "1px solid rgba(255,215,0,0.25)",
                                        color: "#ffd700",
                                        padding: "7px 10px",
                                      }}
                                      onClick={async () => {
                                        try {
                                          const ep = `/options/${o.id}/correct`;
                                          await api.patch(
                                            ep,
                                            {},
                                            {
                                              headers: {
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                              },
                                            },
                                          );
                                          loadMatchDetails(m.id);
                                        } catch (err) {
                                          console.error(err);
                                        }
                                      }}
                                    >
                                      ✓ Correct
                                    </button>
                                    <button
                                      className="admin-btn"
                                      style={{
                                        background: "rgba(239,68,68,0.1)",
                                        border: "1px solid rgba(239,68,68,0.2)",
                                        color: "#f87171",
                                        padding: "7px 10px",
                                      }}
                                      onClick={async () => {
                                        if (!confirm("Delete option?")) return;
                                        try {
                                          await api.delete(`/options/${o.id}`, {
                                            headers: {
                                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                                            },
                                          });
                                          loadMatchDetails(m.id);
                                        } catch (err) {
                                          console.error(err);
                                        }
                                      }}
                                    >
                                      🗑
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-600 mb-3 italic">
                                No options added yet
                              </p>
                            )}

                            {/* Add Option */}
                            <div className="flex gap-2 flex-wrap">
                              <input
                                style={{
                                  ...inputBase,
                                  width: "auto",
                                  flex: "1 1 160px",
                                }}
                                placeholder="New option text…"
                                value={optionInputs[q.id] || ""}
                                onChange={(e) =>
                                  setOptionInputs({
                                    ...optionInputs,
                                    [q.id]: e.target.value,
                                  })
                                }
                                onFocus={focusInput}
                                onBlur={blurInput}
                              />
                              <button
                                className="admin-btn"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #16a34a, #15803d)",
                                  color: "#fff",
                                  boxShadow: "0 0 12px rgba(0,200,80,0.18)",
                                }}
                                onClick={async () => {
                                  try {
                                    await api.post(
                                      "/options",
                                      {
                                        questionId: q.id,
                                        text: optionInputs[q.id],
                                      },
                                      {
                                        headers: {
                                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                                        },
                                      },
                                    );
                                    setOptionInputs({
                                      ...optionInputs,
                                      [q.id]: "",
                                    });
                                    loadMatchDetails(m.id);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                              >
                                ✚ Add Option
                              </button>
                            </div>
                          </>
                        )}
                        {q.type === "MULTI_SELECT" && (
                          <AdminMultiSelectScorers
                            q={q}
                            m={m}
                            api={api}
                            loadMatchDetails={loadMatchDetails}
                          />
                        )}

                        {/* TEXT */}
                        {q.type === "TEXT" && (
                          <div className="mt-2">
                            {!q.correctTextAnswer || editingTextAnswer[q.id] ? (
                              <div className="flex gap-2 flex-wrap">
                                <input
                                  style={{
                                    ...inputBase,
                                    width: "auto",
                                    flex: "1 1 160px",
                                  }}
                                  placeholder="Correct answer…"
                                  value={
                                    optionInputs["correct_" + q.id] ||
                                    q.correctTextAnswer ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    setOptionInputs({
                                      ...optionInputs,
                                      ["correct_" + q.id]: e.target.value,
                                    })
                                  }
                                  onFocus={focusInput}
                                  onBlur={blurInput}
                                />
                                <button
                                  className="admin-btn"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #ca8a04, #a16207)",
                                    color: "#fff",
                                    boxShadow: "0 0 12px rgba(255,215,0,0.18)",
                                  }}
                                  onClick={async () => {
                                    try {
                                      await api.patch(
                                        `/questions/${q.id}/correct-text`,
                                        {
                                          answer:
                                            optionInputs["correct_" + q.id],
                                        },
                                        {
                                          headers: {
                                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                                          },
                                        },
                                      );
                                      setEditingTextAnswer({
                                        ...editingTextAnswer,
                                        [q.id]: false,
                                      });
                                      setOptionInputs({
                                        ...optionInputs,
                                        ["correct_" + q.id]: "",
                                      });
                                      loadMatchDetails(m.id);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                >
                                  {q.correctTextAnswer
                                    ? "💾 Update"
                                    : "✓ Set Answer"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 flex-wrap">
                                <div
                                  className="px-4 py-2.5 rounded-xl text-green-400 font-semibold text-sm"
                                  style={{
                                    background: "rgba(0,200,80,0.08)",
                                    border: "1px solid rgba(0,200,80,0.25)",
                                  }}
                                >
                                  ✅ {q.correctTextAnswer}
                                </div>
                                <button
                                  className="admin-btn"
                                  style={{
                                    background: "rgba(255,215,0,0.1)",
                                    border: "1px solid rgba(255,215,0,0.25)",
                                    color: "#ffd700",
                                  }}
                                  onClick={() =>
                                    setEditingTextAnswer({
                                      ...editingTextAnswer,
                                      [q.id]: true,
                                    })
                                  }
                                >
                                  ✏ Update
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Add Question inline */}
                {expandedMatchId === m.id && (
                  <div
                    className="mt-5 p-4 rounded-2xl"
                    style={{
                      background: "rgba(0,200,80,0.04)",
                      border: "1px solid rgba(0,200,80,0.12)",
                    }}
                  >
                    <p
                      className="text-xs font-black uppercase tracking-widest text-green-400/60 mb-3"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      + Add Question to Match
                    </p>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="flex-1 min-w-[180px]">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                          Question Text
                        </label>
                        <input
                          style={inputBase}
                          placeholder="Question text…"
                          value={newQuestions[m.id]?.text || ""}
                          onChange={(e) =>
                            setNewQuestions((p) => ({
                              ...p,
                              [m.id]: { ...p[m.id], text: e.target.value },
                            }))
                          }
                          onFocus={focusInput}
                          onBlur={blurInput}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                          Type
                        </label>
                        <select
                          style={{ ...inputBase, width: "auto" }}
                          value={newQuestions[m.id]?.type || "OPTION"}
                          onChange={(e) =>
                            setNewQuestions((p) => ({
                              ...p,
                              [m.id]: { ...p[m.id], type: e.target.value },
                            }))
                          }
                          onFocus={focusInput}
                          onBlur={blurInput}
                        >
                          {["OPTION", "MULTI_SELECT", "SCORE", "TEXT"].map(
                            (t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <button
                        className="admin-btn"
                        style={{
                          background:
                            "linear-gradient(135deg, #16a34a, #15803d)",
                          color: "#fff",
                          boxShadow: "0 0 12px rgba(0,200,80,0.2)",
                        }}
                        onClick={async () => {
                          const q = newQuestions[m.id];
                          if (!q?.text) return;
                          try {
                            await api.post(
                              "/questions",
                              {
                                text: q.text,
                                type: q.type || "OPTION",
                                matchId: m.id,
                              },
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                              },
                            );
                            setNewQuestions((p) => ({ ...p, [m.id]: {} }));
                            loadMatchDetails(m.id);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        ➕ Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {matches.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 animate-bounce">🏟️</div>
              <p className="text-gray-600 text-xs uppercase tracking-widest font-bold">
                No fixtures yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
