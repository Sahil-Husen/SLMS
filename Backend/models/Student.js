import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentId: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    enrollmentStatus: String,
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
