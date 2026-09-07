const express = require("express");

const {
  createUser,
  designateHOD,
  getFaculty,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/faculty",
  authMiddleware,
  adminMiddleware,
  getFaculty
);

router.post(
  "/users",
  authMiddleware,
  adminMiddleware,
  createUser
);

router.patch(
  "/users/:userId/designate-hod",
  authMiddleware,
  adminMiddleware,
  designateHOD
);

module.exports = router;