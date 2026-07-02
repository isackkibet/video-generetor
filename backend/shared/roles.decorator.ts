import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type AdminRole = 'SUPER_ADMIN' | 'CONTENT_ADMIN' | 'MODERATOR' | 'VIEWER';

export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
