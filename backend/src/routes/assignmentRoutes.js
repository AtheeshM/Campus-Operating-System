const express = require("express");

const {
  createAssignment,
  getFacultyAssignments,
  getStudentAssignments,
  getAssignmentDetails,
  submitAssignment,
  getAssignmentSubmission,
  getFacultyAssignmentSubmissions,
  downloadAssignmentSubmission,
  evaluateAssignmentSubmission,
} = require("../controllers/assignmentController");

const authMiddleware = require("../middleware/authMiddleware");
const tutorMiddleware = require("../middleware/tutorMiddleware");
const studentMiddleware = require("../middleware/studentMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// FACULTY
// =====================================================

// Create assignment
router.post(
  "/",
  authMiddleware,
  tutorMiddleware,
  createAssignment
);

// Get faculty assignments
router.get(
  "/faculty",
  authMiddleware,
  tutorMiddleware,
  getFacultyAssignments
);

// Get submissions for a faculty assignment
router.get(
  "/faculty/:assignmentId/submissions",
  authMiddleware,
  tutorMiddleware,
  getFacultyAssignmentSubmissions
);

router.get(
  "/faculty/submissions/:submissionId/download",
  authMiddleware,
  tutorMiddleware,
  downloadAssignmentSubmission
);

// Evaluate a student submission
router.patch(
  "/submissions/:submissionId/evaluate",
  authMiddleware,
  tutorMiddleware,
  evaluateAssignmentSubmission
);

// =====================================================
// STUDENT
// =====================================================

// Get assignments
router.get(
  "/student",
  authMiddleware,
  studentMiddleware,
  getStudentAssignments
);

// Assignment details
router.get(
  "/student/:assignmentId",
  authMiddleware,
  studentMiddleware,
  getAssignmentDetails
);

// Submit assignment
router.post(
  "/student/:assignmentId/submission",
  authMiddleware,
  studentMiddleware,
  upload.single("file"),
  submitAssignment
);

// Get student's submission
router.get(
  "/student/:assignmentId/submission",
  authMiddleware,
  studentMiddleware,
  getAssignmentSubmission
);

module.exports = router;