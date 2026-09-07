const mongoose = require("mongoose");

const courseOfferingSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

courseOfferingSchema.index(
  {
    course: 1,
    class: 1,
    academicYear: 1,
    semester: 1,
  },
  {
    unique: true,
  }
);

const CourseOffering = mongoose.model(
  "CourseOffering",
  courseOfferingSchema
);

module.exports = CourseOffering;