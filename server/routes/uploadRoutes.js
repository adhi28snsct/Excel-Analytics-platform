import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import verifyToken from "../middleware/verifyToken.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import Analysis from "../models/analysis.js";
import File from "../models/File.js";
import { buildChartData } from "../utils/chartBuilder.js";

const router = express.Router();

// 🧠 Multer memory storage
const storage = multer.memoryStorage();
const excelFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Only .xls and .xlsx files are allowed");
    error.status = 400;
    cb(error);
  }
};

const upload = multer({ storage, fileFilter: excelFileFilter });

// 🚀 Upload endpoint
router.post(
  "/upload",
  verifyToken,
  authorizeRole("admin", "analyst", "user"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("❌ Multer error:", err.message);
        return res.status(err.status || 400).json({ error: err.message });
      }
      console.log("📥 Received file:", req.file?.originalname);
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        console.warn("⚠️ No file received in request.");
        return res.status(400).json({ error: "No file uploaded" });
      }

      // ✅ Save file metadata
      const newFile = await File.create({
        originalname: req.file.originalname,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        user: req.user.id,
      });

      // 📊 Parse Excel buffer
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      const availableColumns = Object.keys(jsonData[0] || {});

      if (jsonData.length === 0 || availableColumns.length === 0) {
        return res.status(400).json({ error: "Excel file is empty or malformed" });
      }

      // 🧮 Chart config
      const chartType = req.body.chartType || "bar";
      const xAxis = req.body.xAxis || availableColumns[0];
      const yAxis = req.body.yAxis || availableColumns[1];
      const chartData = buildChartData(jsonData, chartType, xAxis, yAxis);

      // ✅ Create Analysis
      const newAnalysis = await Analysis.create({
        user: req.user.id,
        file: newFile._id,
        filename: req.file.originalname,
        availableColumns,
        chartType,
        xAxis,
        yAxis,
        chartData,
        rawData: jsonData,
      });

      res.status(201).json({
        message: "Excel data and file metadata saved successfully",
        analysisId: newAnalysis._id,
        fileId: newFile._id,
        filename: newAnalysis.filename,
        uploadedAt: newAnalysis.createdAt,
      });
    } catch (error) {
      console.error("❌ Upload handler error:", error);
      res.status(500).json({ error: error.message || "Failed to process Excel file" });
    }
  }
);

export default router;