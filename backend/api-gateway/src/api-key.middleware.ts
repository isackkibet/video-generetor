import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const PUBLIC_PATHS = [
  "/health",
  "/health/deep",
  "/metrics",
  "/feed/seed",
  "/feed/events",
  "/feed/diagnostics",
];

@Injectable()
export class ApiGatewayKeyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const requestPath = req.originalUrl ?? req.url ?? "";
    if (PUBLIC_PATHS.some((path) => requestPath.startsWith(path))) {
      return next();
    }

    const key = req.headers["x-api-key"];
    if (!process.env.API_GATEWAY_KEY || key !== process.env.API_GATEWAY_KEY) {
      throw new UnauthorizedException("Invalid API gateway key");
    }

    next();
  }
}
