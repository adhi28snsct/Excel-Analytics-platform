import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// A beautifully styled component for displaying key statistics
const StatCard = ({ title, value }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center transform transition-transform duration-300 hover:scale-105">
    <h3 className="text-sm md:text-md font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
    <p className="text-4xl md:text-5xl font-bold text-indigo-700 mt-2">{value}</p>
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
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 p-8 font-sans">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Welcome, Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600/80 backdrop-blur-sm text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-red-700 transition-colors transform hover:scale-105"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-center text-red-300 mb-6 font-medium">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Users" value={stats.totalUsers || 0} />
        <StatCard title="Total Uploads" value={stats.totalUploads || 0} />
        <StatCard title="Verified Uploads" value={stats.verifiedUploads || 0} />
        <StatCard title="Active Users" value={stats.activeUsers || 0} />
      </div>

      <div className="space-y-12">
        {/* Recent Uploads Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Uploads</h2>
          {recentUploads.length === 0 ? (
            <p className="text-gray-600 text-center py-6">No recent uploads found.</p>
          ) : (
            <ul className="space-y-4">
              {recentUploads.map(upload => (
                <li key={upload._id} className="bg-white rounded-lg shadow-sm p-5 flex justify-between items-center transition-transform hover:scale-[1.01]">
                  <div>
                    <p className="font-semibold text-gray-900">{upload.filename}</p>
                    <p className="text-sm text-gray-500">by <span className="text-indigo-600 font-medium">{upload.user?.email || 'Unknown'}</span></p>
                    <p className="text-xs text-gray-400 mt-1">Uploaded on {new Date(upload.createdAt).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Users List Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">All Users</h2>
          {users.length === 0 ? (
            <p className="text-gray-600 text-center py-6">No users found.</p>
          ) : (
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {users.map(user => {
                const userId = user._id || user.id || user.email;
                return (
                  <li key={userId} className="bg-white rounded-lg shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center transition-transform hover:scale-[1.01]">
                    <div>
                      <p className="font-semibold text-gray-900">{user.name || 'Unnamed'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="space-x-2 mt-4 md:mt-0 flex-shrink-0">
                      <button
                        onClick={() => deactivateUser(userId)}
                        className="text-yellow-600 hover:text-yellow-700 font-medium"
                      >
                        Deactivate
                      </button>
                      <button
                        onClick={() => deleteUserFiles(userId)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Delete Files
                      </button>
                      <button
                        onClick={() => deleteUser(userId)}
                        className="text-red-600 hover:text-red-700 font-medium"
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
    </div>
  );
};

export default AdminDashboard;
