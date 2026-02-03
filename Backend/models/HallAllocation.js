import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
    },
  },
  { timestamps: true }
);

export default mongoose.model("HostelAllocation", allocationSchema);
