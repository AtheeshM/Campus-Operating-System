const Course = require("../models/Course");
const Regulation = require("../models/Regulation");
const AcademicMapping = require("../models/AcademicMapping");
const User = require("../models/User");

const createCourse = async (req, res) => {
  try {
    const {
      regulationId,
      code,
      name,
      department,
      semester,
      credits,
      courseType,
      description,
    } = req.body;

    if (
      !regulationId ||
      !code ||
      !name ||
      !department ||
      !semester
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Regulation ID, code, name, department and semester are required",
      });
    }

    const regulation = await Regulation.findById(regulationId);

    if (!regulation) {
      return res.status(404).json({
        success: false,
        message: "Regulation not found",
      });
    }

    const existingCourse = await Course.findOne({
      regulation: regulationId,
      code: code.trim().toUpperCase(),
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course already exists in this regulation",
      });
    }

    const course = await Course.create({
      regulation: regulationId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      department: department.trim(),
      semester,
      credits: credits || 0,
      courseType: courseType || "CORE",
      description: description || "",
      status: "PUBLISHED",
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const { regulationId, semester, department } = req.query;

    const filter = {};

    /*
     * STUDENT:
     * Show only courses mapped by admin to the student's class.
     */
    if (req.user.role === "STUDENT") {
      const studentId =
        req.user.userId ||
        req.user.id ||
        req.user._id;

      if (!studentId) {
        return res.status(401).json({
          success: false,
          message: "Student identity not found in authentication token",
        });
      }

      const student = await User.findById(studentId).select("class");

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      if (!student.class) {
        return res.status(200).json({
          success: true,
          count: 0,
          courses: [],
        });
      }

      const mappings = await AcademicMapping.find({
        class: student.class,
        status: "ACTIVE",
      }).select("course");

      const mappedCourseIds = [
        ...new Set(
          mappings.map((mapping) =>
            mapping.course.toString()
          )
        ),
      ];

      if (mappedCourseIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          courses: [],
        });
      }

      filter._id = {
        $in: mappedCourseIds,
      };
    }

    /*
     * Existing filters remain unchanged.
     */
    if (regulationId) {
      filter.regulation = regulationId;
    }

    if (semester) {
      filter.semester = Number(semester);
    }

    if (department) {
      filter.department = department;
    }

    const courses = await Course.find(filter)
      .populate(
        "regulation",
        "name batchStartYear batchEndYear department"
      )
      .sort({
        semester: 1,
        code: 1,
      });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve courses",
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
};