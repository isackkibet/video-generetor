import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole, ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly reflector = new Reflector();

  canActivate(context: ExecutionContext): boolean {
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    const roles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin;

    if (!admin || !roles.includes(admin.role)) {
      throw new ForbiddenException('Insufficient admin permissions');
    }

    return true;
  }
}
