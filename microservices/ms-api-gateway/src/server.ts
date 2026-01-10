import dotenv from "dotenv";
dotenv.config();

const requiredEnv = [
  "PORT",
  "MS_AUTH_URL",
  "MS_PROFILES_URL",
  "MS_CHALLENGES_URL",
  "MS_COMPANIES_URL",
  "MS_SUBSCRIPTIONS_URL",
  "MS_CHATS_URL",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

import app from "./app";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
