import express from "express";
import cors from "cors";
import challengesRouter from "./modules/crud-challeges/routes/challenges.routes";
import softChallengesRoutes from "./modules/soft-challenges/soft-challenges.routes";
import technicalRoutes from "./modules/Technical-challenges/challenge.route";
import internalExecutionRoutes from "./modules/challenge-execution/internal-runner.route";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-challenges",
    status: "ok",
  });
});
app.use("/challenges", challengesRouter);

app.use("/soft-challenges", softChallengesRoutes);
app.use("/technical-challenges", technicalRoutes);
app.use("/internal/technical-challenges", internalExecutionRoutes);

export default app;
