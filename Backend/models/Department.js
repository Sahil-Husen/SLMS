import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: String,
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
  },
  { timestamps: true },
);

export default mongoose.model("Department", departmentSchema);
