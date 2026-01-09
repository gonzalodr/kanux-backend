import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.MS_SUBSCRIPTIONS_PORT || 3005;

app.listen(PORT, () => {
  console.log("ms-subscriptions running on port " + PORT);
});
