const express = require("express");

const {
  chatWithAI,
} = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/chat",
  authMiddleware,
  chatWithAI
);

module.exports = router;