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

const PORT = process.env.MS_CHALLENGES_PORT || 3003;

app.listen(PORT, () => {
  console.log("ms-challenges running on port " + PORT);
});
