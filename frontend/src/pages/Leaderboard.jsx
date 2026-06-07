import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Leaderboard({ goBack }) {
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    api.get("/answers/leaderboard").then((res) => {
      setUsers(res.data);
    });
    setTimeout(() => setVisible(true), 100);
  }, []);

  const medals = ["🥇", "🥈", "🥉"];
  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  const podiumOrder =
    topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

  // Indexed by true rank: [0]=1st/gold, [1]=2nd/silver, [2]=3rd/bronze
  const podiumStyles = [
    {
      height: "130px",
      color: "#ffd700",
      rank: 1,
      label: "1st",
      glow: "rgba(255,215,0,0.4)",
    },
    {
      height: "100px",
      color: "#94a3b8",
      rank: 2,
      label: "2nd",
      glow: "rgba(148,163,184,0.3)",
    },
    {
      height: "80px",
      color: "#cd7f32",
      rank: 3,
      label: "3rd",
      glow: "rgba(205,127,50,0.3)",
    },
  ];

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background: "#060810",
        fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); opacity: 0.5; }
          50% { transform: translateY(-22px); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes podiumRise {
          from { opacity: 0; transform: translateY(40px) scaleY(0.7); }
          to   { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes crownBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
        @keyframes rankPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
          50% { box-shadow: 0 0 0 6px rgba(255,215,0,0.12); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #ffd700 0%, #fff 35%, #ffd700 60%, #f97316 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .row-item {
          animation: fadeSlideUp 0.4s ease both;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .row-item:hover {
          transform: translateX(6px);
          border-color: rgba(255,215,0,0.2) !important;
          box-shadow: 0 0 20px rgba(255,215,0,0.08);
        }
        .podium-col {
          animation: podiumRise 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .crown { animation: crownBounce 2.5s ease-in-out infinite; }
        .gold-pulse { animation: rankPulse 2s ease-in-out infinite; }
      `}</style>

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.03 }}
        >
          <defs>
            <pattern
              id="lbGrid"
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
                stroke="#ffd700"
                strokeWidth="0.5"
              />
              <circle
                cx="40"
                cy="40"
                r="13"
                fill="none"
                stroke="#ffd700"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lbGrid)" />
        </svg>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse, rgba(255,215,0,0.07) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(249,115,22,0.06)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(0,200,80,0.04)" }}
        />

        {/* Particles */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1.5 + "px",
              height: Math.random() * 3 + 1.5 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background:
                i % 3 === 0
                  ? "rgba(255,215,0,0.7)"
                  : i % 3 === 1
                    ? "rgba(0,200,80,0.6)"
                    : "rgba(249,115,22,0.6)",
              animation: `floatUp ${6 + Math.random() * 7}s ease-in-out infinite`,
              animationDelay: Math.random() * 7 + "s",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
        {/* ── Back ── */}
        <div
          className="pt-6 mb-8"
          style={{ animation: "fadeSlideDown 0.4s ease both" }}
        >
          <button
            onClick={goBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-[0.15em] uppercase text-yellow-400"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.2)",
              transition: "all 0.2s ease",
              fontFamily: "'Rajdhani', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,215,0,0.12)";
              e.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,215,0,0.06)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span>◀</span>
            <span>Back</span>
          </button>
        </div>

        {/* ── Hero Header ── */}
        <div
          className="text-center mb-10"
          style={{ animation: "fadeSlideDown 0.5s ease 0.05s both" }}
        >
          <div className="crown inline-block text-5xl mb-3">👑</div>
          <h1
            className="shimmer-text"
            style={{
              fontSize: "clamp(3rem, 10vw, 6rem)",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
            }}
          >
            LEADERBOARD
          </h1>
          <p
            style={{ fontFamily: "'Barlow', sans-serif" }}
            className="text-gray-500 text-xs tracking-[0.25em] uppercase mt-4 font-medium"
          >
            Top predictors · Season standings
          </p>
          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-yellow-500/40" />
            <span className="text-lg">⭐</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-yellow-500/40" />
          </div>
        </div>

        {/* ── Podium (top 3) ── */}
        {topThree.length > 0 && (
          <div className="mb-10">
            <div className="flex items-end justify-center gap-3 sm:gap-5 px-2">
              {(topThree.length === 3 ? podiumOrder : topThree).map(
                (u, pIdx) => {
                  // trueRank = position in original sorted topThree array (0=1st, 1=2nd, 2=3rd)
                  const trueRank = topThree.findIndex(
                    (p) => p.userId === u.userId,
                  );
                  const style = podiumStyles[trueRank];
                  const isFirst = trueRank === 0;

                  return (
                    <div
                      key={u.userId}
                      className="podium-col flex flex-col items-center"
                      style={{
                        flex: "1 1 0",
                        maxWidth: "160px",
                        animationDelay: 0.1 + pIdx * 0.1 + "s",
                      }}
                    >
                      {/* Avatar */}
                      <div className="relative mb-2">
                        {isFirst && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl crown">
                            👑
                          </div>
                        )}
                        <div
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black ${isFirst ? "gold-pulse" : ""}`}
                          style={{
                            background: `linear-gradient(135deg, ${style.color}30, ${style.color}08)`,
                            border: `2px solid ${style.color}60`,
                            color: style.color,
                            boxShadow: `0 0 24px ${style.glow}`,
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div
                          className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                          style={{
                            background: style.color,
                            color: "#000",
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          {trueRank + 1}
                        </div>
                      </div>

                      {/* Name */}
                      <p
                        className="text-white font-black text-xs sm:text-sm text-center truncate w-full px-1 mt-3 mb-2"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {u.name}
                      </p>
                      <p
                        className="font-black text-base sm:text-lg mb-2"
                        style={{
                          color: style.color,
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        {u.score}{" "}
                        <span className="text-xs font-bold opacity-70">
                          pts
                        </span>
                      </p>

                      {/* Podium block */}
                      <div
                        className="w-full rounded-t-xl flex items-center justify-center font-black text-sm"
                        style={{
                          height: style.height,
                          background: `linear-gradient(to top, ${style.color}25, ${style.color}10)`,
                          border: `1px solid ${style.color}35`,
                          borderBottom: "none",
                          color: style.color,
                          fontFamily: "'Rajdhani', sans-serif",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {medals[trueRank]}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
            {/* Podium base */}
            <div
              className="h-3 rounded-b-xl mx-2"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,215,0,0.08), rgba(255,215,0,0.2), rgba(255,215,0,0.08))",
                border: "1px solid rgba(255,215,0,0.15)",
                borderTop: "none",
              }}
            />
          </div>
        )}

        {/* ── Full Rankings ── */}
        <div className="space-y-3">
          {/* Section label */}
          {users.length > 3 && (
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.08))",
                }}
              />
              <p
                className="text-xs font-black uppercase tracking-widest text-gray-600"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                All Rankings
              </p>
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
                }}
              />
            </div>
          )}

          {users.map((u, i) => {
            const isTop3 = i < 3;
            const rankColor =
              i === 0
                ? "#ffd700"
                : i === 1
                  ? "#94a3b8"
                  : i === 2
                    ? "#cd7f32"
                    : "rgba(255,255,255,0.3)";
            return (
              <div
                key={u.userId}
                className="row-item relative rounded-2xl overflow-hidden cursor-default"
                style={{
                  background: isTop3
                    ? `linear-gradient(135deg, ${rankColor}10 0%, rgba(255,255,255,0.02) 100%)`
                    : "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                  border: `1px solid ${isTop3 ? rankColor + "30" : "rgba(255,255,255,0.07)"}`,
                  backdropFilter: "blur(16px)",
                  animationDelay: i * 0.05 + "s",
                }}
              >
                {/* Left accent */}
                {isTop3 && (
                  <div
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{
                      background: `linear-gradient(to bottom, ${rankColor}, ${rankColor}40)`,
                    }}
                  />
                )}

                <div
                  className={`flex items-center gap-4 px-5 py-4 ${isTop3 ? "pl-6" : ""}`}
                >
                  {/* Rank */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-base"
                    style={{
                      background: isTop3
                        ? `${rankColor}18`
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isTop3 ? rankColor + "40" : "rgba(255,255,255,0.08)"}`,
                      color: rankColor,
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    {isTop3 ? medals[i] : `#${i + 1}`}
                  </div>

                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-base font-black"
                    style={{
                      background: "rgba(0,200,80,0.08)",
                      border: "1px solid rgba(0,200,80,0.15)",
                      color: "#00c850",
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>

                  {/* Name & rank label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-black text-sm sm:text-base text-white truncate"
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {u.name}
                    </p>
                    {isTop3 && (
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                        style={{ color: rankColor }}
                      >
                        {i === 0
                          ? "🔥 Top Predictor"
                          : i === 1
                            ? "⚡ Runner Up"
                            : "⭐ 3rd Place"}
                      </p>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <p
                      className="font-black text-xl sm:text-2xl"
                      style={{
                        color: isTop3 ? rankColor : "#e2e8f0",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {u.score}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      pts
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {users.length === 0 && (
          <div className="text-center py-24">
            <div
              className="text-6xl mb-5"
              style={{ animation: "floatUp 3s ease-in-out infinite" }}
            >
              🏆
            </div>
            <p className="text-gray-600 text-xs tracking-[0.25em] uppercase font-bold">
              No scores yet
            </p>
            <p className="text-gray-700 text-xs mt-2">
              Be the first to predict!
            </p>
          </div>
        )}

        {/* Footer count */}
        {users.length > 0 && (
          <div className="mt-8 text-center">
            <p
              className="text-xs text-gray-600 font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {users.length} participant{users.length !== 1 ? "s" : ""} ranked
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
