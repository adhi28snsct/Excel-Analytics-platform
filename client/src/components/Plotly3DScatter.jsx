import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";

export default function Plotly3DScatter({
  chartType,
  xData = [],
  yData = [],
  zData = [],
  xLabel = "X",
  yLabel = "Y",
  zLabel = "Z",
  chartTitle = "3D Scatter Chart"
}) {
  const containerClass =
    "bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform duration-300 hover:shadow-2xl h-[500px]";

  // Use state to manage the data. If no data is passed, use the sample data.
  const [plotXData, setPlotXData] = useState(xData);
  const [plotYData, setPlotYData] = useState(yData);
  const [plotZData, setPlotZData] = useState(zData);
  const [hasData, setHasData] = useState(xData.length > 0 && yData.length > 0);

  // Sample data to demonstrate the chart. This will render if no props are provided.
  const sampleData = {
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [10, 8, 6, 4, 2, 1, 3, 5, 7, 9],
    z: ['A', 'B', 'A', 'C', 'B', 'A', 'A', 'C', 'B', 'A']
  };

  useEffect(() => {
    // If no data is provided via props, use the sample data.
    if (!xData.length || !yData.length) {
      setPlotXData(sampleData.x);
      setPlotYData(sampleData.y);
      setPlotZData(sampleData.z);
      setHasData(true);
    } else {
      setPlotXData(xData);
      setPlotYData(yData);
      setPlotZData(zData);
      setHasData(true);
    }
  }, [xData, yData, zData]);


  if (!hasData) {
    return (
      <div className={`${containerClass} flex flex-col items-center justify-center`}>
        <div className="text-center text-gray-500 text-lg sm:text-xl font-medium">
          <span className="text-4xl">⚠️</span>
          <p className="mt-2">No data available for this 3D chart.</p>
        </div>
      </div>
    );
  }

  const isNumericArray = (arr) => arr.every(val => typeof val === "number");
  const encodeCategories = (values) => {
    const unique = [...new Set(values)];
    const map = {};
    unique.forEach((val, i) => map[val] = i);
    return values.map(val => map[val]);
  };

  const safeZData = plotZData.length
    ? isNumericArray(plotZData) ? plotZData : encodeCategories(plotZData)
    : plotYData.map(() => 0);

  const hoverText = plotXData.map((x, i) =>
    `${xLabel}: ${x}, ${yLabel}: ${plotYData[i]}, ${zLabel}: ${plotZData[i] ?? "N/A"}`
  );

  const layout = {
    title: {
      text: chartTitle,
      font: { size: 20, color: '#333' },
      y: 0.95,
      x: 0.5,
      xanchor: 'center',
      yanchor: 'top',
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    scene: {
      xaxis: { title: xLabel, showgrid: true, gridcolor: "#e0e0e0" },
      yaxis: { title: yLabel, showgrid: true, gridcolor: "#e0e0e0" },
      zaxis: { title: zLabel, showgrid: true, gridcolor: "#e0e0e0" },
      camera: {
        eye: { x: 2.5, y: 1.2, z: 1.2 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 },
      },
      aspectratio: { x: 1, y: 1, z: 1 },
    },
  };

  const plotData = [{
    type: "scatter3d",
    mode: chartType === "line-3d" ? "lines" : "markers",
    x: plotXData,
    y: plotYData,
    z: safeZData,
    marker: chartType === "line-3d" ? undefined : {
      size: 6,
      color: safeZData,
      colorscale: "Viridis",
      opacity: 0.8,
      line: {
        color: 'white',
        width: 1
      },
      lighting: {
        ambient: 0.5,
        diffuse: 1,
        specular: 0.5,
        roughness: 0.9,
        fresnel: 0.2,
      },
    },
    line: chartType === "line-3d" ? {
      color: "green",
      width: 4,
    } : undefined,
    text: hoverText,
    hoverinfo: "text",
  }];

  return (
    <div className={containerClass}>
      <Plot
        data={plotData}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
