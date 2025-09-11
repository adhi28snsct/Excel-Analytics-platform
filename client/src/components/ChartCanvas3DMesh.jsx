// src/components/ChartCanvas3DMesh.jsx
import React from "react";
import Plot from "react-plotly.js";

export default function ChartCanvas3DMesh({
  data = [],
  xLabel,
  yLabel,
  zLabel,
  chartTitle = `${yLabel} by ${xLabel} and ${zLabel}`,
  lighting = {
    ambient:   0.3,
    diffuse:   0.9,
    specular:  0.4,
    roughness: 0.6,
    fresnel:   0.2,
  },
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.inner}>
          <div style={styles.message}>
            ⚠️ No data available to render chart.
          </div>
        </div>
      </div>
    );
  }

  // Build maps for categorical axes
  const xCats = [...new Set(data.map((d) => d[xLabel]))];
  const zCats = [...new Set(data.map((d) => d[zLabel]))];
  const xMap  = Object.fromEntries(xCats.map((c, i) => [c, i]));
  const zMap  = Object.fromEntries(zCats.map((c, i) => [c, i]));

  // Normalize Y for visual height
  const rawY = data.map((d) => Number(d[yLabel]) || 0);
  const maxY  = Math.max(...rawY);
  const minY  = Math.min(...rawY);
  const scaleY = (v) =>
    maxY > minY ? ((v - minY) / (maxY - minY)) * 9 + 1 : v;

  const barTraces   = [];
  const labelTraces = [];
  const barW = 0.7, barD = 0.7;

  data.forEach((d, idx) => {
    const xc = d[xLabel], zc = d[zLabel];
    const yv = Number(d[yLabel]) || 0;
    const h  = scaleY(yv);

    const x0 = xMap[xc] - barW/2, x1 = xMap[xc] + barW/2;
    const z0 = zMap[zc] - barD/2, z1 = zMap[zc] + barD/2;
    const y0 = 0,                y1 = h;

    const verts = {
      x: [x0,x1,x1,x0,  x0,x1,x1,x0],
      y: [y0,y0,y0,y0,  y1,y1,y1,y1],
      z: [z0,z0,z1,z1,  z0,z0,z1,z1],
    };

    const faces = [
      [0,1,2],[0,2,3],  // bottom
      [4,5,6],[4,6,7],  // top
      [0,1,5],[0,5,4],  // front
      [1,2,6],[1,6,5],  // right
      [2,3,7],[2,7,6],  // back
      [3,0,4],[3,4,7],  // left
    ];
    const I = faces.map((f) => f[0]);
    const J = faces.map((f) => f[1]);
    const K = faces.map((f) => f[2]);

    // mesh3d bar
    barTraces.push({
      type:      "mesh3d",
      x:         verts.x,
      y:         verts.y,
      z:         verts.z,
      i:         I,
      j:         J,
      k:         K,
      color:     `hsl(${(idx/data.length)*360}, 70%, 50%)`,
      opacity:   1,
      name:      `${xc} / ${zc}: ${yv}`,
      hoverinfo: "name",
      showscale: false,
      lighting,
    });

    // scatter3d label above bar
    labelTraces.push({
      type:       "scatter3d",
      mode:       "text",
      x:          [xMap[xc]],
      y:          [y1 + 0.2],
      z:          [zMap[zc]],
      text:       [`${yv}`],
      textfont:   { size: 12, color: "#000" },
      hoverinfo:  "none",
      showlegend: false,
    });
  });

  const layout = {
    title: chartTitle,
    scene: {
      xaxis: {
        title:    { text: xLabel },
        tickvals: xCats.map((c) => xMap[c]),
        ticktext: xCats,
        showgrid: false,
        zeroline: false,
      },
      yaxis: {
        title:    { text: yLabel },
        showgrid:  true,
        gridcolor: "#ddd",
        zeroline:  false,
      },
      zaxis: {
        title:    { text: zLabel },
        tickvals: zCats.map((c) => zMap[c]),
        ticktext: zCats,
        showgrid: false,
        zeroline: false,
      },
      camera: {
        eye:    { x: 1.8, y: 1.2, z: 1.2 },
        up:     { x: 0,   y: 0,   z: 1   },
        center: { x: 0,   y: 0,   z: 0   },
      },
    },
    margin:       { l: 0, r: 0, b: 0, t: 40 },
    paper_bgcolor:"white",
    plot_bgcolor:"white",
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.inner}>
        <Plot
          data={[...barTraces, ...labelTraces]}
          layout={layout}
          config={{ responsive: true }}
          style={{ width: "100%", height: "650px" }}
        />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background:   "#f7f9fc",
    padding:      "1.5rem",
    borderRadius: "12px",
    boxShadow:    "0 4px 12px rgba(0,0,0,0.05)",
  },
  inner: {
    backgroundColor:"#fff",
    borderRadius:   "8px",
    padding:        "1rem",
    boxShadow:      "0 2px 6px rgba(0,0,0,0.04)",
  },
  message: {
    textAlign: "center",
    color:     "#555",
    fontSize:  "1rem",
  },
};