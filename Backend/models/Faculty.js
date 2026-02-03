import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
  },
  { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
