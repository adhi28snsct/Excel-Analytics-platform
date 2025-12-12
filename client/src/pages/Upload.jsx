import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const fileRef = useRef();
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return setStatus("⚠️ Please select an Excel file first.");

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("🔒 Not authenticated. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setIsUploading(true);
      const response = await axios.post("http://localhost:5000/api/files/upload", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { message, analysisId, fileId } = response.data;
      setStatus(`✅ ${message}`);
      console.log("📦 Upload successful:", { analysisId, fileId });
    } catch (err) {
      console.error("❌ Upload error:", err);
      setStatus(err.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-indigo-400 to-blue-500 font-sans">
      <div className="p-8 max-w-md w-full bg-white rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Upload Excel File
        </h2>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="border border-gray-300 rounded-xl p-3 w-full text-sm text-gray-700
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
          disabled={isUploading}
        />
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`mt-6 px-6 py-3 rounded-xl text-white font-bold w-full transition-all duration-300 shadow-md transform hover:scale-105
            ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        {status && (
          <div className={`mt-6 p-4 rounded-xl shadow-sm border
            ${status.includes("✅") ? "bg-green-100 border-green-400 text-green-700" :
            status.includes("⚠️") ? "bg-yellow-100 border-yellow-400 text-yellow-700" :
            "bg-red-100 border-red-400 text-red-700"}`}>
            <p className="text-sm whitespace-pre-line font-medium">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
