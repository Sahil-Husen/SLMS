import User from "../models/User.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

export const adminSignup = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Optional: secret key protection
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Unauthorized admin creation" });
    }

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      adminId: admin._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin signup failed",
      error: error.message,
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      role: admin.role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Admin login failed",
      error: error.message,
    });
  }
};
