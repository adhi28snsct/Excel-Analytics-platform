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
      <div className="flex items-center justify-center h-screen text-white bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-600 font-sans">
      <div className="max-w-6xl mx-auto bg-white/90 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">📊 Dashboard</h2>
          {files.length > 0 && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-colors transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L10 10.586V3a1 1 0 10-2 0v7.586l-1.293-1.293z" clipRule="evenodd" />
              </svg>
              <span>Download Report</span>
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 text-lg">No files uploaded yet.</p>
            <p className="text-gray-500 text-sm mt-1">Start by uploading a file to see it here.</p>
          </div>
        ) : (
          <div ref={tableRef} className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-xl">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Chart Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Size (KB)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Uploaded At</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tr-xl">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file, idx) => (
                  <tr key={idx} className="hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{file.filename}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{file.chartType || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{file.size ? Math.round(file.size / 1024) : 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(file.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleVisualize(file._id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition-colors"
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
