require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDatabase = require("./config/database");

const app = express();

const PORT = process.env.PORT || 5000;

// ===============================
// ROUTES
// ===============================

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const classRoutes = require("./routes/classRoutes");
const hodRoutes = require("./routes/hodRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const courseRoutes = require("./routes/courseRoutes");
const academicMappingRoutes = require("./routes/academicMappingRoutes");
const materialRoutes = require("./routes/materialRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const aiRoutes = require("./routes/aiRoutes");

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// API ROUTES
// ===============================

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/academic-mappings", academicMappingRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/assignments", assignmentRoutes);

// 🐼 CampusOS AI
app.use("/api/ai", aiRoutes);

// ===============================
// UPLOADED FILES
// ===============================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CampusOS backend is running",
  });
});

// ===============================
// START SERVER
// ===============================

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `CampusOS backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start CampusOS backend:",
      error
    );

    process.exit(1);
  }
};

startServer();