// src/pages/FileDashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FileCard from "../components/FileCard";

export default function FileDashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found. Redirecting to login...");
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("📦 API response:", res.data);
        const data = res.data;

        if (Array.isArray(data.files)) {
          setFiles(data.files);
          setStatus(`Showing ${data.files.length} uploaded file(s)`);
        } else {
          console.warn("Unexpected response format:", data);
          setFiles([]);
          setStatus("⚠️ No files found in response");
        }
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err.response?.data || err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
        }
        setFiles([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("⚠️ Cannot delete without authentication");
      return;
    }

    try {
      const res = await axios.delete(`http://localhost:5000/api/files/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setFiles((prev) => prev.filter((file) => file._id !== id));
        setStatus(`✅ File deleted at ${new Date().toLocaleTimeString()}`);
        setTimeout(() => setStatus(""), 3000);
      } else {
        console.warn("Unexpected delete response:", res);
      }
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-200 to-indigo-300">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">📁 Uploaded Files</h1>

        {status && <div className="text-green-600 mb-4">{status}</div>}

        {loading ? (
          <p className="text-gray-600 animate-pulse">Loading files...</p>
        ) : files.length > 0 ? (
          <div className="space-y-4">
            {files.map((file) => (
              <FileCard key={file._id} file={file} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No files available yet.</p>
        )}
      </div>
    </div>
  );
}