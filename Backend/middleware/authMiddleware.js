import jwt from "jsonwebtoken";
import User from "../models/User.js";

const { verify } = jwt;

export const auth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = verify(token, process.env.JWT_ACCESS_SECRET);
       

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }

       

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user;
      next();
    } catch (error) {
       
      return res.status(401).json({ message: error.message });
    }
  };
};
