import express from "express";
import cors from "cors";
import analyticsRoutes from "./modules/analytics/analytics.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-auth",
    status: "ok",
  });
});

app.use("/", analyticsRoutes);

export default app;
