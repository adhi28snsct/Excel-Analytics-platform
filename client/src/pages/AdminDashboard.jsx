import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ---------- Stat Card ---------- */
const StatCard = ({ title, value }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center hover:scale-105 transition">
    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
      {title}
    </h3>
    <p className="text-4xl font-bold text-indigo-700 mt-2">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentUploads, setRecentUploads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  /* ---------- Fetch Dashboard ---------- */
  const refreshDashboard = useCallback(() => {
    api
      .get("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats(res.data.stats || {});
        setRecentUploads(res.data.recentUploads || []);
        setUsers(res.data.users || []);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }
    refreshDashboard();
  }, [navigate, token, role, refreshDashboard]);

  /* ---------- Actions ---------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const deactivateUser = async (id) => {
    try {
      await api.patch(
        `/api/admin/users/${id}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshDashboard();
    } catch (err) {
      alert("Failed to deactivate user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshDashboard();
    } catch {
      alert("Failed to delete user");
    }
  };

  const deleteUserFiles = async (id) => {
    if (!window.confirm("Delete all files uploaded by this user?")) return;
    try {
      await api.delete(`/api/admin/uploads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      refreshDashboard();
    } catch {
      alert("Failed to delete files");
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded-full"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-center text-red-300 mb-6">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Users" value={stats.totalUsers || 0} />
        <StatCard title="Total Uploads" value={stats.totalUploads || 0} />
        <StatCard title="Verified Uploads" value={stats.verifiedUploads || 0} />
        <StatCard title="Active Users" value={stats.activeUsers || 0} />
      </div>

      {/* Recent Uploads */}
      <div className="bg-white/80 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Recent Uploads</h2>
        {recentUploads.length === 0 ? (
          <p>No uploads found</p>
        ) : (
          <ul className="space-y-4">
            {recentUploads.map((u) => (
              <li key={u._id} className="p-4 bg-white rounded shadow">
                <p className="font-semibold">{u.filename}</p>
                <p className="text-sm text-gray-500">
                  {u.user?.email || "Unknown"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Users */}
      <div className="bg-white/80 rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-6">All Users</h2>
        <ul className="space-y-4 max-h-96 overflow-y-auto">
          {users.map((u) => (
            <li
              key={u._id}
              className="flex justify-between items-center bg-white p-4 rounded shadow"
            >
              <div>
                <p className="font-semibold">{u.name || "Unnamed"}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <div className="space-x-3">
                <button onClick={() => deactivateUser(u._id)} className="text-yellow-600">
                  Deactivate
                </button>
                <button onClick={() => deleteUserFiles(u._id)} className="text-indigo-600">
                  Delete Files
                </button>
                <button onClick={() => deleteUser(u._id)} className="text-red-600">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
