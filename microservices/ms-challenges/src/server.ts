import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.MS_CHALLENGES_PORT || 3003;

app.listen(PORT, () => {
  console.log("ms-challenges running on port " + PORT);
});
