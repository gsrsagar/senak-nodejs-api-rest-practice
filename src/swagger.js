import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Course Management REST API",
      version: "1.0.0",
      description: "A complete CRUD REST API demonstrating the usage of standard HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS) and standard HTTP Headers. Implements a database layer via Firebase Firestore.",
      contact: {
        name: "Senak 360",
        url: "https://senak360.com",
        email: "info@senak360.com"
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local Development Server"
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
  // Expose Swagger JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
