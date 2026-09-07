const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Class = require("../models/Class");

const createUser = async (req, res) => {
  try {
    const { email, password, role, department, classId } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    if (!["STUDENT", "FACULTY"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Admin can enroll only STUDENT or FACULTY",
      });
    }

    if (role === "STUDENT" && !classId) {
  return res.status(400).json({
    success: false,
    message: "Class is required when enrolling a student",
  });
}

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    let selectedClass = null;

if (role === "STUDENT") {
  selectedClass = await Class.findById(classId);

  if (!selectedClass) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (
    department &&
    selectedClass.department.trim().toLowerCase() !==
      department.trim().toLowerCase()
  ) {
    return res.status(400).json({
      success: false,
      message: "Student department does not match the selected class",
    });
  }
}

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
       email: normalizedEmail,
       passwordHash,
       role,
       department: department || null,
       class: role === "STUDENT" ? selectedClass._id : null,
       status: "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: `${role} enrolled successfully`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: user.department,
        class: user.class,
        status: user.status,
      },
    });
  } catch (error) {
  console.error("Create user error:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to enroll user",
  });
}
};

const designateHOD = async (req, res) => {
  try {
    const { userId } = req.params;

    const faculty = await User.findById(userId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    if (faculty.role !== "FACULTY") {
      return res.status(400).json({
        success: false,
        message: "Only faculty members can be designated as HOD",
      });
    }

    faculty.facultyType = "HOD";

    await faculty.save();

    return res.status(200).json({
      success: true,
      message: "Faculty designated as HOD successfully",
      user: {
        id: faculty._id,
        email: faculty.email,
        role: faculty.role,
        facultyType: faculty.facultyType,
        department: faculty.department,
        status: faculty.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to designate HOD",
    });
  }
};

const getFaculty = async (req, res) => {
  try {
    const faculty = await User.find({
      role: "FACULTY",
    })
      .select("-passwordHash")
      .sort({
        department: 1,
        email: 1,
      });

    return res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    console.error("Get faculty error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
    });
  }
};

module.exports = {
  createUser,
  designateHOD,
  getFaculty,
};