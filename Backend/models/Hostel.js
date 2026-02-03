import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    hostelName: String,
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
    },
    type: {
      type: String,
      enum: ["Boys", "Girls"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hostel", hostelSchema);
