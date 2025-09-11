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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-pink-300 to-indigo-800 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white border-2 border-blue-300 p-8 rounded-lg shadow-2xl w-full max-w-md animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Welcome Back!
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-blue-300 rounded bg-gray-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-blue-300 rounded bg-gray-50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border border-blue-300 rounded bg-gray-50 text-indigo-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full text-white font-semibold py-2 rounded transition duration-200 ${
            loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <p className="text-red-500 mt-2 text-sm text-center">{error}</p>
        )}

        <div className="mt-6 text-sm text-center space-y-2">
          <Link to="/forgot-password" className="text-blue-600 hover:underline block">
            Forgot Password?
          </Link>
          <Link to="/register" className="text-blue-600 hover:underline block">
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