import React from "react";
import Plot from "react-plotly.js";

export default function ChartCanvas3DMesh({
  data = [],
  xLabel,
  yLabel,
  zLabel,
  chartTitle = `${yLabel} by ${xLabel} and ${zLabel}`,
  lighting = {
    ambient: 0.5,
    diffuse: 1,
    specular: 0.6,
    roughness: 0.6,
    fresnel: 0.2,
  },
}) {
  const containerClass =
    "bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform duration-300 hover:shadow-2xl h-[500px]";

  if (!Array.isArray(data) || data.length === 0 || !xLabel || !yLabel || !zLabel) {
    return (
      <div className={`${containerClass} flex flex-col items-center justify-center`}>
        <div className="text-center text-gray-500 text-lg sm:text-xl font-medium">
          <span className="text-4xl">⚠️</span>
          <p className="mt-2">No data available for this 3D chart.</p>
        </div>
      </div>
    );
  }

  // Build maps for categorical axes
  const xCats = [...new Set(data.map((d) => d[xLabel]))];
  const zCats = [...new Set(data.map((d) => d[zLabel]))];
  const xMap = Object.fromEntries(xCats.map((c, i) => [c, i]));
  const zMap = Object.fromEntries(zCats.map((c, i) => [c, i]));

  // Normalize Y for visual height and color scaling
  const rawY = data.map((d) => Number(d[yLabel]) || 0);
  const maxY = Math.max(...rawY);
  const minY = Math.min(...rawY);

  const barTraces = [];
  const labelTraces = [];
  const barW = 0.7,
    barD = 0.7;

  data.forEach((d, idx) => {
    const xc = d[xLabel],
      zc = d[zLabel];
    const yv = Number(d[yLabel]) || 0;
    const h = (yv - minY) / (maxY - minY); // Normalized height from 0 to 1

    const x0 = xMap[xc] - barW / 2,
      x1 = xMap[xc] + barW / 2;
    const z0 = zMap[zc] - barD / 2,
      z1 = zMap[zc] + barD / 2;
    const y0 = 0,
      y1 = h * 10; // Scale height for better visual proportion

    const verts = {
      x: [x0, x1, x1, x0, x0, x1, x1, x0],
      y: [y0, y0, y0, y0, y1, y1, y1, y1],
      z: [z0, z0, z1, z1, z0, z0, z1, z1],
    };

    const faces = [
      [0, 1, 2], [0, 2, 3], // bottom
      [4, 5, 6], [4, 6, 7], // top
      [0, 1, 5], [0, 5, 4], // front
      [1, 2, 6], [1, 6, 5], // right
      [2, 3, 7], [2, 7, 6], // back
      [3, 0, 4], [3, 4, 7], // left
    ];
    const I = faces.map((f) => f[0]);
    const J = faces.map((f) => f[1]);
    const K = faces.map((f) => f[2]);

    const vertexColors = [
      '#a1c9f4', '#a1c9f4', '#a1c9f4', '#a1c9f4', // bottom face colors
      '#6495ed', '#6495ed', '#6495ed', '#6495ed', // top face colors
    ];

    // mesh3d bar
    barTraces.push({
      type: "mesh3d",
      x: verts.x,
      y: verts.y,
      z: verts.z,
      i: I,
      j: J,
      k: K,
      vertexcolor: vertexColors,
      opacity: 0.8,
      name: `${xc} / ${zc}: ${yv}`,
      hoverinfo: "name",
      showscale: false,
      lighting,
    });

    // scatter3d label above bar
    labelTraces.push({
      type: "scatter3d",
      mode: "text",
      x: [xMap[xc]],
      y: [y1 + 0.2],
      z: [zMap[zc]],
      text: [`${yv}`],
      textfont: { size: 12, color: "#000" },
      hoverinfo: "none",
      showlegend: false,
    });
  });

  const layout = {
    title: {
      text: chartTitle,
      font: { size: 20, color: '#333' },
      y: 0.95,
      x: 0.5,
      xanchor: 'center',
      yanchor: 'top',
    },
    scene: {
      xaxis: {
        title: { text: xLabel, font: { size: 14 } },
        tickvals: xCats.map((c) => xMap[c]),
        ticktext: xCats,
        showgrid: true,
        zeroline: false,
        gridcolor: "#e0e0e0",
      },
      yaxis: {
        title: { text: yLabel, font: { size: 14 } },
        showgrid: true,
        gridcolor: "#e0e0e0",
        zeroline: false,
      },
      zaxis: {
        title: { text: zLabel, font: { size: 14 } },
        tickvals: zCats.map((c) => zMap[c]),
        ticktext: zCats,
        showgrid: true,
        gridcolor: "#e0e0e0",
        zeroline: false,
      },
      camera: {
        eye: { x: 1.8, y: 1.2, z: 1.2 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 },
      },
      bgcolor: "white",
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
  };

  return (
    <div className={containerClass}>
      <Plot
        data={[...barTraces, ...labelTraces]}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
