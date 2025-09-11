import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow-md p-6 text-center">
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-3xl font-bold text-indigo-600 mt-2">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentUploads, setRecentUploads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const refreshDashboard = useCallback(() => {
    axios
      .get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setStats(res.data.stats || {});
        setRecentUploads(res.data.recentUploads || []);
        setUsers(res.data.users || []);
        setError('');
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    refreshDashboard();
  }, [navigate, token, role, refreshDashboard]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const deactivateUser = async (id) => {
    if (!id) {
      console.warn('Deactivate triggered with missing ID');
      return alert('Invalid user ID');
    }
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deactivated');
      refreshDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to deactivate user');
    }
  };

  const deleteUser = async (id) => {
    if (!id) {
      console.warn('Delete triggered with missing ID');
      return alert('Invalid user ID');
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deleted');
      refreshDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  const deleteUserFiles = async (userId) => {
    if (!userId) {
      console.warn('Delete files triggered with missing ID');
      return alert('Invalid user ID');
    }
    if (!window.confirm('Delete all files uploaded by this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/uploads/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User files deleted');
      refreshDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to delete files');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 p-8 text-sans">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-black drop-shadow">Welcome, Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-center text-red-600 mb-6">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Users" value={stats.totalUsers || 0} />
        <StatCard title="Total Uploads" value={stats.totalUploads || 0} />
        <StatCard title="Verified Uploads" value={stats.verifiedUploads || 0} />
        <StatCard title="Active Users" value={stats.activeUsers || 0} />
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4 text-indigo-700">Recent Uploads</h2>
        {recentUploads.length === 0 ? (
          <p className="text-gray-600">No recent uploads found.</p>
        ) : (
          <ul className="space-y-3">
            {recentUploads.map(upload => (
              <li key={upload._id} className="bg-gray-100 p-4 rounded">
                <p className="font-medium">{upload.filename}</p>
                <p className="text-sm text-gray-600">by {upload.user?.email || 'Unknown'}</p>
                <p className="text-xs text-gray-500">
                  Uploaded on {new Date(upload.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-indigo-700">All Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {users.map(user => {
              const userId = user._id || user.id || user.email; // fallback ID
              return (
                <li key={userId} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                  <div>
                    <p>{user.name || 'Unnamed'} — {user.email}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => deactivateUser(userId)}
                      className="text-yellow-600 hover:underline"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => deleteUserFiles(userId)}
                      className="text-indigo-600 hover:underline"
                    >
                      Delete Files
                    </button>
                    <button
                      onClick={() => deleteUser(userId)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;