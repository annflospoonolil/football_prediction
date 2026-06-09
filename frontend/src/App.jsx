import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Match from "./pages/Match";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Leaderboard from "./pages/Leaderboard";
import { api } from "./services/api"; // Ensure API headers are restored if applicable

export default function App() {
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // 1. Initialize state directly from localStorage so it persists instantly on reload
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole") || null;
  });

  // 2. Optional but highly recommended: Restore API token headers if your backend uses them
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && api.defaults.headers.common) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // 3. Centralized Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token"); // Clear if used

    if (api.defaults.headers.common?.["Authorization"]) {
      delete api.defaults.headers.common["Authorization"];
    }

    setIsLoggedIn(false);
    setRole(null);
    setSelectedMatchId(null);
    setShowLeaderboard(false);
  };

  // If the user is not logged in, render the Auth gateway
  if (!isLoggedIn) {
    return showRegister ? (
      <Register goToLogin={() => setShowRegister(false)} />
    ) : (
      <Login
        onLogin={(userRole, token) => {
          // Save parameters to localStorage so a reload doesn't wipe them
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", userRole);
          if (token) localStorage.setItem("token", token);

          setIsLoggedIn(true);
          setRole(userRole);
        }}
        goToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Render App if Logged In
  return (
    <div>
      {/* 🏆 Navigation / Global Action Bar */}
      {/* We shifted the layout to a row layout to stop elements overlapping with your custom Home view logout placement */}
      <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
        <button
          onClick={() => setShowLeaderboard(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          🏆 Leaderboard
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all backdrop-blur-md"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          🚪 Logout
        </button>
      </div>

      {/* VIEW CONDITIONAL ROUTING ELEMENT */}
      {showLeaderboard ? (
        <Leaderboard goBack={() => setShowLeaderboard(false)} />
      ) : role === "ADMIN" ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : selectedMatchId ? (
        <Match
          matchId={selectedMatchId}
          goBack={() => setSelectedMatchId(null)}
        />
      ) : (
        <Home onSelectMatch={setSelectedMatchId} onLogout={handleLogout} />
      )}
    </div>
  );
}
