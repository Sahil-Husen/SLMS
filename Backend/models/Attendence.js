import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    date: Date,
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
        status: {
          type: String,
          enum: ["Present", "Absent"],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
