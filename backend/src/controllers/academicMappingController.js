const AcademicMapping = require("../models/AcademicMapping");
const Course = require("../models/Course");
const User = require("../models/User");
const Class = require("../models/Class");

const createAcademicMapping = async (req, res) => {
  try {
    const { courseId, facultyId, classId } = req.body;

    if (!courseId || !facultyId || !classId) {
      return res.status(400).json({
        success: false,
        message: "Course, faculty and class are required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const faculty = await User.findById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    if (faculty.role !== "FACULTY") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a faculty member",
      });
    }

    const selectedClass = await Class.findById(classId);

    if (!selectedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    const existingMapping = await AcademicMapping.findOne({
      course: courseId,
      faculty: facultyId,
      class: classId,
    });

    if (existingMapping) {
      return res.status(409).json({
        success: false,
        message: "Academic mapping already exists",
      });
    }

    const mapping = await AcademicMapping.create({
      course: courseId,
      faculty: facultyId,
      class: classId,
      status: "ACTIVE",
    });

    const populatedMapping = await AcademicMapping.findById(mapping._id)
      .populate("course", "code name")
      .populate("faculty", "email facultyType department")
      .populate("class", "name department year section");

    return res.status(201).json({
      success: true,
      message: "Academic mapping created successfully",
      mapping: populatedMapping,
    });
  } catch (error) {
    console.error("Create academic mapping error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create academic mapping",
    });
  }
};

const getAcademicMappings = async (req, res) => {
  try {
    const mappings = await AcademicMapping.find()
      .populate("course", "code name")
      .populate("faculty", "email facultyType department")
      .populate("class", "name department year section")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      mappings,
    });
  } catch (error) {
    console.error("Get academic mappings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch academic mappings",
    });
  }
};

module.exports = {
  createAcademicMapping,
  getAcademicMappings,
};