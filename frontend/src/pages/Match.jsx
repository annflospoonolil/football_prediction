import { useEffect, useState } from "react";
import { api } from "../services/api";
import Select from "react-select";

export default function Match({ matchId, goBack }) {
  console.log("MATCH ID RECEIVED:", matchId);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [selectedOption, setSelectedOption] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedMultiOptions, setSelectedMultiOptions] = useState({});
  const [scorePredictions, setScorePredictions] = useState({});
  const [textAnswers, setTextAnswers] = useState({});

  useEffect(() => {
    if (!matchId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const matchRes = await api.get(`/matches/${matchId}`);
        setMatch(matchRes.data);
        console.log("MATCH DATA:", matchRes.data);
        const answerRes = await api.get(`/answers/match/${matchId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (answerRes.data.length === matchRes.data.questions.length) {
          setSubmitted(true);
        }
        console.log("USER ANSWERS:", answerRes.data);
        const optionMap = {};
        const textMap = {};
        const multiMap = {};
        const scoreMap = {};
        answerRes.data.forEach((a) => {
          if (a.optionId) optionMap[a.questionId] = a.optionId;
          if (a.textAnswer) textMap[a.questionId] = a.textAnswer;
          if (a.selectedOptions && Array.isArray(a.selectedOptions))
            multiMap[a.questionId] = a.selectedOptions;
          if (a.question?.type === "SCORE" && a.textAnswer) {
            const [teamA, teamB] = a.textAnswer.split("-");
            scoreMap[a.questionId] = {
              teamA: teamA || "0",
              teamB: teamB || "0",
            };
          }
        });
        setSelectedOption(optionMap);
        setTextAnswers(textMap);
        setSelectedMultiOptions(multiMap);
        setScorePredictions(scoreMap);
      } catch (err) {
        console.error("API ERROR:", err);
        setError("Failed to load match");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [matchId]);

  const getActiveScoreLimit = () => {
    const scoreQuestion = match?.questions?.find((q) => q.type === "SCORE");
    if (!scoreQuestion) return { teamA: 99, teamB: 99 };
    const prediction = scorePredictions[scoreQuestion.id];
    return {
      teamA: parseInt(prediction?.teamA, 10) || 0,
      teamB: parseInt(prediction?.teamB, 10) || 0,
    };
  };

  /* ── Loading ── */
  if (loading)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "#060810" }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');`}</style>
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full border-2 animate-spin"
            style={{
              borderColor: "rgba(0,200,80,0.2)",
              borderTopColor: "#00c850",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            ⚽
          </div>
        </div>
        <div className="text-center">
          <p
            className="text-green-400 text-sm font-black tracking-[0.2em] uppercase animate-pulse"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Loading Match
          </p>
          <p className="text-gray-600 text-xs mt-1">Fetching match data…</p>
        </div>
      </div>
    );

  /* ── Error ── */
  if (error)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "#060810" }}
      >
        <div className="text-6xl">🚫</div>
        <p className="text-red-400 font-bold">{error}</p>
        <button
          onClick={goBack}
          className="px-6 py-3 rounded-full text-xs font-black tracking-widest uppercase text-white"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          ← Back
        </button>
      </div>
    );

  /* ── No match ── */
  if (!match)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "#060810" }}
      >
        <div className="text-6xl">🔍</div>
        <p className="text-gray-400">No match found</p>
        <button
          onClick={goBack}
          className="px-6 py-3 rounded-full text-xs font-black tracking-widest uppercase text-white"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          ← Back
        </button>
      </div>
    );

  const matchStarted = new Date(match.kickoffAt) <= new Date();
  const limits = getActiveScoreLimit();

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: "#060810", fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .q-card { animation: fadeSlideUp 0.45s ease both; }
        .opt-btn {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .opt-btn:hover:not(:disabled) { transform: translateX(4px); }
        .opt-btn::before {
          content: '';
          position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          transition: left 0.4s ease;
        }
        .opt-btn:hover::before { left: 100%; }
        .score-input:focus { outline: none; border-color: rgba(0,200,80,0.6) !important; box-shadow: 0 0 16px rgba(0,200,80,0.15); }
        .submit-btn {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.01); filter: brightness(1.1); }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,200,80,0.35); border-radius: 2px; }
        .player-btn { transition: all 0.15s ease; }
        .player-btn:hover:not(:disabled) { transform: scale(1.01); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-72"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(0,200,80,0.06) 0%, transparent 70%)",
          }}
        />
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.025 }}
        >
          <defs>
            <pattern
              id="matchGrid"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="60"
                height="60"
                fill="none"
                stroke="#00c850"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#matchGrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-20">
        {/* ── Back ── */}
        <div className="pt-6 mb-7">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-[0.15em] uppercase text-green-400"
            style={{
              background: "rgba(0,200,80,0.06)",
              border: "1px solid rgba(0,200,80,0.2)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,200,80,0.12)";
              e.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,200,80,0.06)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span>◀</span>
            <span>All Matches</span>
          </button>
        </div>

        {/* ── Match Scoreboard Header ── */}
        <div
          className="relative rounded-3xl mb-8 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "fadeSlideUp 0.5s ease both",
          }}
        >
          {/* Accent bar */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, #00c850, #00e5ff, #ffd700, #00c850)",
              backgroundSize: "200%",
              animation: "shimmer 4s linear infinite",
            }}
          />

          <div className="p-6 sm:p-8">
            {/* Match badge */}
            <div className="flex justify-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.2)",
                  color: "#ffd700",
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                🏆 Match Prediction
              </div>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between gap-4">
              {/* Team A */}
              <div className="flex-1 text-center">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl font-black"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,200,80,0.25), rgba(0,200,80,0.04))",
                    border: "2px solid rgba(0,200,80,0.35)",
                    color: "#00c850",
                    fontFamily: "'Rajdhani ', sans-serif",
                    boxShadow: "0 0 30px rgba(0,200,80,0.15)",
                  }}
                >
                  {match.teamA.name?.charAt(0) ?? "A"}
                </div>
                <h2
                  className="font-black text-base sm:text-xl text-white tracking-wide"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {match.teamA.name}
                </h2>
                <span
                  className="inline-block text-xs font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full"
                  style={{
                    color: "#00c850",
                    background: "rgba(0,200,80,0.08)",
                    border: "1px solid rgba(0,200,80,0.2)",
                  }}
                >
                  Home
                </span>
              </div>

              {/* Center */}
              <div className="flex flex-col items-center gap-2 px-2">
                <div
                  className="px-4 py-2.5 rounded-2xl"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    className="text-2xl sm:text-3xl font-black tracking-widest text-white/80"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    VS
                  </p>
                </div>
                {match.kickoffAt && (
                  <p className="text-[10px] text-gray-500 font-bold text-center">
                    ⏰{" "}
                    {new Date(match.kickoffAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {/* Team B */}
              <div className="flex-1 text-center">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl font-black"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,150,255,0.25), rgba(0,150,255,0.04))",
                    border: "2px solid rgba(0,150,255,0.35)",
                    color: "#60a5fa",
                    fontFamily: "'Rajdhani', sans-serif",
                    boxShadow: "0 0 30px rgba(0,150,255,0.15)",
                  }}
                >
                  {match.teamB.name?.charAt(0) ?? "B"}
                </div>
                <h2
                  className="font-black text-base sm:text-xl text-white tracking-wide"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {match.teamB.name}
                </h2>
                <span
                  className="inline-block text-xs font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full"
                  style={{
                    color: "#60a5fa",
                    background: "rgba(0,150,255,0.08)",
                    border: "1px solid rgba(0,150,255,0.2)",
                  }}
                >
                  Away
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Questions or Locked ── */}
        {matchStarted ? (
          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="text-6xl mb-4">⛔</div>
            <h2
              className="text-3xl font-black text-red-400 mb-2"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              Match Started
            </h2>
            <p className="text-gray-400 text-sm">
              Predictions are closed for this match.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Progress bar */}
            {match.questions?.length > 0 && (
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                  {match.questions.length} Question
                  {match.questions.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-1">
                  {match.questions.map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-1 rounded-full"
                      style={{ background: "rgba(0,200,80,0.3)" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {match.questions?.map((q, qIdx) => (
              <div
                key={q.id}
                className="q-card relative rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                  animationDelay: qIdx * 0.07 + "s",
                }}
              >
                {/* Left accent */}
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{
                    background:
                      q.type === "SCORE"
                        ? "linear-gradient(to bottom, #ffd700, #f97316)"
                        : q.type === "MULTI_SELECT"
                          ? "linear-gradient(to bottom, #a855f7, #6366f1)"
                          : "linear-gradient(to bottom, #00c850, #00e5ff)",
                  }}
                />

                <div className="pl-6 pr-5 py-5">
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-5">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{
                        background: "rgba(0,200,80,0.1)",
                        border: "1px solid rgba(0,200,80,0.2)",
                        color: "#00c850",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {qIdx + 1}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-sm sm:text-base text-white leading-snug">
                        {q.text ?? ""}
                      </h2>
                      <span
                        className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
                        style={{
                          background:
                            q.type === "SCORE"
                              ? "rgba(255,215,0,0.1)"
                              : q.type === "MULTI_SELECT"
                                ? "rgba(168,85,247,0.1)"
                                : "rgba(0,200,80,0.1)",
                          border: `1px solid ${q.type === "SCORE" ? "rgba(255,215,0,0.25)" : q.type === "MULTI_SELECT" ? "rgba(168,85,247,0.25)" : "rgba(0,200,80,0.25)"}`,
                          color:
                            q.type === "SCORE"
                              ? "#ffd700"
                              : q.type === "MULTI_SELECT"
                                ? "#c084fc"
                                : "#00c850",
                        }}
                      >
                        {q.type}
                      </span>
                    </div>
                  </div>

                  {/* ── SCORE TYPE ── */}
                  {q.type === "SCORE" && (
                    <div
                      className="rounded-2xl p-4"
                      style={{
                        background: "rgba(255,215,0,0.04)",
                        border: "1px solid rgba(255,215,0,0.12)",
                      }}
                    >
                      <p className="text-xs font-black uppercase tracking-widest text-yellow-500/70 mb-4 text-center">
                        Enter Your Score Prediction
                      </p>
                      <div className="grid grid-cols-3 gap-3 items-center">
                        <div className="text-center">
                          <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">
                            {match.teamA.name}
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="score-input w-full p-3 rounded-xl text-center text-2xl font-black text-white"
                            style={{
                              background: "rgba(0,0,0,0.4)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              fontFamily: "'Rajdhani', sans-serif",
                            }}
                            value={scorePredictions[q.id]?.teamA || ""}
                            onChange={(e) =>
                              setScorePredictions({
                                ...scorePredictions,
                                [q.id]: {
                                  ...scorePredictions[q.id],
                                  teamA: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div
                          className="text-center text-gray-500 font-black text-xl"
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          —
                        </div>
                        <div className="text-center">
                          <label className="block text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">
                            {match.teamB.name}
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="score-input w-full p-3 rounded-xl text-center text-2xl font-black text-white"
                            style={{
                              background: "rgba(0,0,0,0.4)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              fontFamily: "'Rajdhani', sans-serif",
                            }}
                            value={scorePredictions[q.id]?.teamB || ""}
                            onChange={(e) =>
                              setScorePredictions({
                                ...scorePredictions,
                                [q.id]: {
                                  ...scorePredictions[q.id],
                                  teamB: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                      {scorePredictions[q.id]?.teamA !== undefined &&
                        scorePredictions[q.id]?.teamB !== undefined && (
                          <p className="text-center text-xs text-yellow-400/70 mt-3 font-bold">
                            Your prediction: {scorePredictions[q.id].teamA || 0}{" "}
                            – {scorePredictions[q.id].teamB || 0}
                          </p>
                        )}
                    </div>
                  )}

                  {/* ── OPTION TYPE ── */}
                  {q.type === "OPTION" &&
                    (q.template === "MOTM" ? (
                      <div className="space-y-2">
                        <Select
                          isSearchable
                          placeholder="🔍 Search player..."
                          options={q.options.map((opt) => ({
                            value: opt.id,
                            label: opt.text,
                          }))}
                          value={
                            q.options
                              .filter((o) => selectedOption[q.id] === o.id)
                              .map((o) => ({
                                value: o.id,
                                label: o.text,
                              }))[0] || null
                          }
                          onChange={(selected) =>
                            setSelectedOption((prev) => ({
                              ...prev,
                              [q.id]: selected?.value,
                            }))
                          }
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 9999,
                            }),
                            control: (base) => ({
                              ...base,
                              background: "#111827",
                              borderColor: "#374151",
                              color: "#fff",
                              minHeight: "48px",
                            }),
                            singleValue: (base) => ({
                              ...base,
                              color: "#fff",
                            }),
                            input: (base) => ({
                              ...base,
                              color: "#fff",
                            }),
                            placeholder: (base) => ({
                              ...base,
                              color: "#9ca3af",
                            }),
                            menu: (base) => ({
                              ...base,
                              background: "#111827",
                              border: "1px solid #374151",
                            }),
                            option: (base, state) => ({
                              ...base,
                              background: state.isFocused
                                ? "#1f2937"
                                : "#111827",
                              color: "#fff",
                              cursor: "pointer",
                            }),
                          }}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {q.options?.map((opt) => {
                          const isSelected = selectedOption[q.id] === opt.id;
                          return (
                            <button
                              disabled={match.isLocked}
                              key={opt.id}
                              onClick={() =>
                                setSelectedOption((prev) => ({
                                  ...prev,
                                  [q.id]: opt.id,
                                }))
                              }
                              className="opt-btn block w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold border"
                              style={{
                                background: isSelected
                                  ? "rgba(0,200,80,0.14)"
                                  : "rgba(255,255,255,0.03)",
                                borderColor: isSelected
                                  ? "rgba(0,200,80,0.5)"
                                  : "rgba(255,255,255,0.07)",
                                color: isSelected ? "#00c850" : "#94a3b8",
                                boxShadow: isSelected
                                  ? "0 0 16px rgba(0,200,80,0.15), inset 0 0 0 1px rgba(0,200,80,0.15)"
                                  : "none",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2"
                                  style={{
                                    borderColor: isSelected
                                      ? "#00c850"
                                      : "rgba(255,255,255,0.2)",
                                    background: isSelected
                                      ? "#00c850"
                                      : "transparent",
                                  }}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                  )}
                                </div>
                                <span>{opt.text}</span>
                                {isSelected && (
                                  <span className="ml-auto text-xs font-black uppercase tracking-widest text-green-400">
                                    ✓ Selected
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}

                  {/* ── MULTI_SELECT TYPE ── */}
                  {q.type === "MULTI_SELECT" &&
                    (() => {
                      const selected = selectedMultiOptions[q.id] || [];
                      const totalOptions = q.options || [];
                      const usesTeamId = totalOptions[0]?.teamId !== undefined;
                      const teamAIdToken = usesTeamId
                        ? totalOptions[0]?.teamId
                        : null;
                      const isPlayerFromTeamA = (opt, index) =>
                        usesTeamId ? opt.teamId === teamAIdToken : index < 26;
                      const teamAOptions = [],
                        teamBOptions = [];
                      totalOptions.forEach((opt, idx) => {
                        (isPlayerFromTeamA(opt, idx)
                          ? teamAOptions
                          : teamBOptions
                        ).push({ opt, globalIndex: idx });
                      });
                      const countA = selected.filter((id) => {
                        const i = totalOptions.findIndex((o) => o.id === id);
                        return (
                          i !== -1 && isPlayerFromTeamA(totalOptions[i], i)
                        );
                      }).length;
                      const countB = selected.filter((id) => {
                        const i = totalOptions.findIndex((o) => o.id === id);
                        return (
                          i !== -1 && !isPlayerFromTeamA(totalOptions[i], i)
                        );
                      }).length;

                      const renderPlayerButton = (opt, index) => {
                        const isChecked = selected.includes(opt.id);
                        const isTeamA = isPlayerFromTeamA(opt, index);
                        const reachedLimit =
                          (isTeamA && countA >= limits.teamA && !isChecked) ||
                          (!isTeamA && countB >= limits.teamB && !isChecked);
                        return (
                          <button
                            key={opt.id}
                            disabled={
                              match.isLocked || (reachedLimit && !isChecked)
                            }
                            onClick={() => {
                              if (match.isLocked) return;
                              let updated;
                              if (isChecked) {
                                updated = selected.filter(
                                  (id) => id !== opt.id,
                                );
                              } else {
                                if (reachedLimit) return;
                                updated = [...selected, opt.id];
                              }
                              setSelectedMultiOptions((prev) => ({
                                ...prev,
                                [q.id]: updated,
                              }));
                            }}
                            className="player-btn block w-full text-left px-3 py-2.5 rounded-xl border"
                            style={{
                              background: isChecked
                                ? "rgba(0,200,80,0.1)"
                                : reachedLimit
                                  ? "rgba(255,255,255,0.01)"
                                  : "rgba(255,255,255,0.03)",
                              borderColor: isChecked
                                ? "rgba(0,200,80,0.4)"
                                : reachedLimit
                                  ? "rgba(255,255,255,0.03)"
                                  : "rgba(255,255,255,0.07)",
                              cursor:
                                reachedLimit && !isChecked
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: reachedLimit && !isChecked ? 0.3 : 1,
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border"
                                style={{
                                  borderColor: isChecked
                                    ? "#00c850"
                                    : "rgba(255,255,255,0.2)",
                                  background: isChecked
                                    ? "#00c850"
                                    : "transparent",
                                }}
                              >
                                {isChecked && (
                                  <span className="text-black text-[9px] font-black">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <span
                                className="text-xs font-semibold"
                                style={{
                                  color: isChecked
                                    ? "#e2e8f0"
                                    : reachedLimit
                                      ? "#475569"
                                      : "#94a3b8",
                                }}
                              >
                                {opt.text}
                              </span>
                              {isChecked && (
                                <span className="ml-auto text-green-400 text-[9px] font-black uppercase tracking-wider">
                                  Picked
                                </span>
                              )}
                              {reachedLimit && !isChecked && (
                                <span className="ml-auto text-gray-600 text-[9px] italic">
                                  Maxed
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      };

                      return (
                        <div className="space-y-4">
                          {/* Tracker */}
                          <div
                            className="flex flex-wrap gap-3 text-xs font-black tracking-wide py-2 px-3 rounded-xl"
                            style={{
                              background: "rgba(0,0,0,0.2)",
                              border: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <span
                              className={
                                countA >= limits.teamA
                                  ? "text-green-400"
                                  : "text-gray-500"
                              }
                            >
                              🟢 {match.teamA.name}: {countA}/{limits.teamA}
                            </span>
                            <span
                              className={
                                countB >= limits.teamB
                                  ? "text-blue-400"
                                  : "text-gray-500"
                              }
                            >
                              🔵 {match.teamB.name}: {countB}/{limits.teamB}
                            </span>
                          </div>
                          {/* Two columns */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              className="rounded-2xl p-3"
                              style={{
                                background: "rgba(0,200,80,0.04)",
                                border: "1px solid rgba(0,200,80,0.12)",
                              }}
                            >
                              <div className="flex justify-between items-center mb-2.5 px-1">
                                <span
                                  className="text-[11px] font-black uppercase tracking-widest text-green-400"
                                  style={{
                                    fontFamily: "'Rajdhani', sans-serif",
                                  }}
                                >
                                  {match.teamA.name}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold">
                                  {countA}/{limits.teamA}
                                </span>
                              </div>
                              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                {teamAOptions.map(({ opt, globalIndex }) =>
                                  renderPlayerButton(opt, globalIndex),
                                )}
                                {teamAOptions.length === 0 && (
                                  <p className="text-xs text-gray-600 text-center py-4 italic">
                                    No players
                                  </p>
                                )}
                              </div>
                            </div>
                            <div
                              className="rounded-2xl p-3"
                              style={{
                                background: "rgba(0,150,255,0.04)",
                                border: "1px solid rgba(0,150,255,0.12)",
                              }}
                            >
                              <div className="flex justify-between items-center mb-2.5 px-1">
                                <span
                                  className="text-[11px] font-black uppercase tracking-widest text-blue-400"
                                  style={{
                                    fontFamily: "'Rajdhani', sans-serif",
                                  }}
                                >
                                  {match.teamB.name}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold">
                                  {countB}/{limits.teamB}
                                </span>
                              </div>
                              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                {teamBOptions.map(({ opt, globalIndex }) =>
                                  renderPlayerButton(opt, globalIndex),
                                )}
                                {teamBOptions.length === 0 && (
                                  <p className="text-xs text-gray-600 text-center py-4 italic">
                                    No players
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  {/* ── TEXT TYPE ── */}
                  {q.type === "TEXT" && (
                    <input
                      value={textAnswers[q.id] || ""}
                      onChange={(e) =>
                        setTextAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value,
                        }))
                      }
                      className="score-input w-full px-4 py-3 rounded-xl text-white text-sm"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        border: "1px solid rgba(255,255,255,0.09)",
                      }}
                      placeholder="Enter your answer…"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* ── Submit ── */}
            <div className="mt-8 max-w-2xl mx-auto">
              {submitted ? (
                <div
                  className="text-center py-6 rounded-2xl"
                  style={{
                    background: "rgba(0,200,80,0.08)",
                    border: "1px solid rgba(0,200,80,0.25)",
                  }}
                >
                  <div className="text-4xl mb-2">✅</div>
                  <p
                    className="text-green-400 font-black tracking-wide text-sm"
                    style={{ fontFamily: "'Rajdhani', sans-serif" }}
                  >
                    Predictions Submitted!
                  </p>
                </div>
              ) : (
                <button
                  disabled={match.isLocked || submitting || submitted}
                  className="submit-btn w-full py-5 rounded-2xl text-white font-black text-lg tracking-wider disabled:opacity-40"
                  style={{
                    background: match.isLocked
                      ? "rgba(80,80,100,0.3)"
                      : "linear-gradient(135deg, #00c850, #00a040)",
                    boxShadow: match.isLocked
                      ? "none"
                      : "0 8px 30px rgba(0,200,80,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                    fontFamily: "'Rajdhani', sans-serif",
                    letterSpacing: "0.1em",
                    border: match.isLocked
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "none",
                  }}
                  onClick={async () => {
                    try {
                      setSubmitting(true);
                      for (const q of match.questions) {
                        if (q.type === "OPTION")
                          await api.post("/answers", {
                            questionId: q.id,
                            optionId: selectedOption[q.id],
                          });
                        if (q.type === "MULTI_SELECT")
                          await api.post("/answers", {
                            questionId: q.id,
                            selectedOptions: selectedMultiOptions[q.id] || [],
                          });
                        if (q.type === "TEXT")
                          await api.post("/answers", {
                            questionId: q.id,
                            textAnswer: textAnswers[q.id] || "",
                          });
                        if (q.type === "SCORE") {
                          const prediction = scorePredictions[q.id];
                          await api.post("/answers", {
                            questionId: q.id,
                            textAnswer: `${prediction?.teamA || 0}-${prediction?.teamB || 0}`,
                          });
                        }
                      }
                      setSubmitted(true);
                    } catch (err) {
                      console.error(err);
                      alert("Failed to submit predictions");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2 justify-center">
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                      <span>Submitting…</span>
                    </span>
                  ) : (
                    <span>⚽ Submit All Predictions</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
