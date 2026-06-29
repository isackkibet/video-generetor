import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
@Injectable()
export class ServiceAuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === "development") {
      return next();
    }
    const header = req.headers["x-service-auth"];
    if (
      !process.env.SERVICE_AUTH_KEY ||
      header !== process.env.SERVICE_AUTH_KEY
    ) {
      throw new UnauthorizedException("Invalid service auth");
    }
    next();
  }
}
