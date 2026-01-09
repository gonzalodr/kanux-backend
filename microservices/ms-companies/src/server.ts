import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.MS_COMPANIES_PORT || 3004;

app.listen(PORT, () => {
  console.log("ms-companies running on port " + PORT);
});
