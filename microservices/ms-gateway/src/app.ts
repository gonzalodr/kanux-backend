import { IncomingMessage, ServerResponse } from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import { proxyConfigs } from "./proxies";

const app = express();

// Security & Utils
app.use(helmet());
app.use(cors());

// Health Check
app.get("/health", (_req, res) => {
  res.json({
    service: "ms-gateway",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Dynamic Proxy Loading
proxyConfigs.forEach((proxyConfig) => {
  app.use(
    proxyConfig.context,
    createProxyMiddleware({
      target: proxyConfig.target,
      changeOrigin: true,
      ws: true,
      pathRewrite: proxyConfig.pathRewrite,
      on: {
        proxyRes: (
          proxyRes: IncomingMessage,
          req: IncomingMessage,
          res: ServerResponse,
        ) => {
          console.log(`Proxy Response [${proxyConfig.context}]:`, {
            statusCode: proxyRes.statusCode,
            headers: proxyRes.headers,
          });
        },
        error: (
          err: Error,
          req: IncomingMessage,
          res: ServerResponse | any,
        ) => {
          console.error(`Proxy Error [${proxyConfig.context}]:`, err);
          if (res.writeHead) {
            res.writeHead(500, {
              "Content-Type": "application/json",
            });
            res.end(JSON.stringify({ message: "Service Unavailable" }));
          }
        },
      },
    }),
  );
});

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Gateway Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  },
);

export default app;
