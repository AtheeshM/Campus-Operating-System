const Assignment = require("../models/Assignment");
const AcademicMapping = require("../models/AcademicMapping");
const User = require("../models/User");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const path = require("path");

// =====================================================
// CREATE ASSIGNMENT - FACULTY
// =====================================================

const createAssignment = async (req, res) => {
  try {
    const {
      courseId,
      classId,
      title,
      description,
      dueDate,
    } = req.body;

    if (
      !courseId ||
      !classId ||
      !title ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Course, class, title and due date are required",
      });
    }

    const faculty = await User.findById(
      req.user.userId
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const mapping =
      await AcademicMapping.findOne({
        course: courseId,
        class: classId,
        faculty: faculty._id,
        status: "ACTIVE",
      });

    if (!mapping) {
      return res.status(403).json({
        success: false,
        message:
          "You can create assignments only for your assigned course and class",
      });
    }

    const assignment =
      await Assignment.create({
        title: title.trim(),
        description:
          description?.trim() || "",
        course: courseId,
        class: classId,
        faculty: faculty._id,
        dueDate,
      });

    const populatedAssignment =
      await Assignment.findById(
        assignment._id
      )
        .populate(
          "course",
          "code name department semester credits"
        )
        .populate(
          "class",
          "name department year section"
        );

    return res.status(201).json({
      success: true,
      message:
        "Assignment created successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error(
      "Create assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create assignment",
    });
  }
};

// =====================================================
// GET FACULTY ASSIGNMENTS
// =====================================================

const getFacultyAssignments = async (
  req,
  res
) => {
  try {
    const assignments =
      await Assignment.find({
        faculty: req.user.userId,
      })
        .populate(
          "course",
          "code name department semester"
        )
        .populate(
          "class",
          "name department year section"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get faculty assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve assignments",
    });
  }
};

// =====================================================
// GET STUDENT ASSIGNMENTS
// =====================================================

const getStudentAssignments = async (
  req,
  res
) => {
  try {
    const student = await User.findById(
      req.user.userId
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Student access required",
      });
    }

    if (!student.class) {
      return res.status(400).json({
        success: false,
        message:
          "Student is not assigned to a class",
      });
    }

    const assignments =
      await Assignment.find({
        class: student.class,
        status: "ACTIVE",
      })
        .populate(
          "course",
          "code name department semester credits"
        )
        .populate(
          "class",
          "name department year section"
        )
        .populate(
          "faculty",
          "email department facultyType"
        )
        .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get student assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve student assignments",
    });
  }
};

// =====================================================
// GET ASSIGNMENT DETAILS - STUDENT
// =====================================================

const getAssignmentDetails = async (
  req,
  res
) => {
  try {
    const student = await User.findById(
      req.user.userId
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (student.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Student access required",
      });
    }

    if (!student.class) {
      return res.status(400).json({
        success: false,
        message:
          "Student is not assigned to a class",
      });
    }

    const assignment =
      await Assignment.findOne({
        _id: req.params.assignmentId,
        class: student.class,
        status: "ACTIVE",
      })
        .populate(
          "course",
          "code name department semester credits"
        )
        .populate(
          "class",
          "name department year section"
        )
        .populate(
          "faculty",
          "email department facultyType"
        );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(
      "Get assignment details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve assignment details",
    });
  }
};

// =====================================================
// SUBMIT ASSIGNMENT - STUDENT
// =====================================================

const submitAssignment = async (
  req,
  res
) => {
  try {
    const { assignmentId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Submission file is required",
      });
    }

    const student = await User.findById(
      req.user.userId
    );

    if (
      !student ||
      student.role !== "STUDENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Student access required",
      });
    }

    if (!student.class) {
      return res.status(400).json({
        success: false,
        message:
          "Student class is not assigned",
      });
    }

    const assignment =
      await Assignment.findOne({
        _id: assignmentId,
        class: student.class,
        status: "ACTIVE",
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const existingSubmission =
      await AssignmentSubmission.findOne({
        assignment: assignment._id,
        student: student._id,
      });

    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message:
          "You have already submitted this assignment",
      });
    }

    const originalFileName =
      Buffer.from(
        req.file.originalname,
        "latin1"
      ).toString("utf8");

    const submission =
      await AssignmentSubmission.create({
        assignment: assignment._id,
        student: student._id,
        filePath: req.file.path,
        originalFileName,
      });

    return res.status(201).json({
      success: true,
      message:
        "Assignment submitted successfully",
      submission: {
        id: submission._id,
        assignment:
          submission.assignment,
        student: submission.student,
        originalFileName:
          submission.originalFileName,
        submittedAt:
          submission.submittedAt,
        status: submission.status,
      },
    });
  } catch (error) {
    console.error(
      "Submit assignment error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET STUDENT'S SUBMISSION
// =====================================================

const getAssignmentSubmission = async (
  req,
  res
) => {
  try {
    const { assignmentId } = req.params;

    const student = await User.findById(
      req.user.userId
    );

    if (
      !student ||
      student.role !== "STUDENT"
    ) {
      return res.status(403).json({
        success: false,
        message: "Student access required",
      });
    }

    if (!student.class) {
      return res.status(400).json({
        success: false,
        message:
          "Student class is not assigned",
      });
    }

    const assignment =
      await Assignment.findOne({
        _id: assignmentId,
        class: student.class,
      });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const submission =
      await AssignmentSubmission.findOne({
        assignment: assignment._id,
        student: student._id,
      });

    return res.status(200).json({
      success: true,
      submission: submission
        ? {
            id: submission._id,
            originalFileName:
              submission.originalFileName,
            submittedAt:
              submission.submittedAt,
            marks: submission.marks,
            feedback:
              submission.feedback,
            status: submission.status,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Get assignment submission error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET FACULTY ASSIGNMENT SUBMISSIONS
// =====================================================

const getFacultyAssignmentSubmissions =
  async (req, res) => {
    try {
      const { assignmentId } = req.params;

      const assignment =
        await Assignment.findOne({
          _id: assignmentId,
          faculty: req.user.userId,
        })
          .populate("course")
          .populate("class");

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      const submissions =
        await AssignmentSubmission.find({
          assignment: assignment._id,
        })
          .populate(
            "student",
            "email department class"
          )
          .sort({ submittedAt: -1 });

      return res.status(200).json({
        success: true,
        assignment,
        submissions,
      });
    } catch (error) {
      console.error(
        "Get faculty assignment submissions error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// =====================================================
// EVALUATE ASSIGNMENT SUBMISSION - FACULTY
// =====================================================

const evaluateAssignmentSubmission =
  async (req, res) => {
    try {
      const { submissionId } =
        req.params;

      const {
        marks,
        feedback,
      } = req.body;

      if (
        marks === undefined ||
        marks === null ||
        marks === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Marks are required",
        });
      }

      const numericMarks = Number(marks);

      if (
        Number.isNaN(numericMarks) ||
        numericMarks < 0 ||
        numericMarks > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Marks must be between 0 and 100",
        });
      }

      const submission =
        await AssignmentSubmission.findById(
          submissionId
        ).populate("assignment");

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      if (
        submission.assignment.faculty.toString() !==
        req.user.userId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to evaluate this submission",
        });
      }

      submission.marks = numericMarks;

      submission.feedback =
        typeof feedback === "string"
          ? feedback.trim()
          : "";

      submission.status = "REVIEWED";

      await submission.save();

      return res.status(200).json({
        success: true,
        message:
          "Assignment evaluated successfully",
        submission,
      });
    } catch (error) {
      console.error(
        "Evaluate assignment submission error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };


  // =====================================================
// VIEW / DOWNLOAD ASSIGNMENT SUBMISSION - FACULTY
// =====================================================

const downloadAssignmentSubmission = async (
  req,
  res
) => {
  try {
    const { submissionId } = req.params;

    const submission =
      await AssignmentSubmission.findById(
        submissionId
      ).populate("assignment");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Make sure the logged-in faculty owns this assignment
    if (
      submission.assignment.faculty.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this submission",
      });
    }

    const filePath = path.resolve(
      submission.filePath
    );

    return res.sendFile(filePath, {
      headers: {
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error(
      "Download assignment submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to open submission",
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createAssignment,
  getFacultyAssignments,
  getStudentAssignments,
  getAssignmentDetails,
  submitAssignment,
  getAssignmentSubmission,
  getFacultyAssignmentSubmissions,
  downloadAssignmentSubmission,
  evaluateAssignmentSubmission,
};