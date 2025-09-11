// src/components/Plotly3DPie3D.jsx
import React from 'react';
import Plot from 'react-plotly.js';

export default function Plotly3DPie3D({
  data,
  labels     = 'Category',
  values     = 'Value',
  chartTitle = '3D Pie Chart',
  xAxisName  = 'X',
  yAxisName  = 'Y',
  zAxisName  = 'Z',
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-yellow-500 mt-4">
        ⚠️ No data available for 3D Pie Chart
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

  const cats  = Object.keys(categoryMap);
  const vals  = Object.values(categoryMap);
  const total = vals.reduce((sum, v) => sum + v, 0);

  // 2) Build mesh3d slices + scatter3d labels
  const meshTraces  = [];
  const labelTraces = [];
  let startA = 0;
  const NPTS  = 50;   // more points ⇒ smoother curve
  const TOPZ  = 0.3;  // slice height

  cats.forEach((cat, idx) => {
    const v      = vals[idx];
    const angle  = (v / total) * Math.PI * 2;
    const endA   = startA + angle;
    const theta  = Array.from({ length: NPTS }, (_, j) =>
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

    // mesh3d slice
    meshTraces.push({
      type:      'mesh3d',
      x, y, z,
      i:         I,
      j:         J,
      k:         K,
      color:     `hsl(${(idx / cats.length) * 360}, 70%, 50%)`,
      opacity:   1,
      name:      `${cat} (${v})`,
      hoverinfo: 'name',
      showscale: false,
      lighting:  {
        ambient:   0.5,
        diffuse:   0.8,
        specular:  0.3,
        roughness: 0.9,
        fresnel:   0.2,
      },
    });

    // scatter3d label at slice centroid
    const midA = startA + angle / 2;
    const r    = 0.6;
    labelTraces.push({
      type:       'scatter3d',
      mode:       'text',
      x:          [Math.cos(midA) * r],
      y:          [Math.sin(midA) * r],
      z:          [TOPZ + 0.02],
      text:       [`${cat}: ${v}`],
      textfont:   { size: 14, color: '#000' },
      hoverinfo:  'none',
      showlegend: false,
    });

    startA = endA;
  });

  // 3) Layout with axis titles still shown
  const layout = {
    title: chartTitle,
    scene: {
      xaxis: {
        title:         { text: xAxisName, font: { size: 12 } },
        visible:       true,
        showticklabels:false,
        showgrid:      false,
        zeroline:      false,
      },
      yaxis: {
        title:         { text: yAxisName, font: { size: 12 } },
        visible:       true,
        showticklabels:false,
        showgrid:      false,
        zeroline:      false,
      },
      zaxis: {
        title:         { text: zAxisName, font: { size: 12 } },
        visible:       true,
        showticklabels:false,
        showgrid:      false,
        zeroline:      false,
      },
      camera: {
        eye:    { x: 1.5, y: 1.5, z: 0.8 },
        up:     { x: 0,   y: 0,   z: 1   },
        center: { x: 0,   y: 0,   z: 0   },
      },
    },
    margin:       { l: 0, r: 0, b: 0, t: 40 },
    showlegend:   true,
    paper_bgcolor:'white',
    plot_bgcolor:'white',
  };

  return (
    <Plot
      data={ [...meshTraces, ...labelTraces] }
      layout={layout}
      config={{ responsive: true }}
      style={{ width: '100%', height: 500 }}
    />
  );
}