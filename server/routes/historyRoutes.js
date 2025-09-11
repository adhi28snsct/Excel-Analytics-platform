import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getUserHistory } from "../controllers/historyController.js";

const router = express.Router();

// 📜 Get paginated upload history
router.get("/", verifyToken, getUserHistory);

export default router;