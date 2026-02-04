import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appliedProgram: {
      type: String,
      enum: ["UG", "PG"],
      required: true,
    },
    preferredDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    marks: {
      type: Number,
      required: true,
    },
    status:  {
      type: String,
      enum: ["submitted", "evaluated", "selected", "rejected"],
      default: "submitted",
    },
  },
  { timestamps: true },
);

export default mongoose.model("AdmissionApplication", admissionSchema);
