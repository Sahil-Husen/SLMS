import AdmissionApplication from "../models/AdmissionApplication.js";

export const getAllAdmissions = async (req, res) => {
  const applications = await AdmissionApplication.find()
    .populate("userId", "name email")
    .populate("preferredDepartment");

  res.json(applications);
};

export const validateAdmissions = async (req, res) => {
  const invalid = await AdmissionApplication.find({
    $or: [{ marks: { $exists: false } }, { marks: null }],
  });

  res.json({
    totalInvalid: invalid.length,
    invalid,
  });
};

//Generate MERIT LIST (READ-ONLY)
export const generateMeritList = async (req, res) => {
  const { department } = req.query;
  
  // ✅ ADD THIS
  if (!department) {
    return res.status(400).json({ message: "department is required" });
  }

  const list = await AdmissionApplication.find({
    preferredDepartment: department,
    status: "pending",
  })
    .populate("userId", "name email")
    .sort({ marks: -1, createdAt: 1 });
    
  res.json(list);
};

// Assign MERIT RANK (still safe) This makes list official but still doesn’t select.

export const assignMeritRanks = async (req, res) => {
  const { department } = req.body;

  const applications = await AdmissionApplication.find({
    preferredDepartment: department,
    status: "pending",
  }).sort({ marks: -1, createdAt: 1 });

  for (let i = 0; i < applications.length; i++) {
    applications[i].meritRank = i + 1;
    await applications[i].save();
  }

  res.json({ message: "Merit ranks assigned" });
};

//STEP 4: SELECT STUDENTS (CUT-OFF BASED)
export const selectStudents = async (req, res) => {
  const { department, seats } = req.body;

  // 1️⃣ Get selected applications
  const selected = await AdmissionApplication.find({
    preferredDepartment: department,
    meritRank: { $lte: seats },
  });

  // 2️⃣ Update admission application status
  await AdmissionApplication.updateMany(
    { _id: { $in: selected.map((s) => s._id) } },
    { $set: { status: "selected" } },
  );

  await AdmissionApplication.updateMany(
    {
      preferredDepartment: department,
      meritRank: { $gt: seats },
    },
    { $set: { status: "rejected" } },
  );

  // 3️⃣ 🔥 UPDATE USER PROFILE (THIS IS THE PLACE)
  await User.updateMany(
    { _id: { $in: selected.map((s) => s.userId) } },
    { $set: { admissionStatus: "selected" } },
  );

  res.json({
    selectedCount: selected.length,
    message: "Students selected successfully",
  });
};

//STEP 5: FINAL SELECTED LIST (for dashboard)

 
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

    return res.json(students);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch selected students",
      error: error.message,
    });
  }
};

