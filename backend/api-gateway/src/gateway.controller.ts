import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ZodValidationPipe } from "../../shared/validation";
import { validateParams, validateQuery } from "../../shared/query-validation";
import { GatewayService } from "./gateway.service";
import { ProviderJobQueryService } from "../../shared/provider-job-query.service";
import { ScriptProviderQueryService } from "../../shared/script-provider-query.service";
import { ObservabilityQueryService } from "../../shared/observability-query.service";
import { EventAdminService } from "../../shared/event-admin.service";
import { BackupEvidenceService } from "../../shared/backup-evidence.service";
import { BlueprintCertificationService } from "../../shared/blueprint-certification.service";
import { AdminJwtGuard } from "../../shared/admin-jwt.guard";
import { RolesGuard } from "../../shared/roles.guard";
import { Roles } from "../../shared/roles.decorator";
import {
  createTrendSchema,
  generateScriptSchema,
  createVideoJobSchema,
  renderVideoSchema,
  moderateVideoSchema,
  feedEventSchema,
  listTrendsQuerySchema,
  listScriptsQuerySchema,
  listVideosQuerySchema,
  moderationQueueQuerySchema,
  seedFeedQuerySchema,
  userIdParamSchema,
  idParamSchema,
  providerJobsQuerySchema,
  scriptProviderLogsQuerySchema,
  eventProcessingQuerySchema,
  retryEventSchema,
} from "../../../contracts/validation-schemas";
import {
  CreateFeedEventRequest,
  CreateTrendRequest,
  CreateVideoJobRequest,
  GenerateScriptRequest,
  ModerateVideoRequest,
  RenderVideoRequest,
} from "../../../contracts/api-contracts";

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly providerJobQueryService: ProviderJobQueryService,
    private readonly scriptProviderQueryService: ScriptProviderQueryService,
    private readonly observabilityQueryService: ObservabilityQueryService,
    private readonly eventAdminService: EventAdminService,
    private readonly backupEvidenceService: BackupEvidenceService,
    private readonly blueprintCertificationService: BlueprintCertificationService,
  ) {}

  // Public routes
  @Get("health")
  async health() {
    return this.gatewayService.health();
  }

  @Get("metrics")
  async metrics() {
    return this.gatewayService.metrics();
  }

  // ==================== TREND ROUTES ====================
  @Post("trends")
  async createTrend(
    @Body(new ZodValidationPipe(createTrendSchema)) body: CreateTrendRequest,
  ) {
    return this.gatewayService.createTrend(body);
  }

  @Post("trends/discover-seed")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "CONTENT_ADMIN")
  async discoverSeedTrends() {
    return this.gatewayService.discoverSeedTrends();
  }

  @Get("trends")
  async listTrends(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(listTrendsQuerySchema, rawQuery);
    return this.gatewayService.listTrends({
      category: query.category,
      region: query.region,
      country: query.country,
      take: query.take?.toString(),
    });
  }

  // ==================== SCRIPT ROUTES ====================
  @Post("scripts/generate")
  async generateScript(
    @Body(new ZodValidationPipe(generateScriptSchema))
    body: GenerateScriptRequest,
  ) {
    return this.gatewayService.generateScript(body);
  }

  @Post("scripts/generate-pending")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "CONTENT_ADMIN")
  async generatePendingScripts(@Query("take") take?: string) {
    return this.gatewayService.generatePendingScripts(take);
  }

  @Get("scripts")
  async listScripts(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(listScriptsQuerySchema, rawQuery);
    return this.gatewayService.listScripts({
      trendId: query.trendId,
      language: query.language,
      take: query.take?.toString(),
    });
  }

  // ==================== RENDER ROUTES ====================
  @Post("render/jobs")
  async createVideoJob(
    @Body(new ZodValidationPipe(createVideoJobSchema))
    body: CreateVideoJobRequest,
  ) {
    return this.gatewayService.createVideoJob(body);
  }

  @Post("render/jobs/create-pending")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "CONTENT_ADMIN")
  async createPendingVideoJobs(@Query("take") take?: string) {
    return this.gatewayService.createPendingVideoJobs(take);
  }

  @Post("render/videos/render")
  async renderVideo(
    @Body(new ZodValidationPipe(renderVideoSchema)) body: RenderVideoRequest,
  ) {
    return this.gatewayService.renderVideo(body);
  }

  @Post("render/videos/render-pending")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "CONTENT_ADMIN")
  async renderPendingVideos(@Query("take") take?: string) {
    return this.gatewayService.renderPendingVideos(take);
  }

  @Get("render/videos")
  async listVideos(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(listVideosQuerySchema, rawQuery);
    return this.gatewayService.listVideos({
      status: query.status,
      category: query.category,
      region: query.region,
      country: query.country,
      take: query.take?.toString(),
    });
  }

  @Get("render/videos/:id")
  async getVideo(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return this.gatewayService.getVideo(params.id);
  }

  // ==================== MODERATION ROUTES ====================
  @Post("moderation/videos/moderate")
  async moderateVideo(
    @Body(new ZodValidationPipe(moderateVideoSchema))
    body: ModerateVideoRequest,
  ) {
    return this.gatewayService.moderateVideo(body);
  }

  @Post("moderation/videos/moderate-pending")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "MODERATOR")
  async moderatePendingVideos(@Query("take") take?: string) {
    return this.gatewayService.moderatePendingVideos(take);
  }

  @Post("moderation/videos/:id/publish")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "MODERATOR")
  async publishApproved(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return this.gatewayService.publishApproved(params.id);
  }

  @Post("moderation/videos/publish-approved")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "MODERATOR")
  async publishAllApproved(@Query("take") take?: string) {
    return this.gatewayService.publishAllApproved(take);
  }

  @Get("moderation/queue")
  async listModerationQueue(
    @Query() rawQuery: Record<string, string | undefined>,
  ) {
    const query = validateQuery(moderationQueueQuerySchema, rawQuery);
    return this.gatewayService.listModerationQueue({
      action: query.action,
      take: query.take?.toString(),
    });
  }

  @Get("moderation/videos/:id/history")
  async getModerationHistory(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return this.gatewayService.getModerationHistory(params.id);
  }

  // ==================== RECOMMENDATION ROUTES ====================
  @Get("feed/seed")
  async getSeedFeed(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(seedFeedQuerySchema, rawQuery);
    return this.gatewayService.getSeedFeed({
      userId: query.userId,
      region: query.region,
      country: query.country,
      language: query.language,
      take: query.take?.toString(),
    });
  }

  @Post("feed/events")
  async createFeedEvent(
    @Body(new ZodValidationPipe(feedEventSchema)) body: CreateFeedEventRequest,
  ) {
    return this.gatewayService.createFeedEvent(body);
  }

  @Get("feed/diagnostics/:userId")
  async getUserFeedDiagnostics(@Param() rawParams: Record<string, string>) {
    const params = validateParams(userIdParamSchema, rawParams);
    return this.gatewayService.getUserFeedDiagnostics(params.userId);
  }

  // ==================== PROVIDER JOBS (Audit) ====================
  @Get("provider-jobs")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async listProviderJobs(
    @Query() rawQuery: Record<string, string | undefined>,
  ) {
    const query = validateQuery(providerJobsQuerySchema, rawQuery);
    const jobs = await this.providerJobQueryService.listProviderJobs({
      videoId: query.videoId,
      jobType: query.jobType,
      providerName: query.providerName,
      status: query.status,
      fallbackUsed: query.fallbackUsed,
      take: query.take,
    });
    return { success: true, data: jobs, meta: { count: jobs.length } };
  }

  @Get("provider-jobs/summary")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getProviderJobSummary() {
    const summary = await this.providerJobQueryService.getProviderJobSummary();
    return { success: true, data: summary };
  }

  @Get("provider-jobs/:id")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getProviderJob(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    const job = await this.providerJobQueryService.getProviderJob(params.id);
    return { success: true, data: job };
  }

  // ==================== SCRIPT PROVIDER LOGS (Audit) ====================
  @Get("script-provider-logs")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async listScriptProviderLogs(
    @Query() rawQuery: Record<string, string | undefined>,
  ) {
    const query = validateQuery(scriptProviderLogsQuerySchema, rawQuery);
    const logs = await this.scriptProviderQueryService.listLogs({
      scriptId: query.scriptId,
      trendId: query.trendId,
      providerName: query.providerName,
      status: query.status,
      fallbackUsed: query.fallbackUsed,
      take: query.take,
    });
    return { success: true, data: logs, meta: { count: logs.length } };
  }

  @Get("script-provider-logs/summary")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getScriptProviderLogSummary() {
    const summary = await this.scriptProviderQueryService.getSummary();
    return { success: true, data: summary };
  }

  @Get("script-provider-logs/:id")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getScriptProviderLog(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    const log = await this.scriptProviderQueryService.getLog(params.id);
    return { success: true, data: log };
  }

  // ==================== OBSERVABILITY (Audit) ====================
  @Get("observability/provider-failures")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async providerFailureSummary() {
    const data = await this.observabilityQueryService.providerFailureSummary();
    return { success: true, data };
  }

  @Get("observability/pipeline-summary")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async pipelineSummary() {
    const data = await this.observabilityQueryService.contentPipelineSummary();
    return { success: true, data };
  }

  // ✅ Batch 44 - Provider resilience evidence
  @Get("observability/provider-resilience-evidence")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async providerResilienceEvidence() {
    return {
      success: true,
      data: await this.observabilityQueryService.providerResilienceEvidence(),
    };
  }

  // ✅ Batch 45 - Metrics evidence
  @Get("observability/metrics-evidence")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async metricsEvidence() {
    return {
      success: true,
      data: await this.observabilityQueryService.metricsEvidence(),
    };
  }

  // ✅ Batch 46 - Backup evidence
  @Get("observability/backup-evidence")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async backupEvidence() {
    return {
      success: true,
      data: await this.backupEvidenceService.getBackupEvidence(),
    };
  }

  // ✅ Batch 48 - Blueprint certification
  @Get("certification/blueprint-alignment")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async blueprintAlignmentReport() {
    return {
      success: true,
      data: await this.blueprintCertificationService.generateReport(),
    };
  }

  // ==================== EVENT PROCESSING (Batch 43) ====================
  @Get("events/processing")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async listEventProcessing(
    @Query() rawQuery: Record<string, string | undefined>,
  ) {
    const query = validateQuery(eventProcessingQuerySchema, rawQuery);
    const events = await this.eventAdminService.listEvents({
      topic: query.topic,
      status: query.status,
      take: query.take,
    });
    return { success: true, data: events, meta: { count: events.length } };
  }

  @Get("events/processing/summary")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async eventProcessingSummary() {
    return { success: true, data: await this.eventAdminService.summary() };
  }

  @Get("events/processing/evidence")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async eventProcessingEvidence() {
    return {
      success: true,
      data: await this.eventAdminService.exportEvidence(),
    };
  }

  @Get("events/processing/:idempotencyKey")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getEventProcessing(@Param("idempotencyKey") idempotencyKey: string) {
    return {
      success: true,
      data: await this.eventAdminService.getEvent(idempotencyKey),
    };
  }

  @Post("events/processing/retry")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async retryEvent(
    @Body(new ZodValidationPipe(retryEventSchema))
    body: {
      idempotencyKey: string;
    },
  ) {
    return {
      success: true,
      data: await this.eventAdminService.retryEvent(body.idempotencyKey),
    };
  }

  // ==================== PIPELINE (Super Admin only) ====================
  @Post("pipeline/run-seed")
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async runSeedPipeline(@Query("take") take?: string) {
    return this.gatewayService.runSeedPipeline(take || "10");
  }
}
