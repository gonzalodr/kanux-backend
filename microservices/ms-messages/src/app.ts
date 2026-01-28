import express from "express";
import cors from "cors";
import conversationsRoutes from "./modules/conversations/conversations.routes";
import messagesRoutes from "./modules/messages/messages.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "ms-chat",
    status: "ok",
  });
});

app.use("/conversations", conversationsRoutes);
app.use("/", messagesRoutes);
export default app;
