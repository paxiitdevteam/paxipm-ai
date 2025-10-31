// Backend application entry point
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./api/routes/auth.js";
import projectRoutes from "./api/routes/projects.js";
import aiRoutes from "./api/routes/ai.js";
import reportRoutes from "./api/routes/reports.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "PaxiPM AI Backend Running" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "PaxiPM AI Backend is running" });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
