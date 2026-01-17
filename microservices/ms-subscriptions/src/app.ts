import express from "express";
import cors from "cors";
import planRoutes from './modules/plans/routes/plans.routes'
import subscriptionRoutes from "./modules/subscriptions/routes/subscriptions.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/plans", planRoutes);
app.use("/subscriptions", subscriptionRoutes);

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-subscriptions",
    status: "ok"
  });
});

export default app;
