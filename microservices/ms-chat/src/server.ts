import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.MS_CHAT_PORT || 3006;

app.listen(PORT, () => {
  console.log("ms-chat running on port " + PORT);
});
