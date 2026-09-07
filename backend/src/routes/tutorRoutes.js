const express = require("express");

const {
  getAssignedClassStudents,
  getStudentDetails,
  getAssignedCourses,
} = require("../controllers/tutorController");

const authMiddleware = require("../middleware/authMiddleware");
const tutorMiddleware = require("../middleware/tutorMiddleware");

const router = express.Router();

router.get(
  "/courses",
  authMiddleware,
  tutorMiddleware,
  getAssignedCourses
);

router.get(
  "/students",
  authMiddleware,
  tutorMiddleware,
  getAssignedClassStudents
);

router.get(
  "/students/:studentId",
  authMiddleware,
  tutorMiddleware,
  getStudentDetails
);

module.exports = router;