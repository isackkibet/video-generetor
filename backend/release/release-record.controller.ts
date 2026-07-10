import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../shared/admin-jwt.guard';
import { RolesGuard } from '../shared/roles.guard';
import { Roles } from '../shared/roles.decorator';
import { ReleaseRecordService } from './release-record.service';

@Controller('release')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class ReleaseRecordController {
  constructor(private readonly service: ReleaseRecordService) {}

  @Get('current')
  async current() {
    return {
      success: true,
      data: await this.service.getCurrentRelease(),
    };
  }

  @Post('record')
  async record(@Body() body: any) {
    return {
      success: true,
      data: await this.service.createReleaseRecord(body),
    };
  }
}
