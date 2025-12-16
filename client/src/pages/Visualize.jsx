import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ChartView from "../components/ChartView.jsx";
import { buildChartData } from "../utils/ChartBuilder";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../api/axios";

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

  /* ---------- LOAD ANALYSIS ---------- */
  useEffect(() => {
    if (!fileId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      return;
    }

    api
      .get(`/api/files/${fileId}/analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setAnalysis(data);
        setChartType(data.chartType || "bar");
        setXAxis(data.xAxis || data.availableColumns?.[0] || "");
        setYAxis(data.yAxis || data.availableColumns?.[1] || "");
        setZAxis(data.zAxis || "");
      })
      .catch(() => setError("Failed to load analysis"));
  }, [fileId]);

  /* ---------- SAVE CHART CONFIG ---------- */
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated");

    const requiredAxes = chartType.includes("3d")
      ? [xAxis, yAxis, zAxis]
      : [xAxis, yAxis];

    const allColumns = analysis.availableColumns || [];
    if (!requiredAxes.every((c) => allColumns.includes(c))) {
      return alert("Invalid axis selection");
    }

    setSaving(true);
    try {
      const res = await api.put(
        `/api/files/${fileId}/chart`,
        { chartType, xAxis, yAxis, zAxis },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAnalysis((prev) => ({
        ...prev,
        chartData: res.data.chartData,
        chartType,
        xAxis,
        yAxis,
        zAxis,
      }));

      alert("Chart configuration saved!");
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("Failed to save chart config");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- DOWNLOAD ORIGINAL FILE ---------- */
  const handleDownloadFile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authenticated");

    try {
      const res = await api.get(
        `/api/files/${fileId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = analysis?.filename || `${fileId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err);
      alert("Download failed");
    }
  };

  /* ---------- DOWNLOAD PDF ---------- */
  const handleDownloadPDF = async () => {
    if (!chartRef.current || !analysis) return;

    const canvas = await html2canvas(chartRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height + 300],
    });

    const margin = 40;
    pdf.setFontSize(18);
    pdf.text(`Excel Summary: ${analysis.filename}`, margin, margin);

    const chartY = margin + 40;
    const imgW = pdf.internal.pageSize.getWidth() - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;

    pdf.addImage(imgData, "PNG", margin, chartY, imgW, imgH);
    pdf.save(`${analysis.filename.replace(/\.[^/.]+$/, "")}-report.pdf`);
  };

  if (!fileId) return <div className="p-6">Select a file</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!analysis) return <div className="p-6">Loading analysis...</div>;

  const columns = analysis.availableColumns || [];
  const chartPayload = buildChartData(
    analysis.rawData,
    chartType,
    xAxis,
    yAxis,
    zAxis
  );

  const xData = chartPayload?.x ?? chartPayload?.labels ?? [];
  const yData = chartPayload?.y ?? chartPayload?.datasets?.[0]?.data ?? [];
  const zData = chartPayload?.z ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-500 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl p-6 shadow space-y-6">
        <h2 className="text-xl font-bold">Visualize: {analysis.filename}</h2>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="font-medium">Chart</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="border rounded px-3 py-1"
            >
              {["bar","line","pie","scatter","3d-scatter","bar-3d","pie-3d"].map(
                (t) => (
                  <option key={t} value={t}>{t}</option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="font-medium">X</label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">Select</option>
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Y</label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">Select</option>
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {chartType.includes("3d") && (
            <div>
              <label className="font-medium">Z</label>
              <select
                value={zAxis}
                onChange={(e) => setZAxis(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="">Select</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {saving ? "Saving..." : "💾 Save Chart"}
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            📄 PDF
          </button>

          <button
            onClick={handleDownloadFile}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            ⬇️ Download
          </button>
        </div>

        <div ref={chartRef}>
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
      </div>
    </div>
  );
}
