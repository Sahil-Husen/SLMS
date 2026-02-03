import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Token cookie ya header se lo
      const token =
        req.cookies?.jwt ||
        req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Role check
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user; // attach full user
      next();
    } catch (error) {
      return res.status(401).json({ message: "Authentication failed" });
    }
  };
};
