import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User (STUDENT)x1
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    res.status(201).json({
      message: "Signup successful.",
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

    const student = await User.findOne({ email, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: student._id, role: student.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: student._id, role: student.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Student login successful",
      accessToken,
      role: student.role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Student login failed",
      error: error.message,
    });
  }
};

