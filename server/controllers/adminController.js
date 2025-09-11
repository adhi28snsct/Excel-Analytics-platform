import User from '../models/user.js';
import Analysis from '../models/analysis.js';

// 📊 Admin Dashboard Summary
export const getAdminDashboard = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const uploads = await Analysis.find()
      .populate('user', 'email name')
      .sort({ createdAt: -1 });

    const verifiedCount = uploads.filter(f => f.verified).length;
    const activeUsers = new Set(uploads.map(f => f.user?._id)).size;
    const recentUploads = uploads.slice(0, 5);

    res.status(200).json({
      message: 'Admin dashboard data',
      stats: {
        totalUsers: users.length,
        totalUploads: uploads.length,
        verifiedUploads: verifiedCount,
        activeUsers,
      },
      recentUploads,
      users,
    });
  } catch (err) {
    console.error('❌ Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// 🔒 Deactivate User
export const deactivateUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing user ID' });

  try {
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deactivated successfully', user });
  } catch (err) {
    console.error('❌ Deactivation error:', err);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};

// 🗑️ Delete User Account
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing user ID' });

  try {
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully', deleted });
  } catch (err) {
    console.error('❌ User deletion error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// 🧹 Delete All Files Uploaded by User
export const deleteUserFiles = async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'Missing user ID' });

  try {
    const result = await Analysis.deleteMany({ user: userId });
    res.status(200).json({
      message: 'User files deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error('❌ File deletion error:', err);
    res.status(500).json({ error: 'Failed to delete user files' });
  }
};