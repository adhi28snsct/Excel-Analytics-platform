import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  file: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
  filename: { type: String, required: true },
  availableColumns: { type: [String], default: [] },
  chartType: { type: String, default: "bar" },
  xAxis: String,
  yAxis: String,
  zAxis: String,
  chartData: { type: Object, default: null },
  rawData: { type: [Object], default: [] },
}, { timestamps: true }); // ✅ Enables createdAt

export default mongoose.model("Analysis", analysisSchema);