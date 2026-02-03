import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: String,
    courseName: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    maxSeats: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
