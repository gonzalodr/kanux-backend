import express from "express";
import cors from "cors";
import challengesRouter from './modules/crud-challeges/routes/challenges.routes';
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
app.use("/challenges",challengesRouter);

app.use("/soft-challenges", softChallengesRoutes);

export default app;
