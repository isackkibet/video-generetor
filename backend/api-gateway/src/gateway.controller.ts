import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ProviderJobQueryService } from '../../shared/provider-job-query.service';
import { ScriptProviderQueryService } from '../../shared/script-provider-query.service';
import { ObservabilityQueryService } from '../../shared/observability-query.service';
import { AdminJwtGuard } from '../../shared/admin-jwt.guard';
import { RolesGuard } from '../../shared/roles.guard';
import { Roles } from '../../shared/roles.decorator';
import {
  CreateFeedEventRequest,
  CreateTrendRequest,
  CreateVideoJobRequest,
  GenerateScriptRequest,
  ModerateVideoRequest,
  RenderVideoRequest,
} from '../../../contracts/api-contracts';

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly providerJobQueryService: ProviderJobQueryService,
    private readonly scriptProviderQueryService: ScriptProviderQueryService,
    private readonly observabilityQueryService: ObservabilityQueryService,
  ) {}

  // Public routes (no auth required)
  @Get('health')
  async health() {
    return this.gatewayService.health();
  }

  @Get('metrics')
  async metrics() {
    // MetricsController handles this, but if you want it here:
    return 'metrics endpoint';
  }

  // ==================== TREND ROUTES ====================
  @Post('trends')
  async createTrend(@Body() body: CreateTrendRequest) {
    return this.gatewayService.createTrend(body);
  }

  @Post('trends/discover-seed')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  async discoverSeedTrends() {
    return this.gatewayService.discoverSeedTrends();
  }

  @Get('trends')
  async listTrends(
    @Query('category') category?: string,
    @Query('region') region?: string,
    @Query('country') country?: string,
    @Query('take') take?: string
  ) {
    return this.gatewayService.listTrends({ category, region, country, take });
  }

  // ==================== SCRIPT ROUTES ====================
  @Post('scripts/generate')
  async generateScript(@Body() body: GenerateScriptRequest) {
    return this.gatewayService.generateScript(body);
  }

  @Post('scripts/generate-pending')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  async generatePendingScripts(@Query('take') take?: string) {
    return this.gatewayService.generatePendingScripts(take);
  }

  @Get('scripts')
  async listScripts(
    @Query('trendId') trendId?: string,
    @Query('language') language?: string,
    @Query('take') take?: string
  ) {
    return this.gatewayService.listScripts({ trendId, language, take });
  }

  // ==================== RENDER ROUTES ====================
  @Post('render/jobs')
  async createVideoJob(@Body() body: CreateVideoJobRequest) {
    return this.gatewayService.createVideoJob(body);
  }

  @Post('render/jobs/create-pending')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  async createPendingVideoJobs(@Query('take') take?: string) {
    return this.gatewayService.createPendingVideoJobs(take);
  }

  @Post('render/videos/render')
  async renderVideo(@Body() body: RenderVideoRequest) {
    return this.gatewayService.renderVideo(body);
  }

  @Post('render/videos/render-pending')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'CONTENT_ADMIN')
  async renderPendingVideos(@Query('take') take?: string) {
    return this.gatewayService.renderPendingVideos(take);
  }

  @Get('render/videos')
  async listVideos(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('region') region?: string,
    @Query('country') country?: string,
    @Query('take') take?: string
  ) {
    return this.gatewayService.listVideos({ status, category, region, country, take });
  }

  // ==================== MODERATION ROUTES ====================
  @Post('moderation/videos/moderate')
  async moderateVideo(@Body() body: ModerateVideoRequest) {
    return this.gatewayService.moderateVideo(body);
  }

  @Post('moderation/videos/moderate-pending')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MODERATOR')
  async moderatePendingVideos(@Query('take') take?: string) {
    return this.gatewayService.moderatePendingVideos(take);
  }

  @Post('moderation/videos/:id/publish')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MODERATOR')
  async publishApproved(@Param('id') id: string) {
    return this.gatewayService.publishApproved(id);
  }

  @Post('moderation/videos/publish-approved')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MODERATOR')
  async publishAllApproved(@Query('take') take?: string) {
    return this.gatewayService.publishAllApproved(take);
  }

  @Get('moderation/queue')
  async listModerationQueue(
    @Query('action') action?: string,
    @Query('take') take?: string
  ) {
    return this.gatewayService.listModerationQueue({ action, take: take ? Number(take) : undefined });
  }

  // ==================== RECOMMENDATION ROUTES ====================
  @Get('feed/seed')
  async getSeedFeed(
    @Query('userId') userId: string,
    @Query('region') region?: string,
    @Query('country') country?: string,
    @Query('language') language?: string,
    @Query('take') take?: string
  ) {
    return this.gatewayService.getSeedFeed({ userId, region, country, language, take });
  }

  @Post('feed/events')
  async createFeedEvent(@Body() body: CreateFeedEventRequest) {
    return this.gatewayService.createFeedEvent(body);
  }

  // ==================== PROVIDER JOBS (Audit) ====================
  @Get('provider-jobs')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async listProviderJobs(
    @Query('videoId') videoId?: string,
    @Query('jobType') jobType?: 'LLM_SCRIPT' | 'TTS' | 'AVATAR_VIDEO' | 'VIDEO_COMPOSITE' | 'MODERATION',
    @Query('providerName') providerName?: string,
    @Query('status') status?: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'FALLBACK_USED',
    @Query('fallbackUsed') fallbackUsed?: string,
    @Query('take') take?: string
  ) {
    const jobs = await this.providerJobQueryService.listProviderJobs({
      videoId,
      jobType,
      providerName,
      status,
      fallbackUsed: fallbackUsed === undefined ? undefined : fallbackUsed === 'true',
      take: take ? Number(take) : undefined,
    });
    return { success: true, data: jobs, meta: { count: jobs.length } };
  }

  @Get('provider-jobs/summary')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getProviderJobSummary() {
    const summary = await this.providerJobQueryService.getProviderJobSummary();
    return { success: true, data: summary };
  }

  @Get('provider-jobs/:id')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getProviderJob(@Param('id') id: string) {
    const job = await this.providerJobQueryService.getProviderJob(id);
    return { success: true, data: job };
  }

  // ==================== SCRIPT PROVIDER LOGS (Audit) ====================
  @Get('script-provider-logs')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async listScriptProviderLogs(
    @Query('scriptId') scriptId?: string,
    @Query('trendId') trendId?: string,
    @Query('providerName') providerName?: string,
    @Query('status') status?: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'FALLBACK_USED',
    @Query('fallbackUsed') fallbackUsed?: string,
    @Query('take') take?: string
  ) {
    const logs = await this.scriptProviderQueryService.listLogs({
      scriptId,
      trendId,
      providerName,
      status,
      fallbackUsed: fallbackUsed === undefined ? undefined : fallbackUsed === 'true',
      take: take ? Number(take) : undefined,
    });
    return { success: true, data: logs, meta: { count: logs.length } };
  }

  @Get('script-provider-logs/summary')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getScriptProviderLogSummary() {
    const summary = await this.scriptProviderQueryService.getSummary();
    return { success: true, data: summary };
  }

  @Get('script-provider-logs/:id')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getScriptProviderLog(@Param('id') id: string) {
    const log = await this.scriptProviderQueryService.getLog(id);
    return { success: true, data: log };
  }

  // ==================== OBSERVABILITY (Audit) ====================
  @Get('observability/provider-failures')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async providerFailureSummary() {
    const data = await this.observabilityQueryService.providerFailureSummary();
    return { success: true, data };
  }

  @Get('observability/pipeline-summary')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async pipelineSummary() {
    const data = await this.observabilityQueryService.contentPipelineSummary();
    return { success: true, data };
  }

  // ==================== PIPELINE (Super Admin only) ====================
  @Post('pipeline/run-seed')
  @UseGuards(AdminJwtGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async runSeedPipeline(@Query('take') take?: string) {
    return this.gatewayService.runSeedPipeline(take || '10');
  }
}
