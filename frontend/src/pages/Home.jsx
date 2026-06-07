import { useEffect, useState } from "react";
import { api } from "../services/api";
import MatchCard from "../components/MatchCard";

// Added an onLogout prop to handle auth tear-down externally if needed
export default function Home({ onSelectMatch, onLogout }) {
  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    api.get("/matches").then((res) => {
      setMatches(res.data);
    });
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (api.defaults.headers.common["Authorization"]) {
      delete api.defaults.headers.common["Authorization"];
    }

    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{
        background: "#060810",
        fontFamily: "'Rajdhani', 'Arial Narrow', sans-serif",
      }}
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-28px) rotate(180deg); opacity: 1; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,200,80,0.3); }
          50% { box-shadow: 0 0 40px rgba(0,200,80,0.7), 0 0 60px rgba(0,200,80,0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slowZoom {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.06); }
        }
        .card-hover {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px) scale(1.015);
          box-shadow: 0 24px 60px rgba(0,200,80,0.2), 0 0 0 1px rgba(0,200,80,0.25) !important;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #00c850 0%, #00e5ff 40%, #ffd700 60%, #00c850 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .live-dot {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(0,200,80,0.4); border-radius: 2px; }

        /* ── BACKGROUND LAYER STYLES ── */

        /* 1. The actual FIFA Fiesta banner image — fills the top portion of the viewport
              on every screen size. We use object-fit: cover but anchor to the top so the
              players & trophy remain visible rather than being cropped away. */
        .bg-image-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .bg-image-layer img {
          width: 100%;
          height: 100%;
          /* 'cover' fills the frame; 'top center' keeps the players in view */
          object-fit: cover;
          object-position: top center;
          /* Gentle slow-zoom for cinematic energy */
          animation: slowZoom 20s ease-in-out infinite alternate;
          transform-origin: top center;
        }

        /* 2. Primary darkening + bottom-fade: makes all UI readable while letting the
              top of the image breathe through.  Uses a five-stop gradient so the
              transition is smooth and not banded. */
        .bg-primary-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            /* Very top — let the banner image show through */
            rgba(4, 8, 20, 0.30)   0%,
            /* Just below the players row — deepen slightly */
            rgba(4, 8, 20, 0.52)  28%,
            /* Mid-page where cards live — strong readability layer */
            rgba(4, 8, 20, 0.82)  55%,
            /* Lower page */
            rgba(4, 8, 20, 0.93)  75%,
            /* Footer area — fully opaque so nothing distracts */
            rgba(4, 8, 20, 1.00) 100%
          );
        }

        /* 3. Subtle green-tinted side vignettes — pulls the eye inward and adds a
              football-pitch atmosphere without washing out the image. */
        .bg-vignette-sides {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse 70% 60% at 50% 0%,
              rgba(0, 200, 80, 0.06) 0%,
              transparent 70%
            ),
            /* Left edge vignette */
            linear-gradient(
              to right,
              rgba(4, 8, 20, 0.55) 0%,
              transparent 25%
            ),
            /* Right edge vignette */
            linear-gradient(
              to left,
              rgba(4, 8, 20, 0.55) 0%,
              transparent 25%
            );
        }

        /* 4. Gold trophy glow — a warm radial bloom centred on where the trophy sits
              in the image (~55 % from top, dead centre). */
        .bg-trophy-glow {
          position: fixed;
          left: 50%;
          top: 45%;
          transform: translate(-50%, -50%);
          z-index: 2;
          pointer-events: none;
          width: min(700px, 90vw);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 200, 30, 0.10) 0%,
            rgba(255, 160, 0,  0.06) 35%,
            transparent 70%
          );
          filter: blur(30px);
        }

        /* 5. Subtle scanline texture — gives the broadcast / stadium-screen feel. */
        .bg-scanlines {
          position: fixed;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 3px,
            rgba(0, 0, 0, 0.04) 3px,
            rgba(0, 0, 0, 0.04) 4px
          );
          mix-blend-mode: multiply;
        }

        /* 6. Pitch-grid SVG pattern (existing, kept as z-index 4) */
        .bg-pitch-grid {
          position: fixed;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          opacity: 0.028;
        }

        /* 7. Responsive tweaks
              On narrow screens we shift the image anchor so the trophy & title
              area stays centred rather than the far left/right players. */
        @media (max-width: 640px) {
          .bg-image-layer img {
            object-position: 55% top;   /* keep trophy & title in frame */
          }
          .bg-primary-overlay {
            background: linear-gradient(
              to bottom,
              rgba(4, 8, 20, 0.45)  0%,
              rgba(4, 8, 20, 0.68) 22%,
              rgba(4, 8, 20, 0.88) 50%,
              rgba(4, 8, 20, 0.97) 70%,
              rgba(4, 8, 20, 1.00) 100%
            );
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .bg-image-layer img {
            object-position: 52% top;
          }
        }

        @media (min-width: 1920px) {
          /* Ultra-wide: contain the image height so we don't lose the top */
          .bg-image-layer img {
            object-fit: cover;
            object-position: top center;
          }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════
          BACKGROUND LAYERS — only these changed from the original
      ═══════════════════════════════════════════════════════════════ */}

      {/* Layer 1 — The FIFA Fiesta '26 banner image */}
      <div className="bg-image-layer">
        <img
          src="/src/assets/Kalavedhi Desktop Event.png"
          alt=""
          aria-hidden="true"
          draggable="false"
        />
      </div>

      {/* Layer 2 — Primary darkening gradient (bottom-fade) */}
      <div className="bg-primary-overlay" />

      {/* Layer 3 — Side vignettes + top green bloom */}
      <div className="bg-vignette-sides" />

      {/* Layer 4 — Warm gold glow around the trophy area */}
      <div className="bg-trophy-glow" />

      {/* Layer 5 — Subtle broadcast scanlines */}
      <div className="bg-scanlines" />

      {/* Layer 6 — Pitch grid SVG (from original, moved here for z-order) */}
      <div className="bg-pitch-grid">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pitch"
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
                r="14"
                fill="none"
                stroke="#00c850"
                strokeWidth="0.4"
              />
              <line
                x1="40"
                y1="0"
                x2="40"
                y2="80"
                stroke="#00c850"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pitch)" />
        </svg>
      </div>

      {/* Layer 7 — Ambient particles + accent glows (from original) */}
      <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* Hero glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,200,80,0.05) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(0,180,255,0.04)" }}
        />
        <div
          className="absolute bottom-20 left-0 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(255,215,0,0.03)" }}
        />

        {/* Diagonal accent */}
        <div
          className="absolute top-0 right-0 w-px h-full"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0,200,80,0.2) 30%, transparent 70%)",
          }}
        />

        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 2 + "px",
              height: Math.random() * 3 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background:
                i % 4 === 0
                  ? "rgba(0,200,80,0.7)"
                  : i % 4 === 1
                    ? "rgba(0,200,255,0.7)"
                    : i % 4 === 2
                      ? "rgba(255,215,0,0.6)"
                      : "rgba(255,80,100,0.5)",
              animation: `floatUp ${7 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: Math.random() * 8 + "s",
              filter: "blur(0.3px)",
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ALL UI BELOW IS IDENTICAL TO THE ORIGINAL — nothing changed
      ═══════════════════════════════════════════════════════════════ */}

      {/* ── Logout Button Navigation Layer ── */}
      <nav className="relative z-20 max-w-7xl mx-auto px-6 pt-6 flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase text-red-400 border border-red-500/20 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 backdrop-blur-md"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          <span>🚪</span> Logout
        </button>
      </nav>

      {/* ── Hero ── */}
      <header
        className="relative z-10 pt-6 pb-10 px-4 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-30px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}
      >
        {/* Live badge */}
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-6 border"
          style={{
            background: "rgba(0,200,80,0.08)",
            borderColor: "rgba(0,200,80,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full bg-green-400 animate-ping absolute"
            style={{ opacity: 0.75 }}
          />
          <span className="w-2 h-2 rounded-full bg-green-400 relative" />
          <span className="text-green-400 text-xs font-black tracking-[0.2em] uppercase">
            Live Predictions Open
          </span>
        </div>

        {/* Title */}
        <div className="mb-2">
          <p className="text-gray-500 text-xs font-bold tracking-[0.3em] uppercase mb-2">
            FIFA Prediction Arena
          </p>
          <h1
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(3.5rem, 10vw, 7rem)",
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
            }}
          >
            <span className="block text-white">PREDICT</span>
            <span className="block shimmer-text">THE MATCH</span>
          </h1>
        </div>

        <p
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="text-gray-500 text-sm tracking-widest uppercase mt-5 font-medium"
        >
          Pick your winner · Score your points · Climb the leaderboard
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-green-500/40" />
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            ⚽
          </div>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-green-500/40" />
        </div>
      </header>

      {/* ── Match Count Bar ── */}
      <div
        className="relative z-10 max-w-2xl mx-auto px-4 mb-6"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 0.2s",
        }}
      >
        <div
          className="flex items-center justify-between py-3 px-5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 live-dot" />
            <span className="text-xs font-black tracking-[0.15em] uppercase text-gray-400">
              {matches.length} {matches.length === 1 ? "Match" : "Matches"}{" "}
              Available
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {["bg-green-400", "bg-blue-400", "bg-yellow-400"].map((c, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${c} animate-pulse`}
                style={{ animationDelay: i * 0.2 + "s" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
        <div className="flex flex-col gap-5">
          {matches.map((m, idx) => (
            <div
              key={m.id}
              style={{
                animation: visible
                  ? `cardReveal 0.5s ease ${0.1 + idx * 0.08}s both`
                  : "none",
              }}
            >
              <div
                className="card-hover group relative rounded-3xl cursor-pointer overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                  cursor: m.isLocked ? "not-allowed" : "pointer",
                }}
                onClick={() => {
                  if (m.isLocked) return;
                  onSelectMatch(m.id);
                }}
              >
                {/* Top accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{
                    background: m.isLocked
                      ? "linear-gradient(90deg, transparent, #ef4444, transparent)"
                      : "linear-gradient(90deg, transparent, #00c850, #00e5ff, transparent)",
                  }}
                />

                {/* Status badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: m.isLocked
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(0,200,80,0.12)",
                      border: `1px solid ${m.isLocked ? "rgba(239,68,68,0.35)" : "rgba(0,200,80,0.35)"}`,
                      color: m.isLocked ? "#f87171" : "#00c850",
                    }}
                  >
                    <span>{m.isLocked ? "🔒" : "🟢"}</span>
                    {m.isLocked ? "Locked" : "Open"}
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  {/* Teams */}
                  <div className="flex items-center justify-between gap-4 mb-5">
                    {/* Team A */}
                    <div className="flex-1 text-center">
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl sm:text-3xl font-black"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(0,200,80,0.2), rgba(0,200,80,0.04))",
                          border: "1px solid rgba(0,200,80,0.3)",
                          color: "#00c850",
                        }}
                      >
                        {m.teamA?.name?.charAt(0) ?? "A"}
                      </div>
                      <p
                        className="font-black text-sm sm:text-base text-white tracking-wide truncate"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {m.teamA?.name}
                      </p>
                      <p className="text-[10px] text-green-400/70 font-bold uppercase tracking-widest mt-0.5">
                        Home
                      </p>
                    </div>

                    {/* Center */}
                    <div className="flex flex-col items-center gap-2 px-2">
                      <div
                        className="px-4 py-2 rounded-xl"
                        style={{
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <span
                          className="text-xl font-black text-white/80 tracking-widest"
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          VS
                        </span>
                      </div>
                      {m.kickoffAt && (
                        <p className="text-[10px] text-gray-500 font-bold text-center">
                          ⏰{" "}
                          {new Date(m.kickoffAt).toLocaleString("en-IN", {
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
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl sm:text-3xl font-black"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(0,150,255,0.2), rgba(0,150,255,0.04))",
                          border: "1px solid rgba(0,150,255,0.3)",
                          color: "#60a5fa",
                        }}
                      >
                        {m.teamB?.name?.charAt(0) ?? "B"}
                      </div>
                      <p
                        className="font-black text-sm sm:text-base text-white tracking-wide truncate"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {m.teamB?.name}
                      </p>
                      <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest mt-0.5">
                        Away
                      </p>
                    </div>
                  </div>

                  {/* MatchCard content */}
                  <MatchCard match={m} onClick={() => {}} />

                  {/* CTA */}
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div
                      className="h-px flex-1"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(0,200,80,0.2), transparent)",
                      }}
                    />
                    <button
                      className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-black tracking-[0.15em] uppercase text-white"
                      style={{
                        background: m.isLocked
                          ? "rgba(100,100,120,0.3)"
                          : "linear-gradient(135deg, #00c850, #00a040)",
                        boxShadow: m.isLocked
                          ? "none"
                          : "0 0 24px rgba(0,200,80,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                        border: m.isLocked
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "none",
                        pointerEvents: "none",
                      }}
                    >
                      {m.isLocked ? (
                        <>
                          <span>🔒</span>
                          <span>Predictions Closed</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>Tap to Predict</span>
                          <span style={{ fontSize: "9px" }}>▶</span>
                        </>
                      )}
                    </button>
                    <div
                      className="h-px flex-1"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(0,150,255,0.2))",
                      }}
                    />
                  </div>
                </div>

                {/* Bottom glow on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,200,80,0.5), transparent)",
                  }}
                />
                {/* Corner accent */}
                <div
                  className="absolute bottom-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-2xl"
                  style={{ background: "rgba(0,200,80,0.08)" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {matches.length === 0 && (
          <div className="text-center py-24">
            <div
              className="text-6xl mb-6"
              style={{ animation: "floatUp 3s ease-in-out infinite" }}
            >
              ⚽
            </div>
            <p className="text-gray-600 text-xs tracking-[0.25em] uppercase font-bold">
              Loading matches…
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
