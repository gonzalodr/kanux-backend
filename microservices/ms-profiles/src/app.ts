import express from "express";
import cors from "cors";
import profilesRoutes from "./modules/profiles/profiles.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-talent-profiles",
    status: "ok",
  });
});

app.use("/profiles", profilesRoutes);

export default app;
