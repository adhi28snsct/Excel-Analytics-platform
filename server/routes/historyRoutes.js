import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { getUserHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/history', verifyToken, getUserHistory);

export default router;