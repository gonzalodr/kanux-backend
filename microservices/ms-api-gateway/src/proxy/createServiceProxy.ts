import { createProxyMiddleware } from "http-proxy-middleware";
import { Router } from "express";
import { Socket } from "net";

interface ServiceProxyConfig {
  target: string | undefined;
  serviceName: string;
}

export function createServiceProxy({
  target,
  serviceName,
}: ServiceProxyConfig): Router {
  if (!target) {
    throw new Error(`Missing environment variable for ${serviceName} service`);
  }

  const router = Router();

  router.use(
    createProxyMiddleware({
      target,
      changeOrigin: true,

      on: {
        proxyReq(proxyReq, req) {
          console.log(
            `[Gateway → ${serviceName}] ${req.method} ${req.originalUrl}`
          );
        },

        error(err, req, res) {
          console.error(`[${serviceName}] Proxy error:`, err.message);

          if (res instanceof Socket) {
            res.end();
            return;
          }

          res.status(503).json({
            message: `${serviceName} service unavailable`,
          });
        },
      },
    })
  );

  return router;
}
