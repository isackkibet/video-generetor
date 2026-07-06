import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../../shared/admin-jwt.guard';
import { RolesGuard } from '../../shared/roles.guard';
import { Roles } from '../../shared/roles.decorator';
import { ProgramManagementService } from '../../shared/program-management.service';

@Controller('program-management')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class ProgramManagementController {
  constructor(private readonly programManagementService: ProgramManagementService) {}

  @Get('dashboard')
  async getDashboard() {
    return {
      success: true,
      data: await this.programManagementService.getDashboard(),
    };
  }
}
