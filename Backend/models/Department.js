import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
  },
  { timestamps: true }
);

// Same faculty cannot have duplicate department names
departmentSchema.index({ name: 1, facultyId: 1 }, { unique: true });

export default mongoose.model("Department", departmentSchema);
