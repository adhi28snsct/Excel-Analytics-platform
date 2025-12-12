import React from 'react';
import Plot from 'react-plotly.js';

export default function Plotly3DPie3D({
  data,
  labels = 'Category',
  values = 'Value',
  chartTitle = '3D Pie Chart',
}) {
  const containerClass =
    "bg-white rounded-xl shadow-lg p-6 sm:p-8 transform transition-transform duration-300 hover:shadow-2xl h-[500px]";

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className={`${containerClass} flex flex-col items-center justify-center`}>
        <div className="text-center text-gray-500 text-lg sm:text-xl font-medium">
          <span className="text-4xl">⚠️</span>
          <p className="mt-2">No data available for this 3D chart.</p>
        </div>
      </div>
    );
  }

  // 1) Aggregate values by category
  const categoryMap = {};
  data.forEach(pt => {
    const key = pt[labels];
    const val = parseFloat(pt[values]) || 0;
    categoryMap[key] = (categoryMap[key] || 0) + val;
  });

  const cats = Object.keys(categoryMap);
  const vals = Object.values(categoryMap);
  const total = vals.reduce((sum, v) => sum + v, 0);

  // 2) Build mesh3d slices + scatter3d labels
  const meshTraces = [];
  const labelTraces = [];
  let startA = 0;
  const NPTS = 50;   // more points ⇒ smoother curve
  const TOPZ = 0.3;  // slice height

  cats.forEach((cat, idx) => {
    const v = vals[idx];
    const angle = (v / total) * Math.PI * 2;
    const endA = startA + angle;
    const theta = Array.from({ length: NPTS }, (_, j) =>
      startA + (j / NPTS) * angle
    );

    // generate vertices
    const x = [], y = [], z = [];
    // top ring
    theta.forEach(t => { x.push(Math.cos(t)); y.push(Math.sin(t)); z.push(TOPZ); });
    // bottom ring
    theta.forEach(t => { x.push(Math.cos(t)); y.push(Math.sin(t)); z.push(0); });
    // center top & bottom
    const topCenterIdx = x.length;
    x.push(0); y.push(0); z.push(TOPZ);
    const botCenterIdx = x.length;
    x.push(0); y.push(0); z.push(0);

    // build face indices
    const I = [], J = [], K = [];
    // top fan
    for (let j = 0; j < NPTS; j++) {
      I.push(topCenterIdx);
      J.push(j);
      K.push((j + 1) % NPTS);
    }
    // bottom fan (reverse winding)
    for (let j = 0; j < NPTS; j++) {
      I.push(botCenterIdx);
      J.push(NPTS + ((j + 1) % NPTS));
      K.push(NPTS + j);
    }
    // side walls
    for (let j = 0; j < NPTS; j++) {
      const nxt = (j + 1) % NPTS;
      // quad split into two triangles
      I.push(j);      J.push(NPTS + j); K.push(nxt);
      I.push(nxt);    J.push(NPTS + j); K.push(NPTS + nxt);
    }

    // Define a professional color palette
    const colorPalette = [
      '#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FFA15A', '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52'
    ];

    // mesh3d slice
    meshTraces.push({
      type: 'mesh3d',
      x, y, z,
      i: I,
      j: J,
      k: K,
      color: colorPalette[idx % colorPalette.length],
      opacity: 0.9,
      name: `${cat}: ${v}`,
      hoverinfo: 'name',
      showscale: false,
      lighting: {
        ambient: 0.5,
        diffuse: 1,
        specular: 0.5,
        roughness: 0.9,
        fresnel: 0.2,
      },
    });

    // scatter3d label at slice centroid
    const midA = startA + angle / 2;
    const r = 0.6;
    labelTraces.push({
      type: 'scatter3d',
      mode: 'text',
      x: [Math.cos(midA) * r],
      y: [Math.sin(midA) * r],
      z: [TOPZ + 0.05],
      text: [`${cat} (${((v / total) * 100).toFixed(1)}%)`],
      textfont: { size: 14, color: '#000' },
      hoverinfo: 'none',
      showlegend: false,
    });

    startA = endA;
  });

  // 3) Layout with axis titles still shown
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
        visible: false,
      },
      yaxis: {
        visible: false,
      },
      zaxis: {
        visible: false,
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 0.8 },
        up: { x: 0, y: 0, z: 1 },
        center: { x: 0, y: 0, z: 0 },
      },
      bgcolor: "white",
      aspectratio: { x: 1, y: 1, z: 1 },
    },
    margin: { l: 0, r: 0, b: 0, t: 40 },
    showlegend: true,
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    legend: {
      x: 0,
      y: 1,
      traceorder: 'normal',
      font: {
        family: 'sans-serif',
        size: 12,
        color: '#000'
      },
      bgcolor: 'rgba(255, 255, 255, 0.5)',
      bordercolor: '#ccc',
      borderwidth: 1
    }
  };

  return (
    <div className={containerClass}>
      <Plot
        data={[...meshTraces, ...labelTraces]}
        layout={layout}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
