import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../shared/admin-jwt.guard';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';
import { V4ClosureCertificationService } from '../diagnostics/v4-closure-certification.service';

@Controller('diagnostic-v4')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class V4ClosureController {
  constructor(private readonly service: V4ClosureCertificationService) {}

  @Get('closure-report')
  async closureReport() {
    return {
      success: true,
      data: await this.service.generateClosureReport(),
    };
  }
}
