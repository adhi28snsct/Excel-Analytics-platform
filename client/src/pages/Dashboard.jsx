// src/components/Dashboard.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const tableRef = useRef(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/files", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📦 API response:", res.data);

        const fetchedFiles = Array.isArray(res.data.files) ? res.data.files : [];
        console.log("✅ Parsed files:", fetchedFiles);

        setFiles(fetchedFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [token]);

  const handleVisualize = (fileId) => {
    navigate(`/dashboard/visualize/${fileId}`);
  };

  const handleDownloadReport = async () => {
    if (!tableRef.current) return;

    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = margin;

    doc.setFontSize(18);
    doc.text("Uploaded Files Report", margin, y);
    y += 30;
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 20;

    const pdfW = doc.internal.pageSize.getWidth() - margin * 2;
    const { width, height } = doc.getImageProperties(imgData);
    const pdfH = (height * pdfW) / width;
    doc.addImage(imgData, "PNG", margin, y, pdfW, pdfH);

    doc.save("files-report.pdf");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-600">
      <div className="max-w-6xl mx-auto bg-white/80 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Uploaded Files</h2>

        {files.length > 0 && (
          <button
            onClick={handleDownloadReport}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download PDF Report
          </button>
        )}

        {files.length === 0 ? (
          <p className="text-gray-700">No files uploaded yet.</p>
        ) : (
          <div ref={tableRef} className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border">File Name</th>
                  <th className="px-4 py-2 border">Chart Type</th>
                  <th className="px-4 py-2 border">Size (KB)</th>
                  <th className="px-4 py-2 border">Uploaded At</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{file.filename}</td>
                    <td className="px-4 py-2 border">{file.chartType || "—"}</td>
                    <td className="px-4 py-2 border">{file.size ? Math.round(file.size / 1024) : 0}</td>
                    <td className="px-4 py-2 border">{new Date(file.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleVisualize(file._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Visualize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}