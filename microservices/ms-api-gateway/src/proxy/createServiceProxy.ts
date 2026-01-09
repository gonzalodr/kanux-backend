import { createProxyMiddleware } from "http-proxy-middleware";
import { Router } from "express";
import { Socket } from "net";

interface ServiceProxyConfig {
  basePath: string;
  target: string | undefined;
  serviceName: string;
}

export function createServiceProxy({
  basePath,
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
      pathRewrite: {
        [`^${basePath}`]: "",
      },
      on: {
        error(err, req, res) {
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
