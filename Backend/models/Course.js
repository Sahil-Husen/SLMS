import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
    },

    courseName: {
      type: String,
      required: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
    },

    maxSeats: {
      type: Number,
      required: true,
    },

    
    availableSeats: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

courseSchema.index(
  { courseCode: 1, departmentId: 1 },
  { unique: true }
);
export default mongoose.model("Course", courseSchema);
