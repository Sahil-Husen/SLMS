import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
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
      min: 1,
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.maxSeats;
        },
        message: "Available seats cannot exceed max seats",
      },
    },

    program: {
      type: String,
      enum: ["UG", "PG", "Diploma", "Certificate"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for unique course per department
courseSchema.index({ courseCode: 1, departmentId: 1 }, { unique: true });

// Index for frequently queried fields
courseSchema.index({ departmentId: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ program: 1 });

// Pre-save hook to validate available seats
courseSchema.pre("save", function (next) {
  if (this.availableSeats > this.maxSeats) {
    next(new Error("Available seats cannot exceed max seats"));
  }

  // Set availableSeats to maxSeats on creation if not provided
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.maxSeats;
  }

  next();
});

export default mongoose.model("Course", courseSchema);