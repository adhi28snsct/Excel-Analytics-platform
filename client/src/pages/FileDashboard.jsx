import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ---------------- Search Bar ---------------- */
const SearchBar = ({ placeholder = "Search...", onSearch, delay = 500 }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timerId = setTimeout(() => onSearch(searchTerm), delay);
    return () => clearTimeout(timerId);
  }, [searchTerm, delay, onSearch]);

  return (
    <div className="flex items-center w-full max-w-2xl mx-auto bg-white rounded-full shadow-lg p-2">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};

/* ---------------- File Card ---------------- */
const FileCard = ({ file, onDelete }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between">
      <div>
        <h3 className="font-semibold">{file.filename}</h3>
        <p className="text-sm text-gray-500">
          Uploaded on {new Date(file.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/dashboard/analytics/${file._id}`)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-full"
        >
          View
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-full"
        >
          Delete
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow">
            <p className="mb-4">Delete this file?</p>
            <div className="flex gap-3">
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

/* ---------------- Dashboard ---------------- */
const FileDashboardComponent = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get("/api/files", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFiles(res.data.files || []);
        setStatus(`Showing ${res.data.files?.length || 0} file(s)`);
      })
      .catch((err) => {
        console.error(err);
        if ([401, 403].includes(err.response?.status)) {
          navigate("/login");
        }
        setFiles([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.delete(`/api/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles((prev) => prev.filter((f) => f._id !== id));
      setStatus("File deleted successfully");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 p-6">
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        📁 Your Uploaded Files
      </h1>

      <SearchBar onSearch={setSearchTerm} />

      {status && (
        <div className="text-center bg-white p-3 rounded my-4">
          {status}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredFiles.length ? (
        <div className="space-y-4 mt-6">
          {filteredFiles.map((file) => (
            <FileCard key={file._id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <p className="text-center text-white mt-12">
          No files available yet
        </p>
      )}
    </div>
  );
};

export default FileDashboardComponent;
