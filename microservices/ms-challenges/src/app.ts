import express from "express";
import cors from "cors";
import challengesRouter from "./modules/crud-challeges/routes/challenges.routes";
import softChallengesRoutes from "./modules/soft-challenges/soft-challenges.routes";
import technicalRoutes from "./modules/Technical-challenges/challenge.route";
import internalExecutionRoutes from "./modules/challenge-execution/internal-runner.route";
import feedbackRoutes from "./modules/feedback/feedback.route";

const app = express();

app.use(cors());
app.use(express.json());

// Manejo de errores de parseo JSON (body-parser)
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  if (err instanceof SyntaxError && (err as any).status === 400 && "body" in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  next(err);
});

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
app.use("/feedback", feedbackRoutes);

export default app;
