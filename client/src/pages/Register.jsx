import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        "/api/auth/register",
        {
          name: username,
          email,
          password,
          role: role.toLowerCase(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      alert("Registration successful!");
      navigate(
        res.data.user.role === "admin"
          ? "/admin-dashboard"
          : "/dashboard"
      );
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    username.trim() &&
    email.trim() &&
    password &&
    confirmPassword &&
    !emailError &&
    !passwordError &&
    !loading;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-400">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">
            Create Your Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1 ml-2">
                  {emailError}
                </p>
              )}
            </div>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            />

            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-5 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1 ml-2">
                  {passwordError}
                </p>
              )}
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-5 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 rounded-full font-bold text-white transition ${
                !canSubmit
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Register"
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            <Link
              to="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Already have an account? Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
