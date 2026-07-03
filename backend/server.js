import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { connectDB, disconnectDB } from "./config/db.js";

// Routes imports
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import noticeRoutes from "./routes/notices.js";
import settingsRoutes from "./routes/settings.js";
import dashboardRoutes from "./routes/dashboard.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

import User from "./models/User.js";
import { seedDatabase } from "./config/seed.js";

// Connect to Database
await connectDB();

// Auto-seed if database is empty
try {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log("Database is empty. Running auto-seed...");
    await seedDatabase();
  } else {
    console.log(`Database already populated with ${userCount} users. Skipping auto-seed.`);
  }
} catch (err) {
  console.error("Failed to check/seed database on startup:", err.message);
}

// Middlewares
app.use(cors()); // Allow all origins for dev simplicity
app.use(express.json({ limit: "10mb" })); // Support large base64 strings if needed
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.resolve("uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Society Maintenance Tracker API is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Unhandled route handler (404)
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Unhandled error handler (500)
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message || "An unexpected error occurred",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    await disconnectDB();
    console.log("Database connection closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
