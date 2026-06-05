import { useState } from "react";
import { api } from "../services/api";

export default function Register({ goToLogin }) {
  const [fullName, setFullName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", {
        fullName,
        collegeId,
        email,
        password,
      });

      alert(res.data.message || "Registration successful!");

      goToLogin();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          ⚽ Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 rounded-lg bg-white text-black"
            required
          />

          <input
            type="text"
            placeholder="College ID"
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className="w-full p-3 rounded-lg bg-white text-black"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white text-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white text-black"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 transition p-3 rounded-lg text-white font-semibold"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-300 mt-4">
          Already have an account?{" "}
          <span className="text-green-400 cursor-pointer" onClick={goToLogin}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
