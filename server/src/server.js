
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.json({ message: "FELG API is running!" });
});

app.get("/", (req, res) => {
  res.json({
    message: "FELG API is running!"
  });
});

app.listen(PORT, () => {
  console.log(`FELG API is running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`FELG API is running on port ${PORT}`);
});