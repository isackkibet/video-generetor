import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../../shared/validation';
import { RecoveryGovernanceService } from '../../shared/recovery-governance.service';
import { AdminJwtGuard } from '../../shared/admin-jwt.guard';
import { RolesGuard } from '../../shared/roles.guard';
import { Roles } from '../../shared/roles.decorator';
import {
  createRecoveryRepositorySchema,
  updateRecoveryRepositorySchema,
  upsertRecoveryBatchSchema,
  createRecoveryEvidenceSchema,
  createRecoveryBlockerSchema,
  createRecoveryRiskSchema,
  governanceStatusUpdateSchema,
  certificationDecisionSchema,
  executiveApprovalSchema,
} from '../../../contracts/validation-schemas';

@Controller('recovery-governance')
@UseGuards(AdminJwtGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class RecoveryGovernanceController {
  constructor(private readonly service: RecoveryGovernanceService) {}

  @Post('seed')
  async seed() {
    return { success: true, data: await this.service.seedDefaultRepositories() };
  }

  @Get('dashboard')
  async dashboard() {
    return { success: true, data: await this.service.dashboard() };
  }

  @Get('repositories')
  async repositories() {
    return { success: true, data: await this.service.listRepositories() };
  }

  @Post('repositories')
  async createRepository(
    @Body(new ZodValidationPipe(createRecoveryRepositorySchema)) body: any
  ) {
    return { success: true, data: await this.service.createRepository(body) };
  }

  @Patch('repositories/:id')
  async updateRepository(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRecoveryRepositorySchema)) body: any
  ) {
    return { success: true, data: await this.service.updateRepository(id, body) };
  }

  @Post('batches')
  async upsertBatch(
    @Body(new ZodValidationPipe(upsertRecoveryBatchSchema)) body: any
  ) {
    return { success: true, data: await this.service.upsertBatch(body) };
  }

  @Post('evidence')
  async createEvidence(
    @Body(new ZodValidationPipe(createRecoveryEvidenceSchema)) body: any
  ) {
    return { success: true, data: await this.service.createEvidence(body) };
  }

  @Post('evidence/:id/accept')
  async acceptEvidence(@Param('id') id: string) {
    return { success: true, data: await this.service.acceptEvidence(id) };
  }

  @Post('blockers')
  async createBlocker(
    @Body(new ZodValidationPipe(createRecoveryBlockerSchema)) body: any
  ) {
    return { success: true, data: await this.service.createBlocker(body) };
  }

  @Patch('blockers/:id')
  async updateBlocker(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(governanceStatusUpdateSchema)) body: any
  ) {
    return { success: true, data: await this.service.updateBlocker(id, body) };
  }

  @Post('risks')
  async createRisk(
    @Body(new ZodValidationPipe(createRecoveryRiskSchema)) body: any
  ) {
    return { success: true, data: await this.service.createRisk(body) };
  }

  @Patch('risks/:id')
  async updateRisk(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(governanceStatusUpdateSchema)) body: any
  ) {
    return { success: true, data: await this.service.updateRisk(id, body) };
  }

  @Post('certifications')
  async certify(
    @Body(new ZodValidationPipe(certificationDecisionSchema)) body: any
  ) {
    return { success: true, data: await this.service.certifyRepository(body) };
  }

  @Post('executive-approvals')
  async executiveApproval(
    @Body(new ZodValidationPipe(executiveApprovalSchema)) body: any
  ) {
    return { success: true, data: await this.service.executiveApproval(body) };
  }
}
