const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    regulation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Regulation",
      required: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
    },

    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    lectureHours: {
  type: Number,
  default: 0,
  min: 0,
},

tutorialHours: {
  type: Number,
  default: 0,
  min: 0,
},

practicalHours: {
  type: Number,
  default: 0,
  min: 0,
},

    courseCategory: {
      type: String,
      enum: [
        "HSMC",
        "BSC",
        "ESC",
        "PCC",
        "PEC",
        "OPC",
        "ETC",
        "AEC",
        "SDC",
        "LAC",
        "MC",
        "IPW",
        "OTHER",
      ],
      default: "OTHER",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index(
  {
    regulation: 1,
    code: 1,
  },
  {
    unique: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;