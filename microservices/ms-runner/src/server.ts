import dotenv from "dotenv";
import app from "./app";
import { RUNNER_AUTH_TOKEN, RUNNER_PORT } from "./config/constants";

dotenv.config();

if (!RUNNER_AUTH_TOKEN) {
  throw new Error("RUNNER_AUTH_TOKEN is required for ms-runner");
}

const PORT = RUNNER_PORT;

app.listen(PORT, () => {
  console.log(`ms-runner listening on port ${PORT}`);
});
