import express from "express";
import cors from "cors";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import talentAnalyticsRoutes from "./modules/talent-analytics/talent-analytics.routes";

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
app.use("/", talentAnalyticsRoutes);

export default app;
