import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";

export type AdminJwtPayload = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "CONTENT_ADMIN" | "MODERATOR" | "VIEWER";
};

@Injectable()
export class AdminJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers["authorization"];

    if (!header || typeof header !== "string") {
      throw new UnauthorizedException("Missing authorization header");
    }

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization format");
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.ADMIN_JWT_SECRET || "",
      ) as AdminJwtPayload;
      request.admin = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired admin token");
    }
  }
}
