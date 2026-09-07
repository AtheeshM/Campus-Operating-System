const mongoose = require("mongoose");

const assignmentSubmissionSchema =
  new mongoose.Schema(
    {
      assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true,
      },

      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      filePath: {
        type: String,
        required: true,
      },

      originalFileName: {
        type: String,
        required: true,
      },

      submittedAt: {
        type: Date,
        default: Date.now,
      },

      marks: {
        type: Number,
        default: null,
      },

      feedback: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: ["SUBMITTED", "REVIEWED"],
        default: "SUBMITTED",
      },
    },
    {
      timestamps: true,
    }
  );

assignmentSubmissionSchema.index(
  {
    assignment: 1,
    student: 1,
  },
  {
    unique: true,
  }
);

const AssignmentSubmission =
  mongoose.model(
    "AssignmentSubmission",
    assignmentSubmissionSchema
  );

module.exports = AssignmentSubmission;