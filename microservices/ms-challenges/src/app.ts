import express from "express";
import cors from "cors";
import softChallengesRoutes from "./modules/soft-challenges/soft-challenges.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-challenges",
    status: "ok",
  });
});

app.use("/soft-challenges", softChallengesRoutes);

export default app;
