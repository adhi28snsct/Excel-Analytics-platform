import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        { name: username, email, password, role: role.toLowerCase() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // ✅ Store token and role from response
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);

      alert('Registration successful!');
      navigate(res.data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Registration failed');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-pink-300 to-indigo-800 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
          Create Your Account
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded mb-2 focus:ring-blue-400 focus:outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded mb-1 focus:ring-blue-400 focus:outline-none"
        />
        {emailError && <p className="text-red-500 text-sm mb-2">{emailError}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded mb-1 focus:ring-blue-400 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded mb-1 focus:ring-blue-400 focus:outline-none"
        />
        {passwordError && <p className="text-red-500 text-sm mb-2">{passwordError}</p>}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4 focus:ring-blue-400 focus:outline-none"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full bg-blue-600 text-white py-2 rounded transition ${
            !canSubmit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
                    {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center mt-4 text-sm text-blue-600">
          <Link to="/login" className="hover:underline">
            Already have an account? Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;