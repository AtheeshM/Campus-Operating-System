require("dotenv").config();

const express = require("express");
const connectDatabase = require("./config/database");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CampusOS backend is running",
  });
});

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`CampusOS backend running on http://localhost:${PORT}`);
  });
};

startServer();