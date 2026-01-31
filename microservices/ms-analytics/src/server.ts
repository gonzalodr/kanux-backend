import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["PORT", "DATABASE_URL", "JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

dotenv.config();

const PORT = process.env.PORT || 3008;

app.listen(PORT, () => {
  console.log("ms-analytics running on port " + PORT);
});
