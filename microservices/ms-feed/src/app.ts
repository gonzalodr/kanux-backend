import express from "express";
import cors from "cors";
import feedRoutes from "./module/feed/routes/feed.routes"
import commentRoutes from "./module/comment/routes/comment.route"
import reactionRoute from "./module/reaction/routes/reaction.route"

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
app.use("/feed",commentRoutes);
app.use("/feed",reactionRoute);

export default app;
