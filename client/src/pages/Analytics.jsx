import { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-b from-purple-200 to-purple-400 p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📊 File Analysis</h2>

      {loading && <p className="text-gray-700">Loading...</p>}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {!loading && !error && analysis && (
        <div className="bg-white shadow p-6 rounded-md">
          <div className="mb-4 space-y-1">
            <p><strong>Filename:</strong> {analysis.filename}</p>
            <p><strong>Chart Type:</strong> {analysis.chartType}</p>
            <p><strong>X Axis:</strong> {analysis.xAxis}</p>
            <p><strong>Y Axis:</strong> {analysis.yAxis}</p>
            {analysis.zAxis && <p><strong>Z Axis:</strong> {analysis.zAxis}</p>}
          </div>

          <h3 className="text-lg font-semibold mb-2">📄 Data Preview</h3>
          {inferredColumns.length > 0 ? (
            <div className="overflow-auto max-h-[400px] border rounded">
              <table className="table-auto w-full border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    {inferredColumns.map((col) => (
                      <th key={col} className="border px-3 py-2 text-left font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.rawData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {inferredColumns.map((col) => (
                        <td
                          key={col}
                          className={`border px-3 py-2 ${
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
            <p className="text-gray-500">No columns detected in this analysis.</p>
          )}

          <button
            className="mt-6 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={() => navigate(`/dashboard/chart/${analysis.file}`)} // ✅ file is the ObjectId
          >
            View Chart
          </button>
        </div>
      )}
    </div>
  );
}