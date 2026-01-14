import express from "express";
import cors from "cors";
import feedRoutes from "./module/feed/routes/feed.routes"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-feed",
    status: "ok",
  });
});

app.use("/feed",feedRoutes);

export default app;
