import express from "express";
import cors from "cors";
import authRoutes from "./auth/routes/auth.routes"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-auth",
    status: "ok"
  });
});

app.use("/auth",authRoutes);

export default app;
