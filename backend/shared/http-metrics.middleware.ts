import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { httpRequestDurationMs, httpRequestsTotal } from "./metrics";
@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - startedAt;
      const service = process.env.SERVICE_NAME || "unknown-service";
      const route = req.route?.path || req.path || "unknown";
      httpRequestsTotal.inc({
        service,
        method: req.method,
        route,
        status: String(res.statusCode),
      });
      httpRequestDurationMs.observe(
        {
          service,
          method: req.method,
          route,
          status: String(res.statusCode),
        },
        duration,
      );
    });
    next();
  }
}
