import Department from "../models/Department.js";
import mongoose from "mongoose";

export const getDepartmentsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({ message: "facultyId is required" });
    }

    const departments = await Department.find({ facultyId }).select(
      "name facultyId",
    ); // minimal fields

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create Department


 

export const createDepartment = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, facultyId } = req.body || {};

    if (!name || !facultyId) {
      return res.status(400).json({
        message: "name and facultyId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
      return res.status(400).json({
        message: "Invalid facultyId",
      });
    }

    // ✅ CHECK FIRST
    const exists = await Department.findOne({ name, facultyId });
    if (exists) {
      return res.status(400).json({
        message: "Department already exists in this faculty",
      });
    }

    // ✅ THEN CREATE
    const department = await Department.create({
      name,
      facultyId,
    });

    res.status(201).json(department);
  } catch (error) {
    console.error("CREATE DEPARTMENT ERROR:", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get departments
export const getDepartments = async (req, res) => {
  const departments = await Department.find().populate("facultyId", "name");

  res.json(departments);
};

// update department
export const updateDepartment = async (req, res) => {
  const { name } = req.body;

  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true },
  );

  res.json(department);
};

//delete
export const deleteDepartment = async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ message: "Department deleted" });
};
