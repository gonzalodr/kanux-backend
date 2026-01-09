import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.MS_PROFILES_PORT || 3002;

app.listen(PORT, () => {
  console.log("ms-profiles running on port " + PORT);
});
