import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Match({ matchId, goBack }) {
  console.log("MATCH ID RECEIVED:", matchId);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 🗳️ STORE SELECTED OPTION PER QUESTION
  const [selectedOption, setSelectedOption] = useState({});

  useEffect(() => {
    if (!matchId) return;
    console.log("MATCH ID:", matchId);
    setLoading(true);
    setError(null);
    api
      .get(`/matches/${matchId}`)
      .then((res) => {
        console.log("MATCH DATA:", res.data);
        setMatch(res.data);
      })
      .catch((err) => {
        console.error("API ERROR:", err);
        setError("Failed to load match");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [matchId]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f] text-white flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-green-500/20 border-t-green-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            ⚽
          </div>
        </div>
        <div className="text-center">
          <p className="text-green-400 text-sm font-bold tracking-widest uppercase animate-pulse">
            Loading Match
          </p>
          <p className="text-gray-600 text-xs mt-1">Fetching match data…</p>
        </div>
        <style>{`
          @keyframes floatBall {
            0%,100%{transform:translateY(0) rotate(0deg);}
            50%{transform:translateY(-12px) rotate(180deg);}
          }
        `}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#07090f] text-white p-6 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🚫</div>
        <p className="text-red-400 font-bold">{error}</p>
        <button
          onClick={goBack}
          className="mt-2 px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase text-white"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          ← Back to Matches
        </button>
      </div>
    );
  }

  /* ── No match ── */
  if (!match) {
    return (
      <div className="min-h-screen bg-[#07090f] text-white p-6 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔍</div>
        <p className="text-gray-400">No match found</p>
        <button
          onClick={goBack}
          className="mt-2 px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase text-white"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          ← Back to Matches
        </button>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="min-h-screen bg-[#07090f] text-white overflow-x-hidden">
      {/* ── Animated Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="matchPitch"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="120"
                height="120"
                fill="none"
                stroke="#4ade80"
                strokeWidth="0.5"
              />
              <circle
                cx="60"
                cy="60"
                r="20"
                fill="none"
                stroke="#4ade80"
                strokeWidth="0.5"
              />
              <line
                x1="60"
                y1="0"
                x2="60"
                y2="120"
                stroke="#4ade80"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#matchPitch)" />
        </svg>
        {/* green glow center */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(74,222,128,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(59,130,246,0.06)" }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-16">
        {/* ── Back Button ── */}
        <div className="pt-6 mb-6">
          <button
            onClick={goBack}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#4ade80",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(74,222,128,0.10)";
              e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            }}
          >
            <span style={{ fontSize: "10px" }}>◀</span>
            <span>All Matches</span>
          </button>
        </div>

        {/* ── Match Header / Scoreboard ── */}
        <div
          className="relative rounded-3xl mb-8 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(15,20,35,0.95) 50%, rgba(59,130,246,0.06) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* top accent bar */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, #4ade80, #22d3ee, #facc15, #22d3ee, #4ade80)",
            }}
          />

          <div className="p-6 sm:p-8">
            {/* competition badge */}
            <div className="flex justify-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                style={{
                  background: "rgba(250,204,21,0.08)",
                  border: "1px solid rgba(250,204,21,0.2)",
                  color: "#facc15",
                }}
              >
                🏆 Match Prediction
              </div>
            </div>

            {/* teams row */}
            <div className="flex items-center justify-between gap-4">
              {/* Team A */}
              <div className="flex-1 text-center">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl sm:text-3xl font-black"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(74,222,128,0.18), rgba(74,222,128,0.04))",
                    border: "1px solid rgba(74,222,128,0.3)",
                    boxShadow: "0 0 24px rgba(74,222,128,0.15)",
                  }}
                >
                  {match.teamA?.charAt(0) ?? "A"}
                </div>
                <h2 className="font-black text-base sm:text-lg text-white tracking-wide leading-tight">
                  {match.teamA}
                </h2>
                <p className="text-green-400 text-xs mt-1 font-bold uppercase tracking-widest">
                  Home
                </p>
              </div>

              {/* VS / score center */}
              <div className="flex flex-col items-center gap-2 px-2">
                <div
                  className="px-4 py-2 rounded-2xl"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    className="text-2xl sm:text-3xl font-black tracking-widest"
                    style={{
                      background:
                        "linear-gradient(180deg, #fff 0%, #94a3b8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    VS
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-gray-600" />
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
                  Predict
                </p>
              </div>

              {/* Team B */}
              <div className="flex-1 text-center">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl sm:text-3xl font-black"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(59,130,246,0.04))",
                    border: "1px solid rgba(59,130,246,0.3)",
                    boxShadow: "0 0 24px rgba(59,130,246,0.15)",
                  }}
                >
                  {match.teamB?.charAt(0) ?? "B"}
                </div>
                <h2 className="font-black text-base sm:text-lg text-white tracking-wide leading-tight">
                  {match.teamB}
                </h2>
                <p className="text-blue-400 text-xs mt-1 font-bold uppercase tracking-widest">
                  Away
                </p>
              </div>
            </div>
          </div>

          {/* bottom glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), rgba(59,130,246,0.3), transparent)",
            }}
          />
        </div>

        {/* ── Questions ── */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-500">
            Your Predictions
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        <div className="space-y-4">
          {match.questions?.map((q, qIdx) => (
            <div
              key={q.id}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                animation: `fadeSlideIn 0.4s ease both`,
                animationDelay: `${qIdx * 0.08}s`,
              }}
            >
              {/* question number accent */}
              <div
                className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                style={{
                  background: "linear-gradient(180deg, #4ade80, #22d3ee)",
                }}
              />

              <div className="pl-5 pr-4 py-4">
                {/* question header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{
                      background: "rgba(74,222,128,0.12)",
                      border: "1px solid rgba(74,222,128,0.2)",
                      color: "#4ade80",
                    }}
                  >
                    {qIdx + 1}
                  </div>
                  <h2 className="font-bold text-sm sm:text-base text-white leading-snug">
                    {q.text}
                  </h2>
                </div>

                {/* OPTION TYPE */}
                {q.type === "OPTION" && (
                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => {
                      const isSelected = selectedOption[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSelectedOption((prev) => ({
                              ...prev,
                              [q.id]: opt.id,
                            }));
                          }}
                          className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(74,222,128,0.22), rgba(74,222,128,0.08))"
                              : "rgba(255,255,255,0.04)",
                            border: isSelected
                              ? "1px solid rgba(74,222,128,0.5)"
                              : "1px solid rgba(255,255,255,0.07)",
                            color: isSelected ? "#4ade80" : "#cbd5e1",
                            boxShadow: isSelected
                              ? "0 0 20px rgba(74,222,128,0.15), inset 0 1px 0 rgba(74,222,128,0.1)"
                              : "none",
                            transform: isSelected ? "scale(1.01)" : "scale(1)",
                            animationDelay: `${optIdx * 0.05}s`,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.08)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.14)";
                              e.currentTarget.style.transform = "scale(1.005)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.04)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.07)";
                              e.currentTarget.style.transform = "scale(1)";
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                              style={{
                                border: isSelected
                                  ? "2px solid #4ade80"
                                  : "2px solid rgba(255,255,255,0.15)",
                                background: isSelected
                                  ? "#4ade80"
                                  : "transparent",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-black" />
                              )}
                            </div>
                            <span>{opt.text}</span>
                            {isSelected && (
                              <span className="ml-auto text-xs font-black text-green-400 uppercase tracking-widest">
                                ✓ Selected
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TEXT TYPE */}
                {q.type === "TEXT" && (
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        caretColor: "#4ade80",
                      }}
                      placeholder="Type your prediction…"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(74,222,128,0.4)";
                        e.currentTarget.style.boxShadow =
                          "0 0 16px rgba(74,222,128,0.08)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">
                      ⚽
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer progress indicator ── */}
        {match.questions && match.questions.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
              {Object.keys(selectedOption).length} /{" "}
              {match.questions.filter((q) => q.type === "OPTION").length}{" "}
              answered
            </p>
            <div
              className="mt-2 h-1 w-40 mx-auto rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    match.questions.filter((q) => q.type === "OPTION").length >
                    0
                      ? (Object.keys(selectedOption).length /
                          match.questions.filter((q) => q.type === "OPTION")
                            .length) *
                        100
                      : 0
                  }%`,
                  background: "linear-gradient(90deg, #4ade80, #22d3ee)",
                  boxShadow: "0 0 8px rgba(74,222,128,0.4)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
