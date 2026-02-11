import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["PORT", "DATABASE_URL", "JWT_SECRET"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const PORT = process.env.MS_FEED_PORT || 3007;

app.listen(PORT, () => {
  console.log("ms-feed running on port " + PORT);
});
