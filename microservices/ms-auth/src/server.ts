import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.MS_AUTH_PORT || 3001;

app.listen(PORT, () => {
  console.log("ms-auth running on port " + PORT);
});
