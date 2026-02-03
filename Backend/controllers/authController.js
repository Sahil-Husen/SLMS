import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdmissionApplication from "../models/AdmissionApplication.js";

export const signupStudent = async (req, res) => {
  try {
    const { name, email, password, appliedProgram, marks } = req.body;

    // 1. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User (STUDENT)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      status: "applied", // VERY IMPORTANT
    });

    // 4. Create Admission Application
    await AdmissionApplication.create({
      userId: user._id,
      appliedProgram,
      marks,
      status: "submitted",
    });

    res.status(201).json({
      message: "Signup successful. Entrance application submitted.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Student not selected yet
    if (user.role === "student" && user.status === "applied") {
      return res.status(403).json({
        message: "Entrance application under review",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
