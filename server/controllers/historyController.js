import Analysis from '../models/analysis.js';

export const getUserHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve history' });
  }
};