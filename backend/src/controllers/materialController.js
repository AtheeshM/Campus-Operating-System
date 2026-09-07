const path = require("path");

const User = require("../models/User");
const AcademicMapping = require("../models/AcademicMapping");
const LearningMaterial = require("../models/LearningMaterial");

const getFileType = (mimeType, fileName) => {
  const extension = path
    .extname(fileName)
    .toLowerCase();

  if (mimeType === "application/pdf" || extension === ".pdf") {
    return "PDF";
  }

  if (
    extension === ".ppt" ||
    extension === ".pptx"
  ) {
    return "PRESENTATION";
  }

  if (
    extension === ".doc" ||
    extension === ".docx"
  ) {
    return "DOCUMENT";
  }

  if (
    extension === ".jpg" ||
    extension === ".jpeg" ||
    extension === ".png" ||
    extension === ".webp"
  ) {
    return "IMAGE";
  }

  if (mimeType.startsWith("video/")) {
    return "VIDEO";
  }

  if (mimeType.startsWith("audio/")) {
    return "AUDIO";
  }

  return "OTHER";
};

const uploadMaterial = async (req, res) => {
  try {
    const { courseId, classId, title, description } =
      req.body;

    if (!courseId || !classId || !title) {
      return res.status(400).json({
        success: false,
        message:
          "Course, class and title are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Material file is required",
      });
    }

    const faculty = await User.findById(req.user.userId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    if (
      faculty.role !== "FACULTY"
    ) {
      return res.status(403).json({
        success: false,
        message: "Faculty access required",
      });
    }

    const mapping = await AcademicMapping.findOne({
      faculty: faculty._id,
      course: courseId,
      class: classId,
      status: "ACTIVE",
    });

    if (!mapping) {
      return res.status(403).json({
        success: false,
        message:
          "You can upload materials only for your assigned course and class",
      });
    }

    const material = await LearningMaterial.create({
      title,
      description: description || "",

      course: courseId,
      class: classId,

      uploadedBy: faculty._id,

      originalFileName: req.file.originalname,
      storedFileName: req.file.filename,

      filePath: `uploads/materials/${req.file.filename}`,

      fileType: getFileType(
        req.file.mimetype,
        req.file.originalname
      ),

      mimeType: req.file.mimetype,
      fileSize: req.file.size,
    });

    const populatedMaterial =
      await LearningMaterial.findById(
        material._id
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
      message: "Learning material uploaded successfully",
      material: populatedMaterial,
    });
  } catch (error) {
    console.error(
      "Upload material error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to upload learning material",
    });
  }
};

const getFacultyMaterials = async (req, res) => {
  try {
    const faculty = await User.findById(req.user.userId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const mappings = await AcademicMapping.find({
      faculty: faculty._id,
      status: "ACTIVE",
    }).select("course class");

    if (mappings.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        materials: [],
      });
    }

    const conditions = mappings.map(
      (mapping) => ({
        course: mapping.course,
        class: mapping.class,
      })
    );

    const materials =
      await LearningMaterial.find({
        status: "ACTIVE",
        $or: conditions,
      })
        .populate(
          "course",
          "code name department semester credits"
        )
        .populate(
          "class",
          "name department year section"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error(
      "Get faculty materials error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve materials",
    });
  }
};

const getStudentMaterials = async (req, res) => {
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
      return res.status(404).json({
        success: false,
        message: "Student is not assigned to a class",
      });
    }

    const mappings = await AcademicMapping.find({
      class: student.class,
      status: "ACTIVE",
    }).select("course");

    const courseIds = mappings.map(
      (mapping) => mapping.course
    );

    const materials =
      await LearningMaterial.find({
        class: student.class,
        course: { $in: courseIds },
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
        .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error(
      "Get student materials error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve student materials",
    });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const faculty = await User.findById(
      req.user.userId
    );

    const material =
      await LearningMaterial.findOne({
        _id: materialId,
        uploadedBy: faculty._id,
      });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    material.status = "INACTIVE";

    await material.save();

    return res.status(200).json({
      success: true,
      message: "Material removed successfully",
    });
  } catch (error) {
    console.error(
      "Delete material error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove material",
    });
  }
};

module.exports = {
  uploadMaterial,
  getFacultyMaterials,
  getStudentMaterials,
  deleteMaterial,
};