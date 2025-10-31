import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

// Import PMS routes
import authRoutes from "./api/routes/auth.js";
import projectRoutes from "./api/routes/projects.js";
import reportRoutes from "./api/routes/reports.js";
import taskRoutes from "./api/routes/tasks.js";
import milestoneRoutes from "./api/routes/milestones.js";
import riskRoutes from "./api/routes/risks.js";
import issueRoutes from "./api/routes/issues.js";
import fileRoutes from "./api/routes/files.js";
import aiRoutes from "./api/routes/ai.js";

// Import Swagger
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (parent directory)
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

// Swagger/OpenAPI configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PaxiPM AI API",
      version: "1.0.0",
      description: "AI-driven Project Management SaaS API Documentation",
      contact: {
        name: "PaxiPM AI Support",
        email: "support@paxipm.ai"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./api/routes/*.js", "./app.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test route
/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Backend is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PaxiPM AI Backend Running
 */
app.get("/", (req, res) => {
  res.json({ message: "PaxiPM AI Backend Running" });
});

// Simplified charter route (no auth) for testing - MUST be BEFORE router mounts
// This allows frontend to work without authentication during development
app.post("/api/ai/charter", async (req, res) => {
  try {
    const response = await axios.post(`${AI_ENGINE_URL}/generate-charter`, req.body, {
      timeout: 5000
    });
    res.json(response.data);
  } catch (error) {
    console.error("AI Engine connection failed:", error.message);
    // Return placeholder response so frontend works even when AI Engine is down
    res.json({
      projectName: req.body.projectName || "Project",
      charter: `AI-generated charter for ${req.body.projectName || "Project"}\n\n${req.body.description || ""}\n\n[Note: AI Engine is not running - this is a placeholder response]`
    });
  }
});

// PMS Routes Integration
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/risks", riskRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
