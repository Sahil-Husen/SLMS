import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
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
      default: null,
    },

    maxSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
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

// 🔒 Unique course code per department
courseSchema.index({ courseCode: 1, departmentId: 1 }, { unique: true });

// ⚡ Performance indexes
courseSchema.index({ departmentId: 1 });
courseSchema.index({ program: 1 });
courseSchema.index({ isActive: 1 });

// 🎯 Auto-set availableSeats on creation
courseSchema.pre("save", async function () {
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.maxSeats;
  }
});


export default mongoose.model("Course", courseSchema);
