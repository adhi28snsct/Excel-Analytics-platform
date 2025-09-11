// index.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Import your routers
import authRoutes     from "./routes/authRoutes.js";
import uploadRoutes   from "./routes/uploadRoutes.js";
import historyRoutes  from "./routes/historyRoutes.js";
import adminRoutes    from "./routes/adminRoutes.js";
import fileRoutes     from "./routes/files.js";
import analysisRoutes from "./routes/analysisRoutes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Mount routers on relative paths
app.use("/api/auth",     authRoutes);
app.use("/api/upload",   uploadRoutes);
app.use("/api/history",  historyRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/files",    fileRoutes);
app.use("/api/analysis", analysisRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error"
  });
});

// Connect to MongoDB and start server
const PORT      = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT",  () => { console.log("🔌 SIGINT received");  process.exit(0); });
process.on("SIGTERM", () => { console.log("🔌 SIGTERM received"); process.exit(0); });