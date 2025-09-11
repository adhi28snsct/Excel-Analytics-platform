import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token for a given user ID.
 * @param {string} userId - MongoDB user ID
 * @param {string} [expiresIn='1d'] - Token expiration duration
 * @returns {string} JWT token
 */
const generateToken = (userId, expiresIn = '1d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const payload = { id: userId };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

  // Optional debug log
  // console.log(`🔐 Token generated for user ${userId}:`, token);

  return token;
};

export default generateToken;