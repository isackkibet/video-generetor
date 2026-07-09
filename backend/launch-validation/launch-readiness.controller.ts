import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { AdminJwtGuard } from '../shared/admin-jwt.guard';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';
import { LaunchReadinessService } from './launch-readiness.service';

@Controller('launch-readiness')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class LaunchReadinessController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async readiness() {
    return {
      success: true,
      data: await new LaunchReadinessService(this.prisma).evaluate(),
    };
  }
}
