import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password, role: role.toLowerCase() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // ✅ Store token and role from response
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);

      // ✅ Redirect based on actual role
      navigate(res.data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      console.error('Login error:', err.response || err.message);
      setError(err.response?.data?.error || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = email && password && !loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-pink-300 to-indigo-800 px-4 py-12 font-sans text-gray-800">
      {/* Container with frosted glass effect */}
      <form
        onSubmit={handleLogin}
        className="bg-white/30 backdrop-blur-lg border border-white/40 p-10 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in"
      >
        <h2 className="text-4xl font-extrabold text-center text-indigo-900 mb-2">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-700 mb-8">Sign in to your account</p>

        {/* Inputs with rounded corners and focus styles */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-5 py-3 border border-transparent rounded-full bg-white/50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 mb-4 transition-all"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-5 py-3 border border-transparent rounded-full bg-white/50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 mb-4 transition-all"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-5 py-3 border border-transparent rounded-full bg-white/50 text-indigo-900 mb-6 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Button with gradient and hover effect */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-3 rounded-full font-bold text-white shadow-lg transition-all transform ${
            loading
              ? 'bg-gradient-to-r from-purple-300 to-pink-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <p className="text-red-500 mt-4 text-sm text-center bg-white/60 p-2 rounded-lg border border-red-300">
            {error}
          </p>
        )}

        <div className="mt-8 text-sm text-center space-y-2">
          <Link to="/forgot-password" className="text-blue-900 hover:text-pink-600 hover:underline transition-colors block">
            Forgot Password?
          </Link>
          <Link to="/register" className="text-blue-900 hover:text-pink-600 hover:underline transition-colors block">
            Don’t have an account? Register
          </Link>
        </div>
      </form>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
