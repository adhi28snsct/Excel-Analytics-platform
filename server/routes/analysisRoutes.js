import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import File from "../models/File.js";
import Analysis from "../models/analysis.js";
import verifyToken from "../middleware/verifyToken.js";
import { buildChartData } from "../utils/chartBuilder.js";

const router = express.Router();
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// 📤 Upload Excel
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    if (!Array.isArray(data) || !data.length)
      return res.status(400).json({ error: "Empty or malformed Excel" });

    const cols = Object.keys(data[0]),
      chartType = "bar",
      xAxis = cols[0],
      yAxis = cols[1];
    const chartData = buildChartData(data, chartType, xAxis, yAxis);

    const file = await File.create({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      user: req.user.id,
      path: req.file.path,
    });

    const analysis = await Analysis.create({
      file: file._id,
      user: req.user.id,
      filename: req.file.originalname,
      chartType,
      chartData,
      rawData: data,
      availableColumns: cols,
      xAxis,
      yAxis,
    });

    res
      .status(201)
      .json({
        message: "Uploaded & analyzed",
        fileId: file._id,
        analysisId: analysis._id,
      });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 📜 History (paginated)
router.get("/history/all", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1,
      limit = 10,
      skip = (page - 1) * limit;
    const history = await Analysis.find({ user: req.user.id })
      .populate("file")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const uploads = history.map((a) => ({
      analysisId: a._id,
      fileId: a.file?._id,
      filename: a.filename || a.file?.filename || "Unnamed File",
      chartType: a.chartType,
      uploadedAt: a.createdAt,
      size: a.file?.size || null,
      mimetype: a.file?.mimetype || null,
    }));
    const total = await Analysis.countDocuments({ user: req.user.id });
    res.json({
      uploads,
      page,
      total,
      pageSize: limit,
      hasMore: page * limit < total,
    });
  } catch (err) {
    console.error("❌ History Error:", err);
    res.status(500).json({ error: "History fetch failed" });
  }
});

// 📁 Dashboard shortcut
router.get("/history", verifyToken, async (req, res) => {
  try {
    const uploads = await Analysis.find({ user: req.user.id })
      .populate("file")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const simplified = uploads.map((a) => ({
      analysisId: a._id,
      fileId: a.file?._id,
      filename: a.filename || a.file?.filename || "Unnamed File",
      uploadedAt: a.createdAt,
      size: a.file?.size || null,
      mimetype: a.file?.mimetype || null,
    }));
    res.json({ uploads: simplified });
  } catch (err) {
    console.error("❌ Shortcut Error:", err);
    res.status(500).json({ error: "Shortcut fetch failed" });
  }
});

// 📊 Full analysis
router.get("/:fileId", verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(fileId))
      return res.status(400).json({ error: "Invalid ID" });

    const a = await Analysis.findOne({
      file: fileId,
      user: req.user.id,
    }).lean();
    if (!a) return res.status(404).json({ error: "Not found" });

    res.json({
      filename: a.filename,
      data: a.rawData,
      chartType: a.chartType,
      columns: a.availableColumns,
      chartData: a.chartData,
      xAxis: a.xAxis,
      yAxis: a.yAxis,
      zAxis: a.zAxis,
    });
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 👀 Preview
router.get("/:fileId/preview", verifyToken, async (req, res) => {
  try {
    const a = await Analysis.findOne({
      file: req.params.fileId,
      user: req.user.id,
    }).lean();
    if (!a) return res.status(404).json({ error: "Not found" });
    res.json({
      filename: a.filename,
      columns: a.availableColumns,
      sample: a.rawData.slice(0, 5),
    });
  } catch (err) {
    console.error("❌ Preview Error:", err);
    res.status(500).json({ error: "Preview failed" });
  }
});

// 🔄 Update chart
router.put("/:fileId/chart", verifyToken, async (req, res) => {
  try {
    const { chartType, xAxis, yAxis, zAxis } = req.body;
    const a = await Analysis.findOne({
      file: req.params.fileId,
      user: req.user.id,
    });
    if (!a) return res.status(404).json({ error: "Not found" });

    const axes = [xAxis, yAxis, zAxis].filter(Boolean);
    if (!axes.every((col) => a.availableColumns.includes(col)))
      return res.status(400).json({ error: "Invalid axes" });

    a.chartType = chartType;
    a.xAxis = xAxis;
    a.yAxis = yAxis;
    a.zAxis = zAxis;
    a.chartData = buildChartData(a.rawData, chartType, xAxis, yAxis, zAxis);
    await a.save();

    res.json({ message: "Chart updated", chartData: a.chartData });
  } catch (err) {
    console.error("❌ Chart Update Error:", err);
    res.status(500).json({ error: "Chart update failed" });
  }
});

// 🗑️ Delete
router.delete("/:fileId", verifyToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(fileId))
      return res.status(400).json({ error: "Invalid ID" });
    await File.findOneAndDelete({ _id: fileId, user: req.user.id });
    await Analysis.deleteMany({ file: fileId });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// 📥 Export Excel
router.get("/:fileId/export", verifyToken, async (req, res) => {
  try {
    const a = await Analysis.findOne({
      file: req.params.fileId,
      user: req.user.id,
    });
    if (!a) return res.status(404).json({ error: "Not found" });

    const ws = xlsx.utils.json_to_sheet(a.rawData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.set({
      "Content-Disposition": `attachment; filename="${
        a.filename || "export.xlsx"
      }"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    res.send(buffer);
  } catch (err) {
    console.error("❌ Export Error:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
