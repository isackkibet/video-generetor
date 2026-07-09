import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class ServiceAuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers["x-service-auth"];
    if (
      !process.env.SERVICE_AUTH_KEY ||
      header !== process.env.SERVICE_AUTH_KEY
    ) {
      return next(new UnauthorizedException("Invalid service auth"));
    }
    next();
  }
}
