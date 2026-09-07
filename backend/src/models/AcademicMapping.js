const mongoose = require("mongoose");

const academicMappingSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

academicMappingSchema.index(
  {
    course: 1,
    faculty: 1,
    class: 1,
  },
  {
    unique: true,
  }
);

const AcademicMapping = mongoose.model(
  "AcademicMapping",
  academicMappingSchema
);

module.exports = AcademicMapping;