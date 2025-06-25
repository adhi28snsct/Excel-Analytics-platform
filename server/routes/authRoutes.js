import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();
router.use((req, res, next) => {
  console.log("🚦 Incoming auth route hit:", req.method, req.url);
  next();
});
console.log("🛠 authRoutes.js loaded");
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;