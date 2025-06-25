import xlsx from "xlsx";
import fs from "fs";
import Analysis from "../models/analysis.js";
export const uploadExcelHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json("No file uploaded");
    }

    const filePath = req.file.path;

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // Clean up temp file
    fs.unlinkSync(filePath);
    const columns = Object.keys(jsonData[0] || {});
    
    // Save to MongoDB
    const newAnalysis = new Analysis({
      user: req.user.id, // added by verifyToken middleware
      filename: req.file.originalname,
      columns,
      data: jsonData,
      chartType: req.body.chartType,
xAxis: req.body.xAxis,
yAxis: req.body.yAxis,
    });

    await newAnalysis.save();

    res.status(201).json({
      message: "Excel data uploaded and saved",
      analysisId: newAnalysis._id,
      columns,
    });
  }catch (error) {
    console.error(error);
    res.status(500).json("Failed to process Excel file");
  }
};
