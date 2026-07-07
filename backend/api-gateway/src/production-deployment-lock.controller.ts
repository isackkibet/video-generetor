import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../shared/validation';
import { validateParams } from '../../shared/query-validation';
import { ProductionDeploymentLockService } from '../../shared/production-deployment-lock.service';
import { AdminJwtGuard } from '../../shared/admin-jwt.guard';
import { RolesGuard } from '../../shared/roles.guard';
import { Roles } from '../../shared/roles.decorator';
import {
  createDeploymentLockSchema,
  deploymentLockReleaseSchema,
  markDeploymentDeployedSchema,
} from '../../../contracts/validation-schemas';

@Controller('production-deployment-lock')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class ProductionDeploymentLockController {
  constructor(private readonly service: ProductionDeploymentLockService) {}

  @Get()
  async list() {
    return { success: true, data: await this.service.listLocks() };
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createDeploymentLockSchema)) body: any) {
    return { success: true, data: await this.service.createLock(body) };
  }

  @Get(':releaseVersion')
  async get(@Param() rawParams: Record<string, string>) {
    const params = validateParams(deploymentLockReleaseSchema, rawParams);
    return { success: true, data: await this.service.getLock(params.releaseVersion) };
  }

  @Post(':releaseVersion/validate')
  async validate(@Param() rawParams: Record<string, string>) {
    const params = validateParams(deploymentLockReleaseSchema, rawParams);
    return { success: true, data: await this.service.validateReleaseCanDeploy(params.releaseVersion) };
  }

  @Post('mark-deployed')
  async markDeployed(@Body(new ZodValidationPipe(markDeploymentDeployedSchema)) body: any) {
    return { success: true, data: await this.service.markDeployed(body) };
  }

  @Post(':releaseVersion/revoke')
  async revoke(@Param() rawParams: Record<string, string>) {
    const params = validateParams(deploymentLockReleaseSchema, rawParams);
    return { success: true, data: await this.service.revoke(params.releaseVersion) };
  }
}
