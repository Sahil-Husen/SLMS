import AdmissionApplication from "../models/AdmissionApplication.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mongoose from "mongoose";
/* ===============================
   GET ALL APPLICATIONS
================================ */
export const getAllAdmissions = async (req, res) => {
  const applications = await AdmissionApplication.find()
    .populate("userId", "name email")
    .populate("preferredDepartment")
    .populate("course");

  res.json(applications);
};

/* ===============================
   VALIDATE ADMISSIONS
================================ */
export const validateAdmissions = async (req, res) => {
  const invalid = await AdmissionApplication.find({
    $or: [{ marks: { $exists: false } }, { marks: null }],
  });

  res.json({
    totalInvalid: invalid.length,
    invalid,
  });
};

/* ===============================
   MERIT LIST (DEPT > COURSE)
================================ */
export const getGroupedMeritList = async (req, res) => {
  try {
    const applications = await AdmissionApplication.find({
      status: { $ne: "rejected" },
    })
      .populate("preferredDepartment", "name")
      .populate("course", "courseName")
      .populate("userId", "name email")
      .sort({ marks: -1, createdAt: 1 });

    const groupedData = applications.reduce((acc, app) => {
      const deptName = app.preferredDepartment?.name || "No Department";
      const courseName = app.course?.courseName || "No Course";

      let dept = acc.find((d) => d.departmentName === deptName);
      if (!dept) {
        dept = { departmentName: deptName, courses: [] };
        acc.push(dept);
      }

      let course = dept.courses.find((c) => c.courseName === courseName);
      if (!course) {
        course = { courseName, students: [] };
        dept.courses.push(course);
      }

      course.students.push({
        rank: course.students.length + 1,
        studentName: app.userId?.name,
        email: app.userId?.email,
        marks: app.marks,
        status: app.status,
      });

      return acc;
    }, []);

    res.json(groupedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   ASSIGN MERIT RANKS (COURSE-WISE)
================================ */
export const assignMeritRanks = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const applications = await AdmissionApplication.find({
      course: courseId,
      status: "pending",
    })
      .sort({ marks: -1, createdAt: 1 })
      .select("_id marks");

    if (applications.length === 0) {
      return res.json({ message: "No pending applications found" });
    }

    const bulkOps = applications.map((app, index) => ({
      updateOne: {
        filter: { _id: app._id },
        update: { $set: { meritRank: index + 1 } },
      },
    }));

    await AdmissionApplication.bulkWrite(bulkOps);

    res.json({
      message: "Merit ranks assigned course-wise",
      total: applications.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   SELECT STUDENTS (COURSE-WISE)
================================ */

export const selectStudents = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Invalid courseId. Use course _id, not courseCode.",
      });
    }

    // 1. कोर्स ढूँढें और चेक करें कि सीटें बची हैं या नहीं
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.availableSeats <= 0) {
      return res
        .status(400)
        .json({ message: "No seats available in this course" });
    }

    const seats = course.availableSeats;

    // 2. सिर्फ उन छात्रों को ढूँढें जो 'submitted' हैं और जिनका meritRank सीटों के अंदर है
    // meritRank: { $gt: 0 } यह सुनिश्चित करता है कि रैंक असाइन हो चुकी है
    const selected = await AdmissionApplication.find({
      course: courseId,
      status: "submitted",
      meritRank: { $lte: seats, $gt: 0 },
    });

    if (selected.length === 0) {
      return res.status(400).json({
        message:
          "No eligible students found. Ensure merit ranks are assigned first.",
      });
    }

    const selectedIds = selected.map((s) => s._id);
    const userIds = selected.map((s) => s.userId);

    // 3. अपडेट स्टेटस: Selected
    await AdmissionApplication.updateMany(
      { _id: { $in: selectedIds } },
      { $set: { status: "selected" } },
    );

    // 4. अपडेट स्टेटस: Rejected (बाकी बचे हुए छात्र जो मेरिट से बाहर हैं)
    await AdmissionApplication.updateMany(
      {
        course: courseId,
        status: "submitted", // सिर्फ उन्हें जो अभी तक पेंडिंग थे
        meritRank: { $gt: seats },
      },
      { $set: { status: "rejected" } },
    );

    // 5. कोर्स की सीटें कम करें
    course.availableSeats -= selected.length;
    await course.save();

    // 6. यूजर प्रोफाइल अपडेट करें
    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { admissionStatus: "selected" } },
    );

    res.json({
      selectedCount: selected.length,
      availableSeatsRemaining: course.availableSeats,
      message: "Selection process completed successfully",
    });
  } catch (error) {
    console.error("Selection Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/* ===============================
   FINAL SELECTED LIST
================================ */
export const getSelectedStudents = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const students = await AdmissionApplication.find({
      course: courseId,
      status: "selected",
    }).populate("userId", "name email");

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch selected students",
      error: error.message,
    });
  }
};
