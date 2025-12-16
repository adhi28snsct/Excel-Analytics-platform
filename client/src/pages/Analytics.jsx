import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Analytics() {
  const { id } = useParams(); // fileId
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get(`/api/files/${id}/analysis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ Axios returns data directly
        setAnalysis(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch analysis"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  const inferredColumns = analysis?.availableColumns?.length
    ? analysis.availableColumns
    : Object.keys(analysis?.rawData?.[0] || {});

  return (
    <div className="min-h-screen flex items-center see justify-center p-6 bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 font-sans">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">
            📊 File Analysis
          </h2>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full shadow hover:bg-gray-300 transition-colors"
          >
            <span>⬅ Go Back</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl mb-4 text-center font-medium">
            {error}
          </div>
        )}

        {!loading && !error && analysis && (
          <div className="space-y-8">
            {/* Metadata */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3 border border-gray-100">
              <p>
                <strong>Filename:</strong>{" "}
                <span className="text-indigo-600">{analysis.filename}</span>
              </p>
              <p>
                <strong>Chart Type:</strong>{" "}
                <span className="text-indigo-600">{analysis.chartType}</span>
              </p>
              <p>
                <strong>X Axis:</strong>{" "}
                <span className="text-indigo-600">{analysis.xAxis}</span>
              </p>
              <p>
                <strong>Y Axis:</strong>{" "}
                <span className="text-indigo-600">{analysis.yAxis}</span>
              </p>
              {analysis.zAxis && (
                <p>
                  <strong>Z Axis:</strong>{" "}
                  <span className="text-indigo-600">{analysis.zAxis}</span>
                </p>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4">📄 Data Preview</h3>

              {inferredColumns.length > 0 ? (
                <div className="overflow-auto max-h-[400px] border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {inferredColumns.map((col) => (
                          <th
                            key={col}
                            className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.rawData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-100">
                          {inferredColumns.map((col) => (
                            <td
                              key={col}
                              className={`px-6 py-3 text-sm ${
                                [analysis.xAxis, analysis.yAxis, analysis.zAxis].includes(
                                  col
                                )
                                  ? "text-purple-600 font-semibold"
                                  : "text-gray-900"
                              }`}
                            >
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  No columns detected.
                </p>
              )}
            </div>

            <button
              onClick={() => navigate(`/dashboard/chart/${analysis.file}`)}
              className="w-full py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
            >
              📈 View Chart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
