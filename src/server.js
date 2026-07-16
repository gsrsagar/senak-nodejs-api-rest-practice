import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`================================================`);
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📖 Swagger Docs: http://localhost:${port}/api-docs`);
  console.log(`================================================`);
});
