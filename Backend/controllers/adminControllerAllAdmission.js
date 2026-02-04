import AdmissionApplication from "../models/AdmissionApplication.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

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
  const { courseId } = req.body;

  const applications = await AdmissionApplication.find({
    course: courseId,
    status: "pending",
  }).sort({ marks: -1, createdAt: 1 });

  for (let i = 0; i < applications.length; i++) {
    applications[i].meritRank = i + 1;
    await applications[i].save();
  }

  res.json({ message: "Merit ranks assigned course-wise" });
};

/* ===============================
   SELECT STUDENTS (COURSE-WISE)
================================ */
export const selectStudents = async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const seats = course.availableSeats;

  const selected = await AdmissionApplication.find({
    course: courseId,
    meritRank: { $lte: seats },
  });

  await AdmissionApplication.updateMany(
    { _id: { $in: selected.map((s) => s._id) } },
    { $set: { status: "selected" } },
  );

  await AdmissionApplication.updateMany(
    {
      course: courseId,
      meritRank: { $gt: seats },
    },
    { $set: { status: "rejected" } },
  );

  // 🔒 Update course seats
  course.availableSeats -= selected.length;
  await course.save();

  // 🔒 Update user profiles
  await User.updateMany(
    { _id: { $in: selected.map((s) => s.userId) } },
    { $set: { admissionStatus: "selected" } },
  );

  res.json({
    selectedCount: selected.length,
    message: "Students selected successfully",
  });
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
