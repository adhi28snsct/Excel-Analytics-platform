import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

    fetch("http://localhost:5000/api/files", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch uploads");
        return res.json();
      })
      .then((data) => {
        const sortedFiles = [...(data.files || [])].sort(
          (a, b) => new Date(b.createdAt || b._id?.substring(0, 8) * 1000) -
                    new Date(a.createdAt || a._id?.substring(0, 8) * 1000)
        );
        setFiles(sortedFiles);
        setStatus(`Showing ${sortedFiles.length} uploaded file(s)`);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setError(err.message || "Could not load uploads");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

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

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
      setStatus("✅ File deleted successfully");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Could not delete file");
    }
  };

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-500 flex items-center justify-center">
        <div className="text-red-600 text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-500">
      <h2 className="text-2xl font-semibold mb-4 text-white">📁 Uploaded Files</h2>

      {status && <div className="text-green-200 mb-2">{status}</div>}

      {loading ? (
        <p className="text-white">Loading uploads...</p>
      ) : files.length === 0 ? (
        <p className="text-white">No files available yet.</p>
      ) : (
        files.map((file) => (
          <div
            key={file._id}
            className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg p-4 mb-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div className="flex-1 space-y-1">
              <div className="text-lg font-medium">{file.filename}</div>
              <div className="text-sm">
                Uploaded: {formatDate(file.createdAt, file._id)}
              </div>
              <div className="text-sm">
                Chart Type: {file.chartType || "N/A"}
              </div>
              <div className="text-sm">
                Size: {(file.size / 1024).toFixed(2)} KB
              </div>
              <div className="text-sm">{file.mimetype}</div>
            </div>

            <div className="mt-3 md:mt-0 space-x-2">
              <Link to={`/dashboard/visualize/${file._id}`}>
                <button className="px-3 py-1 bg-white text-indigo-600 rounded hover:bg-gray-100 transition">
                  📊 Visualize
                </button>
              </Link>
              <a
                href={`http://localhost:5000/api/files/${file._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
                  📥 Download
                </button>
              </a>
              <button
                onClick={() => handleDelete(file._id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}