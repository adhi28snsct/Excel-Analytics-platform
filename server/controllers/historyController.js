import Analysis from "../models/analysis.js";

export const getUserHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };
    if (req.query.chartType) query.chartType = req.query.chartType;
    if (req.query.filename) query.filename = new RegExp(req.query.filename, "i");

    const [uploads, total] = await Promise.all([
      Analysis.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("file")
        .lean(),
      Analysis.countDocuments(query)
    ]);

    const simplifiedUploads = uploads.map(upload => {
      let uploadedAt = upload.createdAt;
      if (!uploadedAt || isNaN(new Date(uploadedAt).getTime())) {
        const timestamp = new Date(parseInt(upload._id.toString().substring(0, 8), 16) * 1000);
        uploadedAt = timestamp;
      }

      return {
        analysisId: upload._id,
        fileId: upload.file?._id || upload.file?.toString() || null,
        filename: upload.filename,
        uploadedAt,
        chartType: upload.chartType,
        xAxis: upload.xAxis,
        yAxis: upload.yAxis,
        columns: upload.availableColumns || [],
        fileSize: upload.file?.size,
        fileType: upload.file?.mimetype
      };
    });

    const hasMore = page * limit < total;

    res.status(200).json({
      uploads: simplifiedUploads,
      page,
      total,
      pageSize: limit,
      hasMore
    });
  } catch (error) {
    console.error("History fetch error:", error.message);
    res.status(500).json({ error: "Failed to retrieve upload history" });
  }
};