import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ChartView from '../components/ChartView.jsx';
import Plotly3DScatter from '../components/Plotly3DScatter.jsx';
import ChartCanvas3DMesh from '../components/ChartCanvas3DMesh.jsx';
import Plotly3DPie from './Plotly3DPie';

const availableChartTypes = [
  { label: 'Bar', value: 'bar' },
  { label: 'Line', value: 'line' },
  { label: 'Pie', value: 'pie' },
  { label: 'Scatter', value: 'scatter' },
  { label: '3D Scatter', value: '3d-scatter' },
  { label: '3D Bar', value: 'bar-3d' },
  { label: '3D Pie', value: 'pie-3d' },
];

export default function Chart({ fileId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const plotlyRef = useRef();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        if (!fileId || fileId.trim().length !== 24) throw new Error('Invalid file ID format');

        const res = await axios.get(
          `http://localhost:5000/api/analysis/${fileId.trim()}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        console.log("✅ Chart Data from API:", res.data);

        const { chartType } = res.data;
        setChartData(res.data);

        const normalizeChartType = (type) => {
          const map = {
            'bar-3d': 'bar-3d',
            '3d-bar': 'bar-3d',
            'scatter-3d': '3d-scatter',
            'pie-3d': 'pie-3d',
          };
          const normalized = (type || 'bar').toLowerCase();
          return availableChartTypes.some(t => t.value === map[normalized] || normalized)
            ? map[normalized] || normalized
            : 'bar';
        };

        setSelectedChartType(normalizeChartType(chartType));
      } catch (err) {
        console.error('❌ Error fetching analysis:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load chart');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [fileId]);

  if (loading) return <div className="text-center text-gray-600 mt-10">📦 Loading chart...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">❌ {error}</div>;
  if (!chartData) return <div className="text-center text-yellow-500 mt-10">⚠️ No chart data available</div>;

  const {
    xAxis = 'X-Axis',
    yAxis = 'Y-Axis',
    zAxis = 'Z-Axis',
    chartData: chartPoints = [],
  } = chartData;

  const xData = chartPoints.map(p => p[xAxis]);
  const yData = chartPoints.map(p => p[yAxis]);
  const zData = chartPoints.map(p => p[zAxis]);
  const labels = xData;

  return (
    <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-500">
      <div className="bg-white rounded-xl p-6 shadow space-y-6">
        <div className="flex items-center gap-4">
          <label className="font-semibold text-gray-700">Chart Type:</label>
          <select
            value={selectedChartType}
            onChange={(e) => setSelectedChartType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            {availableChartTypes.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {selectedChartType === '3d-scatter' ? (
          <Plotly3DScatter
            xData={xData}
            yData={yData}
            zData={zData}
            xLabel={xAxis}
            yLabel={yAxis}
            zLabel={zAxis}
          />
        ) : selectedChartType === 'bar-3d' ? (
          <ChartCanvas3DMesh
            data={chartPoints}
            xLabel={xAxis}
            yLabel={yAxis}
            zLabel={zAxis}
            plotlyRef={plotlyRef}
          />
        ) : selectedChartType === 'pie-3d' ? (
          <Plotly3DPie
            data={chartPoints}
            labels={xAxis}
            values={yAxis}
            chartTitle="3D Pie Chart"
          />
        ) : (
          <ChartView
            chartType={selectedChartType}
            xData={xData}
            yData={yData}
            zData={zData}
            labels={labels}
            xLabel={xAxis}
            yLabel={yAxis}
            zLabel={zAxis}
          />
        )}
      </div>
    </div>
  );
}