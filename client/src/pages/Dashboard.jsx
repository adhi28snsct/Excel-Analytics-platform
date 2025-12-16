import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
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
        const res = await api.get("/api/files", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedFiles = Array.isArray(res.data.files)
          ? res.data.files
          : [];

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
          <h2 className="text-3xl font-extrabold text-gray-800">
            📊 Dashboard
          </h2>

          {files.length > 0 && (
            <button
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition"
            >
              Download Report
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg">
              No files uploaded yet.
            </p>
          </div>
        ) : (
          <div ref={tableRef} className="overflow-x-auto rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">
                    Chart Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">
                    Size (KB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500">
                    Uploaded At
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file._id}>
                    <td className="px-6 py-4">{file.filename}</td>
                    <td className="px-6 py-4">
                      {file.chartType || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {file.size ? Math.round(file.size / 1024) : 0}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(file.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleVisualize(file._id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-full"
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
