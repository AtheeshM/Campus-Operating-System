const User = require("../models/User");
const Class = require("../models/Class");

const assignTutor = async (req, res) => {
  try {
    const { classId } = req.params;
    const { tutorId } = req.body;

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID is required",
      });
    }

    // Fetch the current HOD from the database
    const hod = await User.findById(req.user.userId);

    if (!hod) {
      return res.status(404).json({
        success: false,
        message: "HOD not found",
      });
    }

    if (
      hod.role !== "FACULTY" ||
      hod.facultyType !== "HOD"
    ) {
      return res.status(403).json({
        success: false,
        message: "HOD access required",
      });
    }

    const targetClass = await Class.findById(classId);

    if (!targetClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // HOD can manage only classes in their department
    if (
      !hod.department ||
      hod.department.toLowerCase() !==
        targetClass.department.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "HOD can manage only classes in their department",
      });
    }

    const tutor = await User.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    if (tutor.role !== "FACULTY") {
      return res.status(400).json({
        success: false,
        message: "Only faculty members can be assigned as tutors",
      });
    }

    if (tutor.facultyType === "HOD") {
      return res.status(400).json({
        success: false,
        message: "HOD cannot be assigned as a tutor",
      });
    }

    if (
      !tutor.department ||
      tutor.department.toLowerCase() !==
        targetClass.department.toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: "Tutor and class must belong to the same department",
      });
    }

    tutor.facultyType = "TUTOR";
    await tutor.save();

    targetClass.tutor = tutor._id;
    await targetClass.save();

    return res.status(200).json({
      success: true,
      message: "Tutor assigned to class successfully",
      class: {
        id: targetClass._id,
        name: targetClass.name,
        department: targetClass.department,
        year: targetClass.year,
        section: targetClass.section,
        tutor: {
          id: tutor._id,
          email: tutor.email,
          facultyType: tutor.facultyType,
        },
      },
    });
  } catch (error) {
    console.error("Assign tutor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign tutor",
    });
  }
};


// HOD can monitor all students in their department
const getDepartmentStudents = async (req, res) => {
  try {
    // Fetch the current HOD from the database
    const hod = await User.findById(req.user.userId);

    if (!hod) {
      return res.status(404).json({
        success: false,
        message: "HOD not found",
      });
    }

    if (
      hod.role !== "FACULTY" ||
      hod.facultyType !== "HOD"
    ) {
      return res.status(403).json({
        success: false,
        message: "HOD access required",
      });
    }

    if (!hod.department) {
      return res.status(400).json({
        success: false,
        message: "HOD department is not configured",
      });
    }

    const students = await User.find({
      role: "STUDENT",
      department: hod.department,
    })
      .select("_id email department class status")
      .populate("class", "name department year section tutor");

    return res.status(200).json({
      success: true,
      message: "Department students retrieved successfully",
      department: hod.department,
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
    console.error("Get department students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve department students",
    });
  }
};

module.exports = {
  assignTutor,
  getDepartmentStudents,
};