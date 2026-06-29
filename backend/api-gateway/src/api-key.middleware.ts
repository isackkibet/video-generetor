import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
@Injectable()
export class ApiGatewayKeyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === "development") {
      return next();
    }
    const key = req.headers["x-api-key"];
    if (!process.env.API_GATEWAY_KEY || key !== process.env.API_GATEWAY_KEY) {
      throw new UnauthorizedException("Invalid API gateway key");
    }
    next();
  }
}
