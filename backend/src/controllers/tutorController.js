const User = require("../models/User");
const Class = require("../models/Class");
const AcademicMapping = require("../models/AcademicMapping");

const getAssignedClassStudents = async (req, res) => {
  try {
    // Get the current Tutor from the database
    const tutor = await User.findById(req.user.userId);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    if (
      tutor.role !== "FACULTY" ||
      tutor.facultyType !== "TUTOR"
    ) {
      return res.status(403).json({
        success: false,
        message: "Tutor access required",
      });
    }

    // Find the class assigned to this Tutor
    const assignedClass = await Class.findOne({
      tutor: tutor._id,
    });

    if (!assignedClass) {
      return res.status(404).json({
        success: false,
        message: "No class assigned to this tutor",
      });
    }

    // Find all students belonging to that class
    const students = await User.find({
      role: "STUDENT",
      class: assignedClass._id,
    }).select("_id email department class status");

    return res.status(200).json({
      success: true,
      message: "Assigned class students retrieved successfully",
      class: {
        id: assignedClass._id,
        name: assignedClass.name,
        department: assignedClass.department,
        year: assignedClass.year,
        section: assignedClass.section,
      },
      count: students.length,
      students: students.map((student) => ({
        id: student._id,
        email: student.email,
        department: student.department,
        class: student.class,
        status: student.status,
      })),
    });
  } catch (error) {
    console.error("Get assigned class students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assigned class students",
    });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get the current Tutor from the database
    const tutor = await User.findById(req.user.userId);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    if (
      tutor.role !== "FACULTY" ||
      tutor.facultyType !== "TUTOR"
    ) {
      return res.status(403).json({
        success: false,
        message: "Tutor access required",
      });
    }

    // Find the class assigned to this Tutor
    const assignedClass = await Class.findOne({
      tutor: tutor._id,
    });

    if (!assignedClass) {
      return res.status(404).json({
        success: false,
        message: "No class assigned to this tutor",
      });
    }

    // Find the requested student
    const student = await User.findOne({
      _id: studentId,
      role: "STUDENT",
    }).select("_id email department class status");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Security check:
    // Student must belong to Tutor's assigned class
    if (
      !student.class ||
      student.class.toString() !== assignedClass._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can access only students in your assigned class",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student details retrieved successfully",
      student: {
        id: student._id,
        email: student.email,
        department: student.department,
        class: {
          id: assignedClass._id,
          name: assignedClass.name,
          year: assignedClass.year,
          section: assignedClass.section,
        },
        status: student.status,
      },
    });
  } catch (error) {
    console.error("Get student details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student details",
    });
  }
};

/*
 * Get courses assigned to the currently logged-in Tutor.
 *
 * Source of truth:
 *
 * AcademicMapping
 *   faculty -> logged-in tutor
 *   course  -> assigned course
 *   class   -> assigned class
 */
const getAssignedCourses = async (req, res) => {
  try {
    // Get the currently logged-in Tutor
    const tutor = await User.findById(req.user.userId);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    // Verify Tutor role
    if (
      tutor.role !== "FACULTY" ||
      tutor.facultyType !== "TUTOR"
    ) {
      return res.status(403).json({
        success: false,
        message: "Tutor access required",
      });
    }

    /*
     * Get only ACTIVE academic mappings
     * belonging to this Tutor.
     */
    const mappings = await AcademicMapping.find({
      faculty: tutor._id,
      status: "ACTIVE",
    })
      .populate(
        "course",
        "code name department semester credits courseType description"
      )
      .populate(
        "class",
        "name department year section"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Assigned courses retrieved successfully",
      count: mappings.length,
      courses: mappings.map((mapping) => ({
        mappingId: mapping._id,
        course: mapping.course,
        class: mapping.class,
        status: mapping.status,
      })),
    });
  } catch (error) {
    console.error("Get assigned courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assigned courses",
    });
  }
};

module.exports = {
  getAssignedClassStudents,
  getStudentDetails,
  getAssignedCourses,
};