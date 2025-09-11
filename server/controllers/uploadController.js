import xlsx from "xlsx";
import fs from "fs/promises";
import Analysis from "../models/analysis.js";
import File from "../models/File.js";
import { buildChartData } from "../utils/chartBuilder.js";

export const uploadExcelHandler = async (req, res) => {
  try {
    // 🔐 Validate user context
    if (!req.user || !req.user._id) {
      console.warn("❌ Missing user context");
      return res.status(401).json({ error: "Unauthorized: User context missing" });
    }

    // 📁 Validate file presence
    if (!req.file) {
      console.warn("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    const allowedMimeTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    // 📄 Validate file type
    if (!["xls", "xlsx"].includes(ext) || !allowedMimeTypes.includes(req.file.mimetype)) {
      await fs.unlink(req.file.path);
      console.warn("❌ Invalid file type:", req.file.mimetype);
      return res.status(400).json({ error: "Invalid file type. Only Excel files allowed." });
    }

    // 🧾 Save file metadata
    const uploadedFile = await File.create({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      user: req.user._id,
    });

    // 📊 Parse Excel
    let jsonData;
    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      jsonData = xlsx.utils.sheet_to_json(sheet);
    } catch (parseError) {
      await fs.unlink(req.file.path);
      console.error("❌ Excel parsing failed:", parseError);
      return res.status(400).json({ error: "Failed to parse Excel file" });
    }

    // 🧠 Validate sheet data
    if (!Array.isArray(jsonData) || jsonData.length === 0 || typeof jsonData[0] !== "object") {
      await fs.unlink(req.file.path);
      console.warn("❌ Malformed or empty Excel data");
      return res.status(400).json({ error: "Excel file is empty or malformed" });
    }

    // 📊 Column classification
    const availableColumns = Object.keys(jsonData[0]);
    const numericColumns = availableColumns.filter(col =>
      jsonData.every(row => typeof row[col] === "number")
    );
    const textColumns = availableColumns.filter(col => !numericColumns.includes(col));

    // 📈 Chart setup
    const { chartType = "bar", xAxis, yAxis, zAxis } = req.body;
    const validAxes = [xAxis, yAxis, zAxis].filter(Boolean);
    const isValid = validAxes.every(col => availableColumns.includes(col));

    const chartData = isValid
      ? buildChartData(jsonData, chartType, xAxis, yAxis, zAxis)
      : null;

    // 🧾 Save analysis
    const newAnalysis = await Analysis.create({
      user: req.user._id,
      file: uploadedFile._id,
      filename: req.file.originalname,
      availableColumns,
      numericColumns,
      textColumns,
      chartType,
      xAxis,
      yAxis,
      zAxis,
      chartData,
      rawData: jsonData,
    });

    // 🧹 Cleanup
    await fs.unlink(req.file.path);

    // ✅ Success response
    res.status(isValid ? 201 : 202).json({
      message: isValid
        ? "Excel data and file metadata saved successfully"
        : "File uploaded, but chart axes are invalid or missing",
      analysisId: newAnalysis._id,
      fileId: uploadedFile._id,
      columns: availableColumns,
      chartPreview: chartData,
      sample: jsonData.slice(0, 5),
      fileMeta: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error(`❌ Upload error for user ${req.user?._id || "unknown"}:`, error);
    res.status(500).json({ error: "File upload failed due to server error" });
  }
};