import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
  {
    hallName: String,
    provostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hall", hallSchema);
