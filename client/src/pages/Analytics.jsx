import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Analytics() {
  const { id } = useParams(); // fileId
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/files/${id}/analysis`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch analysis');
        }

        const result = await response.json();
        setAnalysis(result);
      } catch (err) {
        setError(err.message);
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-200 via-purple-300 to-indigo-700 font-sans">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800">📊 File Analysis</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full shadow hover:bg-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Go Back</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl mb-4 font-medium text-center">
            {error}
          </div>
        )}

        {!loading && !error && analysis && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3 border border-gray-100">
              <p className="text-gray-700"><strong>Filename:</strong> <span className="text-indigo-600 font-medium">{analysis.filename}</span></p>
              <p className="text-gray-700"><strong>Chart Type:</strong> <span className="text-indigo-600 font-medium">{analysis.chartType}</span></p>
              <p className="text-gray-700"><strong>X Axis:</strong> <span className="text-indigo-600 font-medium">{analysis.xAxis}</span></p>
              <p className="text-gray-700"><strong>Y Axis:</strong> <span className="text-indigo-600 font-medium">{analysis.yAxis}</span></p>
              {analysis.zAxis && <p className="text-gray-700"><strong>Z Axis:</strong> <span className="text-indigo-600 font-medium">{analysis.zAxis}</span></p>}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📄 Data Preview</h3>
              {inferredColumns.length > 0 ? (
                <div className="overflow-auto max-h-[400px] border border-gray-200 rounded-lg shadow-inner">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {inferredColumns.map((col) => (
                          <th key={col} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysis.rawData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-100 transition-colors">
                          {inferredColumns.map((col) => (
                            <td
                              key={col}
                              className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                                [analysis.xAxis, analysis.yAxis, analysis.zAxis].includes(col)
                                  ? 'text-purple-600 font-semibold'
                                  : ''
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
                <p className="text-gray-500 text-center py-6">No columns detected in this analysis.</p>
              )}
            </div>

            <button
              className="w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-colors transform hover:scale-105"
              onClick={() => navigate(`/dashboard/chart/${analysis.file}`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>View Chart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
