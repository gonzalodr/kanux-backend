
import dotenv from "dotenv";

dotenv.config();
import app from "./app";
const requiredEnv = ["PORT", "DATABASE_URL", "JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

dotenv.config();

const PORT = process.env.MS_COMPANIES_PORT || 3004;

app.listen(PORT, () => {
  console.log("ms-companies running on port " + PORT);
});
