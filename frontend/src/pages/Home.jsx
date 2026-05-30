import { useEffect, useState } from "react";
import { api } from "../services/api";
import MatchCard from "../components/MatchCard";

export default function Home({ onSelectMatch }) {
  const [matches, setMatches] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    api.get("/matches").then((res) => {
      setMatches(res.data);
    });
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090f] text-white overflow-x-hidden">
      {/* ── Animated Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* pitch lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pitch"
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
          <rect width="100%" height="100%" fill="url(#pitch)" />
        </svg>

        {/* radial glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(74,222,128,0.08) 0%, transparent 70%)",
          }}
        />

        {/* stadium light top-left */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "rgba(59,130,246,0.12)" }}
        />
        {/* stadium light top-right */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl"
          style={{ background: "rgba(74,222,128,0.10)" }}
        />

        {/* floating particles */}
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background:
                i % 3 === 0
                  ? "rgba(74,222,128,0.6)"
                  : i % 3 === 1
                    ? "rgba(59,130,246,0.6)"
                    : "rgba(250,204,21,0.5)",
              animation: `floatUp ${6 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: Math.random() * 6 + "s",
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      {/* ── Hero Section ── */}
      <header
        className="relative z-10 pt-16 pb-12 px-4 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 border border-green-500/30 text-green-400 text-xs font-bold tracking-widest uppercase"
          style={{
            background: "rgba(74,222,128,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          Live Predictions
        </div>

        {/* title */}
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-3 leading-none">
          <span className="text-white">PREDICT</span>
          <span
            className="block"
            style={{
              background:
                "linear-gradient(90deg, #4ade80 0%, #22d3ee 50%, #facc15 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            THE GAME
          </span>
        </h1>

        <p className="text-gray-400 text-sm tracking-widest uppercase mt-3 font-medium">
          Choose your winner · Score your points
        </p>

        {/* decorative divider */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-green-500/50" />
          <span className="text-2xl">⚽</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-green-500/50" />
        </div>
      </header>

      {/* ── Match Cards ── */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            {matches.length} {matches.length === 1 ? "Match" : "Matches"}{" "}
            Available
          </p>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <div
              className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {matches.map((m, idx) => (
            <div
              key={m.id}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(32px)",
                transition: `opacity 0.5s ease ${0.15 + idx * 0.1}s, transform 0.5s ease ${0.15 + idx * 0.1}s`,
              }}
            >
              {/* Card wrapper adds premium styling AROUND MatchCard */}
              <div
                className="group relative rounded-2xl cursor-pointer overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                  transition:
                    "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-3px) scale(1.01)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(74,222,128,0.15), 0 0 0 1px rgba(74,222,128,0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
                onClick={() => {
                  console.log("clicked:", m);
                  onSelectMatch(m.id);
                }}
              >
                {/* glow accent top */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(74,222,128,0.4), transparent)",
                  }}
                />

                {/* team names overlay (sits above MatchCard visually) */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    {/* Team A */}
                    <div className="flex-1 text-center">
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-black"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.05))",
                          border: "1px solid rgba(74,222,128,0.25)",
                        }}
                      >
                        {m.teamA?.charAt(0) ?? "A"}
                      </div>
                      <p className="font-bold text-sm text-white tracking-wide truncate">
                        {m.teamA}
                      </p>
                    </div>

                    {/* VS */}
                    <div className="px-3 flex flex-col items-center gap-1">
                      <span className="text-xs font-black tracking-widest text-gray-500 uppercase">
                        vs
                      </span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        ⚡
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="flex-1 text-center">
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl font-black"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))",
                          border: "1px solid rgba(59,130,246,0.25)",
                        }}
                      >
                        {m.teamB?.charAt(0) ?? "B"}
                      </div>
                      <p className="font-bold text-sm text-white tracking-wide truncate">
                        {m.teamB}
                      </p>
                    </div>
                  </div>

                  {/* MatchCard renders its own content below */}
                  <MatchCard
                    match={m}
                    onClick={() => {
                      /* handled by parent div */
                    }}
                  />

                  {/* CTA */}
                  <div className="mt-4 flex justify-center">
                    <div
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase"
                      style={{
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        boxShadow:
                          "0 0 20px rgba(74,222,128,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                        color: "#fff",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <span>Tap to Predict</span>
                      <span style={{ fontSize: "10px" }}>▶</span>
                    </div>
                  </div>
                </div>

                {/* bottom glow on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-bounce">⚽</div>
            <p className="text-gray-500 text-sm tracking-widest uppercase">
              Loading matches…
            </p>
          </div>
        )}
      </main>

      {/* float animation keyframes */}
      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
