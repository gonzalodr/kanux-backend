import express from "express";
import cors from "cors";
import executionRoutes from "./modules/execution/execution.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "512kb" }));

app.get("/health", (_req, res) => {
  res.json({ service: "ms-runner", status: "ok" });
});

app.use("/execute", executionRoutes);

export default app;
