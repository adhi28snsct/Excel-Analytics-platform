// src/components/Plotly3DScatter.jsx
import React from "react";
import Plot from "react-plotly.js";

export default function Plotly3DScatter({
  chartType,
  xData = [],
  yData = [],
  zData = [],
  xLabel = "X",
  yLabel = "Y",
  zLabel = "Z",
  width = 500,
  height = 400,
  chartTitle = "3D Scatter Chart"
}) {
  if (!xData.length || !yData.length) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  const isNumericArray = (arr) => arr.every(val => typeof val === "number");
  const encodeCategories = (values) => {
    const unique = [...new Set(values)];
    const map = {};
    unique.forEach((val, i) => map[val] = i);
    return values.map(val => map[val]);
  };

  const safeZData = zData.length
    ? isNumericArray(zData) ? zData : encodeCategories(zData)
    : yData.map(() => 0);

  const hoverText = xData.map((x, i) =>
    `${xLabel}: ${x}, ${yLabel}: ${yData[i]}, ${zLabel}: ${zData[i] ?? "N/A"}`
  );

  const layout = {
    title: chartTitle,
    margin: { l: 0, r: 0, b: 0, t: 30 },
    width,
    height,
    scene: {
      xaxis: { title: xLabel },
      yaxis: { title: yLabel },
      zaxis: { title: zLabel },
      camera: {
        eye: { x: 2.5, y: 1.2, z: 1.2 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 },
      },
    },
  };

  const plotData = [{
    type: "scatter3d",
    mode: chartType === "line-3d" ? "lines" : "markers",
    x: xData,
    y: yData,
    z: safeZData,
    marker: chartType === "line-3d" ? undefined : {
      size: 6,
      color: safeZData,
      colorscale: "Viridis",
      opacity: 0.8,
    },
    line: chartType === "line-3d" ? {
      color: "green",
      width: 4,
    } : undefined,
    text: hoverText,
    hoverinfo: "text",
  }];

  return (
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true }}
      style={{ width: "100%", height: "100%" }}
    />
  );
}