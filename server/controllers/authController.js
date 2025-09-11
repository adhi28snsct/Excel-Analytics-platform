import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// 🔐 Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// 📝 Register User
export const registerUser = async (req, res, next) => {
  console.log('📦 registerUser body:', req.body);
  const { name, email, password, role } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const normalizedEmail = email?.toLowerCase().trim();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const validRoles = ['user', 'admin'];
  const selectedRole = role?.toLowerCase();
  if (!validRoles.includes(selectedRole)) {
    return res.status(400).json({ error: 'Invalid role selection' });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(), // Will be hashed by pre-save hook
      role: selectedRole,
    });

    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    return next(err);
  }
};

// 🔐 Login User
export const loginUser = async (req, res, next) => {
  console.log('🔍 loginUser body:', req.body);
  const { email, password, role } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();
  const incomingPassword = password?.trim();

  if (!normalizedEmail || !incomingPassword) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("❌ No user found for:", normalizedEmail);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(incomingPassword);
    console.log("🔐 Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    if (role && role.toLowerCase() !== user.role.toLowerCase()) {
      console.log("❌ Role mismatch:", role, "vs", user.role);
      return res.status(403).json({ error: 'Role mismatch' });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Login Error:', err);
    return next(err);
  }
};

// 🧠 Forgot Password
export const forgotPassword = async (req, res, next) => {
  console.log('🔍 forgotPassword body:', req.body);
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    console.log(`🔑 Reset token for ${normalizedEmail}: ${resetToken} (expires in 15 mins)`);

    return res.status(200).json({
      message: 'Reset token generated',
      resetToken,
    });
  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    return next(err);
  }
};

// 🔐 Reset Password
export const resetPassword = async (req, res, next) => {
  console.log('🔍 resetPassword body:', req.body);
  const { token, newPassword } = req.body;

  if (!token || !newPassword?.trim()) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = newPassword.trim(); // Will be hashed by pre-save hook
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('❌ Reset Password Error:', err);
    return next(err);
  }
};