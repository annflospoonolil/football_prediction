import { useState } from "react";
import { api } from "../services/api";

export default function Login({ onLogin, goToRegister }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        identifier,
        password,
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      onLogin(res.data.user.role);
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-white">
      <div className="bg-white/10 p-8 rounded-2xl w-96">
        <h1 className="text-3xl font-bold mb-6">⚽ Football Predictor</h1>

        <input
          className="w-full p-3 rounded mb-3 text-black"
          placeholder="Email or College ID"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded mb-4 text-black"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-500 p-3 rounded-lg"
        >
          Login
        </button>

        <p
          className="mt-4 text-center cursor-pointer text-green-400"
          onClick={goToRegister}
        >
          Create Account
        </p>
      </div>
    </div>
  );
}
