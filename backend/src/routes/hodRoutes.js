const express = require("express");

const {
  assignTutor,
  getDepartmentStudents,
} = require("../controllers/hodController");

const authMiddleware = require("../middleware/authMiddleware");
const hodMiddleware = require("../middleware/hodMiddleware");

const router = express.Router();

router.patch(
  "/classes/:classId/assign-tutor",
  authMiddleware,
  hodMiddleware,
  assignTutor
);

router.get(
  "/students",
  authMiddleware,
  hodMiddleware,
  getDepartmentStudents
);

module.exports = router;