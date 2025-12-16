import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

/* -------- File Icon -------- */
const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-8 w-8 text-indigo-600 flex-shrink-0"
  >
    <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 013.75 3.75v1.875A3.75 3.75 0 0113.5 9.75h-.375c-1.036 0-1.875.84-1.875 1.875v.375m-4.5-9h3.75c1.036 0 1.875.84 1.875 1.875v1.875a3.75 3.75 0 01-3.75 3.75H7.5a1.875 1.875 0 01-1.875-1.875V5.25c0-1.036.84-1.875 1.875-1.875zm-3 8.25h12v9A2.25 2.25 0 0117.25 22.5H6.75A2.25 2.25 0 014.5 20.25v-9z" />
  </svg>
);

/* -------- File Card -------- */
const FileCard = ({ file, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateString, fallbackId) => {
    let date = new Date(dateString);
    if (isNaN(date.getTime()) && fallbackId) {
      date = new Date(parseInt(fallbackId.substring(0, 8), 16) * 1000);
    }
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  // ✅ Safe download URL (works on Render + local)
  const downloadUrl = `${api.defaults.baseURL}/api/files/${file._id}/download`;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col md:flex-row justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <FileIcon />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {file.filename}
          </h3>
          <p className="text-sm text-gray-500">
            Uploaded: {formatDate(file.createdAt, file._id)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to={`/dashboard/visualize/${file._id}`}>
          <button className="px-6 py-2 rounded-full bg-indigo-600 text-white">
            📊 Visualize
          </button>
        </Link>

        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
          <button className="px-6 py-2 rounded-full bg-yellow-500 text-white">
            📥 Download
          </button>
        </a>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 rounded-full bg-red-500 text-white"
        >
          🗑️ Delete
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <p className="mb-4 font-semibold">Delete this file?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(file._id);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------- Upload History -------- */
export default function UploadHistory() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("🔒 Not authenticated. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    api
      .get("/api/files", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = [...(res.data.files || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFiles(sorted);
        setStatus(`Showing ${sorted.length} uploaded file(s)`);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load uploads");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (fileId) => {
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      setStatus("✅ File deleted successfully");
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setError("Could not delete file");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 p-6">
      <h2 className="text-3xl font-bold text-white text-center mb-6">
        📁 Upload History
      </h2>

      {status && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
          {status}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-200">Loading uploads...</p>
      ) : files.length === 0 ? (
        <p className="text-center text-gray-200">No files available yet.</p>
      ) : (
        <div className="space-y-6">
          {files.map((file) => (
            <FileCard key={file._id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
