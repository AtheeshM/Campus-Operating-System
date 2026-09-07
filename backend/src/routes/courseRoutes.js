const express = require("express");

const {
  createCourse,
  getCourses,
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createCourse
);

router.get(
  "/",
  authMiddleware,
  getCourses
);

module.exports = router;