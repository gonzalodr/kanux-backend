import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["PORT", "DATABASE_URL", "JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const PORT = process.env.MS_AUTH_PORT || 3001;

app.listen(PORT, () => {
  console.log("ms-auth running on port " + PORT);
});
