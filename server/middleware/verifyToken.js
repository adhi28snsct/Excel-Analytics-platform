import jwt from "jsonwebtoken";
import User from "../models/user.js";

export default async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or malformed token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ error: "Token missing user ID" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { _id: user._id.toString(), role: user.role };
    console.log("✅ Token verified for user:", req.user._id);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.name, err.message);
    return res.status(401).json({
      error: err.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid or malformed token",
    });
  }
}