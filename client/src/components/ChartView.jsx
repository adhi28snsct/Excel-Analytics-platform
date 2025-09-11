import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
} from "chart.js";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import Plotly3DChart from "./Plotly3DScatter";
import ChartCanvas3DMesh from "./ChartCanvas3DMesh";
import Plotly3DPie from "./Plotly3DPie";

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
  xLabel = "X Axis",
  yLabel = "Y Axis",
  zLabel = "Z Axis",
  width = 500,
  height = 400,
}) {
  const plotlyRef = useRef();

  const chartTitleMap = {
    bar: "Bar Chart",
    line: "Line Chart",
    pie: "Pie Chart",
    scatter: "Scatter Chart",
    "bar-3d": "3D Bar Chart",
    "pie-3d": "3D Pie Chart",
    "3d-scatter": "3D Scatter Chart",
  };

  const pieLabelKey = xLabel || "Category";
  const pieValueKey = yLabel || "Value";

  const handleDownloadPDF = async () => {
    const chartElement = document.querySelector("#chart-container");
    if (!chartElement) return;

    const canvas = await html2canvas(chartElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${chartType}-chart.pdf`);
  };

  if (!xData.length || !yData.length) {
    return (
      <div className="text-center text-yellow-500 mt-4">
        ⚠️ No data available for {chartTitleMap[chartType] || "chart"}
      </div>
    );
  }

  const renderDownloadButton = () => (
    <button
      onClick={handleDownloadPDF}
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      📄 Download as PDF
    </button>
  );

  if (chartType === "bar-3d") {
    const meshData = xData.map((x, i) => ({
      [xLabel]: x,
      [yLabel]: yData[i],
      [zLabel]: zData[i],
    }));

    return (
      <div id="chart-container" className="rounded-lg bg-white shadow-md p-4">
        <ChartCanvas3DMesh
          data={meshData}
          xLabel={xLabel}
          yLabel={yLabel}
          zLabel={zLabel}
          chartTitle={chartTitleMap[chartType]}
          plotlyRef={plotlyRef}
        />
        {renderDownloadButton()}
      </div>
    );
  }

  if (chartType === "pie-3d") {
    const pieData = xData.map((x, i) => ({
      [pieLabelKey]: x,
      [pieValueKey]: yData[i],
    }));

    return (
      <div id="chart-container" className="rounded-lg bg-white shadow-md p-4">
        <Plotly3DPie
          data={pieData}
          labels={pieLabelKey}
          values={pieValueKey}
          chartTitle={chartTitleMap[chartType]}
        />
        {renderDownloadButton()}
      </div>
    );
  }

  if (chartType === "3d-scatter") {
    return (
      <div id="chart-container" className="rounded-lg bg-white shadow-md p-4">
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
        {renderDownloadButton()}
      </div>
    );
  }

  const chartData = {
    labels,
    datasets: datasets || [
      {
        label: `${yLabel} vs ${xLabel}`,
        data: yData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: "rgba(0,0,0,0.1)",
        borderWidth: 1,
      },
    ],
  };

  const chartMap = {
    bar: Bar,
    line: Line,
    pie: Pie,
    scatter: Scatter,
  };

  const ChartComponent = chartMap[chartType];

  if (ChartComponent) {
    return (
      <div id="chart-container" className="rounded-lg bg-white shadow-md p-4" style={{ width, height }}>
        <ChartComponent
          data={chartData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: chartTitleMap[chartType] || "Chart",
              },
            },
            scales:
              chartType !== "pie"
                ? {
                    x: { title: { display: true, text: xLabel } },
                    y: { title: { display: true, text: yLabel } },
                  }
                : {},
          }}
        />
        {renderDownloadButton()}
      </div>
    );
  }

  return (
    <div className="text-red-500 p-4">
      ⚠️ Unsupported chart type: <strong>{chartType}</strong>
    </div>
  );
}