import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ChartView from "../components/ChartView.jsx";
import { buildChartData } from "../utils/ChartBuilder";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Visualize() {
  const { fileId } = useParams();
  const chartRef = useRef();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!fileId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      return;
    }

    fetch(`http://localhost:5000/api/files/${fileId}/analysis`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load analysis");
        return r.json();
      })
      .then((data) => {
        setAnalysis(data);
        setChartType(data.chartType || "bar");
        setXAxis(data.xAxis || data.availableColumns?.[0] || "");
        setYAxis(data.yAxis || data.availableColumns?.[1] || "");
        setZAxis(data.zAxis || "");
      })
      .catch((err) => setError(err.message));
  }, [fileId]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated");

    const requiredAxes = chartType.includes("3d") ? [xAxis, yAxis, zAxis] : [xAxis, yAxis];
    const allColumns = analysis.availableColumns || [];
    const isValid = requiredAxes.every((col) => allColumns.includes(col));
    if (!isValid) return alert("Invalid axis selection");

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/files/${fileId}/chart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chartType, xAxis, yAxis, zAxis }),
      });

      if (!res.ok) throw new Error("Failed to save chart config");
      const result = await res.json();
      setAnalysis((prev) => ({
        ...prev,
        chartData: result.chartData,
        chartType,
        xAxis,
        yAxis,
        zAxis,
      }));
      alert("Chart configuration saved!");
    } catch (err) {
      console.error("❌ Save Error:", err);
      alert("Failed to save chart config");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
  if (!chartRef.current || !analysis) return;

  const canvas = await html2canvas(chartRef.current, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height + 300],
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;

  const columns = analysis.availableColumns || [];
  const totalRows = analysis.rawData?.length ?? 0;
  const chartPayload = buildChartData(analysis.rawData, chartType, xAxis, yAxis, zAxis);
  const xData = chartPayload?.labels ?? [];
  const yData = chartPayload?.datasets?.[0]?.data ?? [];

  const topIndex = yData.indexOf(Math.max(...yData));
  const lowIndex = yData.indexOf(Math.min(...yData));
  const avgY = (yData.reduce((a, b) => a + b, 0) / yData.length).toFixed(2);
  const totalY = yData.reduce((a, b) => a + b, 0);

  const summaryText = `
📄 File Summary

Filename: ${analysis.filename}
Uploaded Columns: ${columns.join(", ")}
Total Records: ${totalRows} rows

This dataset contains ${columns.length} columns. It includes categorical fields like ${xAxis} and numerical metrics like ${yAxis}${zAxis ? ` and ${zAxis}` : ""}. The chart visualizes how ${yAxis} varies across ${xAxis}${zAxis ? ` and ${zAxis}` : ""}, helping identify trends and outliers.

🧠 Key Insights:
- Top ${xAxis}: ${xData[topIndex]} (${yAxis}: ₹${yData[topIndex]})
- Lowest ${xAxis}: ${xData[lowIndex]} (${yAxis}: ₹${yData[lowIndex]})
- Average ${yAxis}: ₹${avgY}
- Total ${yAxis}: ₹${totalY}

📌 Recommendation:
Use this chart to guide decisions on resource allocation, regional strategy, and performance tracking.
`;

  pdf.setFontSize(18);
  pdf.text(`Excel Summary: ${analysis.filename}`, margin, margin);

  pdf.setFontSize(12);
  const lines = pdf.splitTextToSize(summaryText, pageWidth - margin * 2);
  pdf.text(lines, margin, margin + 30);

  const chartY = margin + lines.length * 14 + 60;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", margin, chartY, imgWidth, imgHeight);
  pdf.save(`${analysis.filename.replace(/\.[^/.]+$/, "")}-report.pdf`);
};
  const handleDownloadFile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please log in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = analysis?.filename || `${fileId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err.message);
      alert(`Download failed: ${err.message}`);
    }
  };

  if (!fileId) {
    return <div className="p-6 text-gray-500">Please select a file to visualize.</div>;
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!analysis) return <div className="p-6">Loading analysis...</div>;

  const columns = analysis.availableColumns || [];
  const chartPayload = buildChartData(analysis.rawData, chartType, xAxis, yAxis, zAxis);

  const xData = chartPayload?.x ?? chartPayload?.labels ?? [];
  const yData = chartPayload?.y ?? chartPayload?.datasets?.[0]?.data ?? [];
  const zData = chartPayload?.z ?? [];

  const chartDescriptions = {
    bar: "Compare values across categories",
    "bar-3d": "Simulated 3D bar chart",
    line: "Trend over time or sequence",
    "line-3d": "3D line visualization",
    pie: "Proportional distribution",
    "pie-3d": "3D pie representation",
    scatter: "Relationship between two variables",
    "3d-scatter": "3D relationship visualization",
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-500 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl p-6 shadow space-y-6">
        <h2 className="text-xl font-bold">Visualize: {analysis.filename}</h2>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block font-medium">Chart:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              {Object.keys(chartDescriptions).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">{chartDescriptions[chartType]}</p>
          </div>

          <div>
            <label className="block font-medium">X:</label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="">Select</option>
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Y:</label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="">Select</option>
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {chartType.includes("3d") && (
            <div>
              <label className="block font-medium">Z:</label>
              <select
                value={zAxis}
                onChange={(e) => setZAxis(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value="">Select</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "💾 Save Chart"}
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={handleDownloadPDF}
          >
            📄 Download PDF Report
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            onClick={handleDownloadFile}
          >
            ⬇️ Download Original File
          </button>
        </div>

        {!chartPayload || (!chartPayload.datasets && !chartPayload.x) ? (
          <div className="text-red-500 mt-6">⚠️ Invalid chart configuration</div>
        ) : (
          <div className="mt-6" ref={chartRef}>
            <ChartView
              chartType={chartType}
              xData={xData}
              yData={yData}
              zData={zData}
              datasets={chartPayload.datasets}
              labels={chartPayload.labels}
              xLabel={xAxis}
              yLabel={yAxis}
              zLabel={zAxis}
            />
          </div>
        )}
      </div>
    </div>
  );
}