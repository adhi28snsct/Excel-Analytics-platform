import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// A debounced search bar component.
const SearchBar = ({ placeholder = "Search...", onSearch, delay = 500 }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Use a debouncing effect to delay the onSearch callback.
  useEffect(() => {
    // Set a timeout to call the onSearch function.
    const timerId = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);

    // Cleanup function to clear the previous timeout.
    // This runs on every re-render and component unmount.
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, delay, onSearch]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex items-center w-full max-w-2xl mx-auto bg-white rounded-full shadow-lg p-2 transition-all duration-300 hover:shadow-xl focus-within:ring-2 focus-within:ring-indigo-500">
      <div className="p-2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};

// A clean, well-styled component for each file card.
const FileCard = ({ file, onDelete }) => {
  const navigate = useNavigate();
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

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-5 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 transition-transform transform hover:scale-[1.01] hover:shadow-2xl">
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-lg font-semibold text-gray-800">{file.filename}</h3>
        <p className="text-sm text-gray-500 mt-1">
          Uploaded on: {new Date(file.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto justify-end">
        <button
          onClick={() => navigate(`/dashboard/analytics/${file._id}`)}
          className="px-6 py-2 rounded-full font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
        >
          View Analytics
        </button>
        <button
          onClick={confirmDelete}
          className="px-6 py-2 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md"
        >
          Delete
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

// Main dashboard component that fetches and displays files
const FileDashboardComponent = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

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

  // Filter files based on the search term
  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">
          📁 Your Uploaded Files
        </h1>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} placeholder="Search by filename..." />
        </div>

        {status && (
          <div className="mb-6 p-4 rounded-xl text-center font-medium bg-white/70 backdrop-blur-md text-gray-800 shadow-md">
            {status}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredFiles.length > 0 ? (
          <div className="space-y-6">
            {filteredFiles.map((file) => (
              <FileCard key={file._id} file={file} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-gray-200 text-center py-12 text-lg">
            No files available yet. Start uploading to see them here!
          </div>
        )}
      </div>
    </div>
  );
};

// Main App component to handle routing
export default FileDashboardComponent;
