require("dotenv").config();

const mongoose = require("mongoose");
const { extractPdfText } = require("./pdfService");
const { parseCourseCatalogue } = require("./courseParser");

const Regulation = require("../models/Regulation");
const Course = require("../models/Course");

const pdfPath = "D:/ATHEESH/Regulationns/R_2025.srit.pdf";

const seedCourses = async () => {
  try {
    // --------------------------------------------
    // 1. Connect to MongoDB
    // --------------------------------------------

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    // --------------------------------------------
    // 2. Extract PDF
    // --------------------------------------------

    const pdf = await extractPdfText(pdfPath);

    console.log("PDF extracted successfully");
    console.log("Pages:", pdf.pages);
    console.log("Characters:", pdf.text.length);

    // --------------------------------------------
    // 3. Parse valid catalogue courses
    // --------------------------------------------

    const courses = parseCourseCatalogue(pdf.text);

    console.log("Valid courses detected:", courses.length);

    if (courses.length === 0) {
      throw new Error("No valid courses detected");
    }

    // --------------------------------------------
    // 4. Create / reuse Regulation
    // --------------------------------------------

    let regulation = await Regulation.findOne({
      name: "Regulation 2025",
    });

    if (!regulation) {
      regulation = await Regulation.create({
        name: "Regulation 2025",
        batchStartYear: 2025,
        batchEndYear: 2028,
        department: "COMMON",
        pdfFileName: "R_2025.srit.pdf",
        pdfPath: pdfPath,
        status: "ACTIVE",
      });

      console.log("Regulation created:", regulation._id);
    } else {
      console.log("Existing regulation found:", regulation._id);
    }

    // --------------------------------------------
    // 5. Insert courses
    // --------------------------------------------

    let insertedCount = 0;
    let skippedCount = 0;

    for (const course of courses) {
      const existingCourse = await Course.findOne({
        regulation: regulation._id,
        code: course.code,
      });

      if (existingCourse) {
        skippedCount++;
        continue;
      }

      await Course.create({
        regulation: regulation._id,

        code: course.code,
        name: course.name,

        // Admin will map these later.
        department: null,
        semester: null,

        lectureHours: course.lectureHours,
        tutorialHours: course.tutorialHours,
        practicalHours: course.practicalHours,

        credits: course.credits,

        courseCategory: "OTHER",

        description: "",

        status: "PUBLISHED",
      });

      insertedCount++;
    }

    // --------------------------------------------
    // 6. Summary
    // --------------------------------------------

    console.log("\n========== COURSE SEED COMPLETE ==========");
    console.log("Detected courses :", courses.length);
    console.log("Inserted courses :", insertedCount);
    console.log("Skipped existing :", skippedCount);
    console.log("==========================================");

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Course seeding failed:", error.message);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedCourses();