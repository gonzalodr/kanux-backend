import express from "express";
import cors from "cors";
import messageRoutes from "./modules/messages/messages.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-chat",
    status: "ok",
  });
});

app.use("/messages", messageRoutes);

export default app;
