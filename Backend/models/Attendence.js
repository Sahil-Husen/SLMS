import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["Present", "Absent"],
          default: "Absent", // mark absent by default
        },
        remarks: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same course/date
attendanceSchema.index({ courseId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
