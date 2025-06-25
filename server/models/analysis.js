import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming you already have a User model
      required: true,
    },
    filename: { type: String, required: true },
    columns: [String],
    chartType: String,
  xAxis: String,
  yAxis: String,
    data: [{
        type: mongoose.Schema.Types.Mixed,

    },
], // each row will be a JSON object
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);