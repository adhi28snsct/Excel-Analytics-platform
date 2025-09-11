import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import {
  getAdminDashboard,
  deactivateUser,
  deleteUser,
  deleteUserFiles
} from '../controllers/adminController.js';

const router = express.Router();

// 🧠 Optional: Log admin actions for audit/debug
const logAdminAction = (req, res, next) => {
  console.log(`[ADMIN] ${req.method} ${req.originalUrl} by ${req.user?.email}`);
  next();
};

router.use(verifyToken); // 🔐 Protect all routes
router.use(authorizeRole('admin')); // 🛡️ Restrict to admins
router.use(logAdminAction); // 📋 Log admin activity

// 📊 Dashboard summary
router.get('/dashboard', getAdminDashboard);

// 🔒 Deactivate a user
router.patch('/users/:id/deactivate', deactivateUser);

// 🗑️ Delete a user account
router.delete('/users/:id', deleteUser);

// 🧹 Delete all files uploaded by a user
router.delete('/uploads/:userId', deleteUserFiles);

export default router;