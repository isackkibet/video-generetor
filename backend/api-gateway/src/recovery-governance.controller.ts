import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { validateQuery } from '../../shared/query-validation';
import { exportFormatQuerySchema } from '../../../contracts/validation-schemas';
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

  private sendExport(
    res: Response,
    filename: string,
    format: 'json' | 'csv',
    data: unknown
  ) {
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(data);
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  }

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

  @Post('repositories/:id/update')
  async updateRepositoryPost(
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

  @Post('blockers/:id/update')
  async updateBlockerPost(
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

  @Post('risks/:id/update')
  async updateRiskPost(
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

  // ========== Export Routes ==========
  @Get('exports/repositories')
  async exportRepositories(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportRepositories(format);
    return this.sendExport(res, 'recovery-repositories', format, data);
  }

  @Get('exports/batches')
  async exportBatches(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportBatches(format);
    return this.sendExport(res, 'recovery-batches', format, data);
  }

  @Get('exports/evidence')
  async exportEvidence(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportEvidence(format);
    return this.sendExport(res, 'recovery-evidence', format, data);
  }

  @Get('exports/blockers')
  async exportBlockers(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportBlockers(format);
    return this.sendExport(res, 'recovery-blockers', format, data);
  }

  @Get('exports/risks')
  async exportRisks(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportRisks(format);
    return this.sendExport(res, 'recovery-risks', format, data);
  }

  @Get('exports/certifications')
  async exportCertifications(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportCertifications(format);
    return this.sendExport(res, 'recovery-certifications', format, data);
  }

  @Get('exports/executive-approvals')
  async exportExecutiveApprovals(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportExecutiveApprovals(format);
    return this.sendExport(res, 'executive-approvals', format, data);
  }

  @Get('exports/go-no-go-summary')
  async exportGoNoGoSummary(
    @Query() rawQuery: Record<string, string | undefined>,
    @Res() res: Response
  ) {
    const query = validateQuery(exportFormatQuerySchema, rawQuery);
    const format = query.format || 'json';
    const data = await this.service.exportGoNoGoSummary(format);
    return this.sendExport(res, 'go-no-go-summary', format, data);
  }

  @Get('exports/bundle')
  async exportCompleteBundle(@Res() res: Response) {
    const data = await this.service.exportCompleteBundle();
    return this.sendExport(res, 'recovery-governance-complete-bundle', 'json', data);
  }
}
