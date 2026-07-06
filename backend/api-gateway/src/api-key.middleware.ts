import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const PUBLIC_PATHS = ["/health", "/health/deep", "/metrics"];

@Injectable()
export class ApiGatewayKeyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (PUBLIC_PATHS.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const key = req.headers["x-api-key"];
    if (!process.env.API_GATEWAY_KEY || key !== process.env.API_GATEWAY_KEY) {
      return next(new UnauthorizedException("Invalid API gateway key"));
    }

    next();
  }
}
