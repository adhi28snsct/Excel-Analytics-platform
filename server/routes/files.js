import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import xlsx from "xlsx";
import File from "../models/File.js";
import Analysis from "../models/analysis.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/** 📤 Upload Excel file & generate analysis */
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!req.user?._id) return res.status(401).json({ error: "User ID missing from token" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      return res.status(400).json({ error: "Excel file is empty or malformed" });
    }

    const numericKeys = Object.keys(sheetData[0]).filter((key) =>
      sheetData.every((row) => typeof row[key] === "number")
    );

    let chartData = null;
    if (numericKeys.length >= 2) {
      const xKey = req.body.xAxis || numericKeys[0];
      const yKey = req.body.yAxis || numericKeys[1];
      chartData = {
        labels: sheetData.map((row) => row[xKey]),
        datasets: [
          {
            label: `${yKey} vs ${xKey}`,
            data: sheetData.map((row) => row[yKey]),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };
    }

    const newFile = await File.create({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      user: req.user._id,
      data: req.file.buffer,
    });

    const newAnalysis = await Analysis.create({
      file: newFile._id,
      user: req.user._id,
      filename: req.file.originalname,
      chartType: "bar",
      chartData,
      rawData: sheetData,
      availableColumns: Object.keys(sheetData[0]),
    });

    res.status(201).json({
      message: "File uploaded & analysis created",
      fileId: newFile._id,
      analysisId: newAnalysis._id,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

/** 📂 Paginated file listing */
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalFiles = await File.countDocuments({ user: req.user._id });
    const files = await File.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      limit,
      totalFiles,
      totalPages: Math.ceil(totalFiles / limit),
      files,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve files" });
  }
});

/** 📊 Get analysis for a specific file */
router.get("/:id/analysis", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid file ID format" });
    }

    const analysis = await Analysis.findOne({ file: id, user: req.user._id });
    if (!analysis) {
      return res.status(404).json({ error: "No analysis found for this file" });
    }

    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve analysis" });
  }
});

/** 🗑️ Delete a file and its analysis */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid file ID format" });
    }

    const file = await File.findOneAndDelete({ _id: id, user: req.user._id });
    if (!file) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    await Analysis.deleteMany({ file: id, user: req.user._id });

    res.status(200).json({ message: "File and related analysis deleted" });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

/** 📥 Download file */
router.get("/:id/download", verifyToken, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });
    if (!file) return res.status(404).json({ error: "File not found" });

    res.set({
      "Content-Type": file.mimetype,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    });
    res.send(file.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to download file" });
  }
});

export default router;