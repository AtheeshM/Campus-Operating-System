const express = require("express");

const {
  createAcademicMapping,
  getAcademicMappings,
} = require("../controllers/academicMappingController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAcademicMappings
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createAcademicMapping
);

module.exports = router;