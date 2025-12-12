import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import Plotly3DChart from './Plotly3DScatter';
import ChartCanvas3DMesh from './ChartCanvas3DMesh';
import Plotly3DPie from './Plotly3DPie';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function ChartView({
  chartType,
  xData = [],
  yData = [],
  zData = [],
  datasets,
  labels,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  zLabel = 'Z Axis',
  width = '100%',
  height = '500px',
}) {
  const chartTitleMap = {
    bar: 'Bar Chart',
    line: 'Line Chart',
    pie: 'Pie Chart',
    scatter: 'Scatter Chart',
    'bar-3d': '3D Bar Chart',
    'pie-3d': '3D Pie Chart',
    '3d-scatter': '3D Scatter Chart',
  };

  const pieLabelKey = xLabel || 'Category';
  const pieValueKey = yLabel || 'Value';

  const containerClass =
    'bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform duration-300 hover:shadow-2xl';
  const chartContainerStyle = { width, height };

  // 3D Bar
  if (chartType === 'bar-3d') {
    const meshData = xData.map((x, i) => ({
      [xLabel]: x,
      [yLabel]: yData[i],
      [zLabel]: zData[i],
    }));

    return (
      <div id="chart-container" className={containerClass}>
        <ChartCanvas3DMesh
          data={meshData}
          xLabel={xLabel}
          yLabel={yLabel}
          zLabel={zLabel}
          chartTitle={chartTitleMap[chartType]}
        />
      </div>
    );
  }

  // 3D Pie
  if (chartType === 'pie-3d') {
    const pieData = xData.map((x, i) => ({
      [pieLabelKey]: x,
      [pieValueKey]: yData[i],
    }));

    return (
      <div id="chart-container" className={containerClass}>
        <Plotly3DPie
          data={pieData}
          labels={pieLabelKey}
          values={pieValueKey}
          chartTitle={chartTitleMap[chartType]}
        />
      </div>
    );
  }

  // 3D Scatter
  if (chartType === '3d-scatter') {
    return (
      <div id="chart-container" className={containerClass}>
        <Plotly3DChart
          chartType={chartType}
          xData={xData}
          yData={yData}
          zData={zData}
          xLabel={xLabel}
          yLabel={yLabel}
          zLabel={zLabel}
          width={width}
          height={height}
          chartTitle={chartTitleMap[chartType]}
        />
      </div>
    );
  }

  // 2D Charts: no data
  if (!xData.length || !yData.length) {
    return (
      <div className={containerClass} style={chartContainerStyle}>
        <div className="text-center text-gray-500 text-lg sm:text-xl font-medium">
          <span className="text-4xl">⚠️</span>
          <p className="mt-2">
            No data available for {chartTitleMap[chartType] || 'this chart'}
          </p>
        </div>
      </div>
    );
  }

  // 2D Charts: bar, line, pie, scatter
  const chartDataConfig = {
    labels,
    datasets:
      datasets || [
        {
          label: `${yLabel} vs ${xLabel}`,
          data: yData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: 'rgba(0,0,0,0.1)',
          borderWidth: 1,
        },
      ],
  };

  const chartMap = { bar: Bar, line: Line, pie: Pie, scatter: Scatter };
  const ChartComponent = chartMap[chartType];

  if (ChartComponent) {
    return (
      <div id="chart-container" className={containerClass} style={chartContainerStyle}>
        <div style={{ height: `calc(${height} - 60px)` }}>
          <ChartComponent
            data={chartDataConfig}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: {
                  display: true,
                  text: chartTitleMap[chartType] || 'Chart',
                  font: { size: 18, weight: 'bold' },
                },
              },
              scales:
                chartType !== 'pie'
                  ? {
                      x: {
                        title: { display: true, text: xLabel, font: { weight: 'bold' } },
                      },
                      y: {
                        title: { display: true, text: yLabel, font: { weight: 'bold' } },
                      },
                    }
                  : {},
            }}
          />
        </div>
      </div>
    );
  }

  // Fallback for unsupported types
  return (
    <div
      className={`${containerClass} flex flex-col items-center justify-center`}
      style={chartContainerStyle}
    >
      <div className="text-center text-red-500 text-lg sm:text-xl font-medium">
        <span className="text-4xl">⚠️</span>
        <p className="mt-2">
          Unsupported chart type: <strong className="font-bold">{chartType}</strong>
        </p>
      </div>
    </div>
  );
}