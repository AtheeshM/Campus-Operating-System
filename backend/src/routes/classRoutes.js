const express = require("express");

const {
  createClass,
  getClasses,
} = require("../controllers/classController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getClasses
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createClass
);

module.exports = router;