const Class = require("../models/Class");

const createClass = async (req, res) => {
  try {
    const { name, department, year, section } = req.body;

    if (!name || !department || !year || !section) {
      return res.status(400).json({
        success: false,
        message: "Name, department, year and section are required",
      });
    }

    const existingClass = await Class.findOne({
      name: name.trim(),
      department: department.trim(),
      year,
      section: section.trim().toUpperCase(),
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "Class already exists",
      });
    }

    const newClass = await Class.create({
      name: name.trim(),
      department: department.trim(),
      year,
      section: section.trim().toUpperCase(),
    });

    return res.status(201).json({
      success: true,
      message: "Class created successfully",
      class: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create class",
    });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("tutor", "email")
      .sort({
        department: 1,
        year: 1,
        section: 1,
      });

    return res.status(200).json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch classes",
    });
  }
};

module.exports = {
  createClass,
  getClasses,
};
