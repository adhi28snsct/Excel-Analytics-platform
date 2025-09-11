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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-indigo-400 to-blue-500">
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Upload Excel File</h2>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="border p-2 w-full"
          disabled={isUploading}
        />
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`mt-4 px-4 py-2 rounded text-white w-full ${
            isUploading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        {status && (
          <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{status}</p>
        )}
      </div>
    </div>
  );
}