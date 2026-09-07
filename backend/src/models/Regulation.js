const mongoose = require("mongoose");

const regulationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    batchStartYear: {
      type: Number,
      required: true,
      min: 2000,
    },

    batchEndYear: {
      type: Number,
      required: true,
      min: 2000,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    pdfFileName: {
      type: String,
      required: true,
      trim: true,
    },

    pdfPath: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
  }
);

const Regulation = mongoose.model("Regulation", regulationSchema);

module.exports = Regulation;