import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import courseRoutes from "./routes/courseRoutes.js";
import subResourceRoutes from "./routes/subResourceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { setupSwagger } from "./swagger.js";

dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming request JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware to log HTTP headers and requests to console (highly educational)
app.use((req, res, next) => {
  console.log(`\n--- Incoming HTTP Request ---`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers:`);
  console.log(`  Accept: ${req.headers["accept"] || "N/A"}`);
  console.log(`  Content-Type: ${req.headers["content-type"] || "N/A"}`);
  console.log(`  User-Agent: ${req.headers["user-agent"] || "N/A"}`);
  
  // Set default response headers
  res.setHeader("X-Powered-By", "NodeJS Express Firestore API");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  
  next();
});

// Root educational route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Course Management REST API",
    documentation: "/api-docs",
    status: "Healthy",
    center: {
      name: "Senak 360",
      address: "Nellore, Andhra Pradesh",
      contact: {
        mobile: "7680919598",
        email: "info@senak360.com",
        youtubeUrl: "https://senak360.com/@Senak360"
      }
    }
  });
});

// Mount routes
app.use("/api/courses", courseRoutes);
app.use("/api/courses", subResourceRoutes); // Mount nested subjects and modules
app.use("/api/users", userRoutes); // Mount users resource routes
app.use("/api/auth", authRoutes); // Mount authentication routes

// Setup Swagger documentation
setupSwagger(app);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `The requested path '${req.originalUrl}' does not exist on this server.`,
    supportedMethods: req.method === "OPTIONS" ? ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] : undefined
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "An unexpected condition occurred on the server.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

export default app;
