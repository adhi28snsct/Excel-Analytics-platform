import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// SVG for a file icon to be used in the cards
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

// A component for a clean, well-styled file card.
const FileCard = ({ file, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const confirmDelete = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleDelete = () => {
    onDelete(file._id);
    closeModal();
  };

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

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 transition-transform transform hover:scale-[1.01] hover:shadow-2xl w-full">
      <div className="flex items-center space-x-4 flex-1">
        <FileIcon />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{file.filename}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Uploaded: {formatDate(file.createdAt, file._id)}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto justify-end">
        <Link to={`/dashboard/visualize/${file._id}`}>
          <button
            className="w-full px-6 py-2 rounded-full font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
          >
            📊 Visualize
          </button>
        </Link>
        <a
          href={`http://localhost:5000/api/files/${file._id}/download`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="w-full px-6 py-2 rounded-full font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors shadow-md">
            📥 Download
          </button>
        </a>
        <button
          onClick={confirmDelete}
          className="w-full px-6 py-2 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md"
        >
          🗑️ Delete
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
            <h4 className="text-xl font-bold mb-4">Confirm Deletion</h4>
            <p className="mb-6">Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-full font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
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

    axios
      .get("http://localhost:5000/api/files", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sortedFiles = [...(res.data.files || [])].sort(
          (a, b) => new Date(b.createdAt || b._id?.substring(0, 8) * 1000) -
            new Date(a.createdAt || a._id?.substring(0, 8) * 1000)
        );
        setFiles(sortedFiles);
        setStatus(`Showing ${sortedFiles.length} uploaded file(s)`);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Could not load uploads");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (fileId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
      setStatus("✅ File deleted successfully");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err.message);
      setError("Could not delete file");
    }
  };

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 flex items-center justify-center">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 font-sans p-6">
      <div>
        <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg text-center">📁 Upload History</h2>

        {status && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{status}</span>
        </div>}

        {loading ? (
          <p className="text-gray-200 text-center">Loading uploads...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-200 text-center">No files available yet.</p>
        ) : (
          <div className="space-y-6">
            {files.map((file) => (
              <FileCard key={file._id} file={file} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
