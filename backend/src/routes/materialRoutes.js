const express = require("express");

const {
  uploadMaterial,
  getFacultyMaterials,
  getStudentMaterials,
  deleteMaterial,
} = require("../controllers/materialController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadMaterial
);

router.get(
  "/faculty",
  authMiddleware,
  getFacultyMaterials
);

router.get(
  "/student",
  authMiddleware,
  getStudentMaterials
);

router.delete(
  "/:materialId",
  authMiddleware,
  deleteMaterial
);

module.exports = router;