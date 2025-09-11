import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow-md p-6 text-center">
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-3xl font-bold text-indigo-600 mt-2">{value}</p>
  </div>
);

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({});
  const [activePanel, setActivePanel] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setUsers(res.data.users || []);
        setUploads(res.data.recentUploads || []);
        setStats(res.data.stats || {});
      })
      .catch(err => {
        console.error('Admin fetch error:', err);
        setError('Failed to load admin data. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const deleteUser = async userId => {
    if (!window.confirm('Delete this user?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.filter(u => u._id !== userId));
    setUploads(uploads.filter(f => f.user?._id !== userId));
  };

  const deleteUpload = async uploadId => {
    if (!window.confirm('Delete this file?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/admin/uploads/${uploadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUploads(uploads.filter(f => f._id !== uploadId));
  };

  const toggleVerify = async (uploadId, currentlyVerified) => {
    const token = localStorage.getItem('token');
    await axios.patch(
      `http://localhost:5000/api/admin/uploads/${uploadId}/verify`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setUploads(uploads.map(f =>
      f._id === uploadId ? { ...f, verified: !currentlyVerified } : f
    ));
  };

  const togglePanel = panel =>
    setActivePanel(prev => (prev === panel ? '' : panel));

  const exportPDF = async () => {
    const element = document.getElementById('dashboard-root');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
    pdf.save('admin-dashboard.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      id="dashboard-root"
      className="min-h-screen relative p-8 bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 text-sans"
    >
      {/* Header Actions */}
      <div className="absolute top-6 right-6 flex gap-2">
        <button
          onClick={exportPDF}
          className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
        >
          Download Report
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <h1 className="text-4xl font-bold text-center text-black drop-shadow mb-12">
        Admin Dashboard
      </h1>

      {error && <p className="text-center text-red-600 mb-6">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Users" value={stats.totalUsers || 0} />
        <StatCard title="Total Uploads" value={stats.totalUploads || 0} />
        <StatCard title="Verified Uploads" value={stats.verifiedUploads || 0} />
        <StatCard title="Active Users" value={stats.activeUsers || 0} />
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Users Panel */}
        <div
          onClick={() => togglePanel('users')}
          className={`cursor-pointer w-full md:w-96 bg-white/90 rounded-xl shadow-lg p-6 transition-transform hover:scale-105 ${activePanel === 'users' ? 'ring-4 ring-indigo-400' : ''
            }`}
        >
          <h2 className="text-2xl font-semibold text-indigo-800 mb-2">
            Registered Users
          </h2>
          <p className="text-gray-700 mb-4">{users.length} total</p>

          {activePanel === 'users' && (
            <ul className="max-h-56 overflow-y-auto space-y-2">
              {users.map(u => (
                <li
                  key={u._id}
                  className="flex justify-between items-center bg-purple-100 p-3 rounded"
                >
                  <span className="truncate">{u.email}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteUser(u._id);
                    }}
                    className="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Uploads Panel */}
        <div
          onClick={() => togglePanel('uploads')}
          className={`cursor-pointer w-full md:w-96 bg-white/90 rounded-xl shadow-lg p-6 transition-transform hover:scale-105 ${activePanel === 'uploads' ? 'ring-4 ring-indigo-400' : ''
            }`}
        >
          <h2 className="text-2xl font-semibold text-indigo-800 mb-2">
            Recent Uploads
          </h2>
          <p className="text-gray-700 mb-4">{uploads.length} total</p>

          {activePanel === 'uploads' && (
            <ul className="max-h-56 overflow-y-auto space-y-2">
              {uploads.map(f => (
                <li
                  key={f._id}
                  className="flex justify-between bg-purple-100 p-3 rounded"
                >
                  <div>
                    <p className="font-medium truncate">{f.filename}</p>
                    <p className="text-xs text-gray-600">
                      by {f.user?.email || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleVerify(f._id, f.verified);
                      }}
                      className={`text-xs px-2 py-0.5 rounded ${f.verified
                          ? 'bg-green-200 text-green-800'
                          : 'bg-yellow-200 text-yellow-800'
                        }`}
                    >
                      {f.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteUpload(f._id);
                      }}
                      className="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
