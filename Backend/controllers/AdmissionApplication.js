import mongoose from "mongoose";
import AdmissionApplication from "../models/AdmissionApplication.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

/* ===============================
   CREATE ADMISSION APPLICATION
================================ */
export const createAdmissionApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { appliedProgram, course, marks } = req.body;

    if (!appliedProgram || !course || marks == null) {
      return res.status(400).json({
        message: "appliedProgram, course, and marks are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(course)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const courseData = await Course.findById(course);
    if (!courseData) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!courseData.isActive) {
      return res.status(400).json({
        message: "Course is not accepting admissions",
      });
    }

    const existing = await AdmissionApplication.findOne({
      userId,
      course,
    });

    if (existing) {
      return res.status(400).json({
        message: "Application already submitted for this course",
      });
    }

    const application = await AdmissionApplication.create({
      userId,
      appliedProgram,
      preferredDepartment: courseData.departmentId,
      course,
      marks,
      status: "submitted",
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit application" });
  }
};

/* ===============================
   ASSIGN MERIT RANKS (COURSE-WISE)
================================ */
export const assignMeritRanks = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    const applications = await AdmissionApplication.find({
      course: courseId,
      status: "submitted",
    })
      .sort({ marks: -1, createdAt: 1 })
      .select("_id");

    if (applications.length === 0) {
      return res.json({ message: "No applications found for ranking" });
    }

    const bulkOps = applications.map((app, index) => ({
      updateOne: {
        filter: { _id: app._id },
        update: { $set: { meritRank: index + 1 } },
      },
    }));

    await AdmissionApplication.bulkWrite(bulkOps);

    res.json({
      message: "Merit ranks assigned successfully",
      totalRanked: applications.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Merit ranking failed" });
  }
};

/* ===============================
   SELECT STUDENTS (SEAT-WISE)
================================ */
export const selectStudents = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId. Use course _id, not courseCode.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.availableSeats <= 0) {
      return res.status(400).json({
        message: "No seats available in this course",
      });
    }

    const seats = course.availableSeats;

    const selected = await AdmissionApplication.find({
      course: courseId,
      status: "submitted",
      meritRank: { $gt: 0, $lte: seats },
    });

    if (selected.length === 0) {
      return res.status(400).json({
        message: "No eligible students found. Assign merit first.",
      });
    }

    const selectedIds = selected.map((s) => s._id);
    const userIds = selected.map((s) => s.userId);

    await AdmissionApplication.updateMany(
      { _id: { $in: selectedIds } },
      { $set: { status: "selected" } }
    );

    await AdmissionApplication.updateMany(
      {
        course: courseId,
        status: "submitted",
        meritRank: { $gt: seats },
      },
      { $set: { status: "rejected" } }
    );

    course.availableSeats -= selected.length;
    await course.save();

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { admissionStatus: "selected" } }
    );

    res.json({
      message: "Selection completed successfully",
      selectedCount: selected.length,
      seatsRemaining: course.availableSeats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Selection failed" });
  }
};
