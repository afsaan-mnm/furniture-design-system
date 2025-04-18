require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded background images
app.use("/uploads", express.static(path.join(__dirname, "assets", "Upload")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/designs", require("./routes/designs"));

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});