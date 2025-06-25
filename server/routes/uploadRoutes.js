import express from "express";
import multer from "multer";
import verifyToken from "../middleware/verifyToken.js";
import { uploadExcelHandler } from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "server/uploads/" });

router.post("/upload", verifyToken, upload.single("file"), uploadExcelHandler);

export default router;