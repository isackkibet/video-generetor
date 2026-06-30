import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { GatewayService } from "./gateway.service";
import {
  CreateFeedEventRequest,
  CreateTrendRequest,
  CreateVideoJobRequest,
  GenerateScriptRequest,
  ModerateVideoRequest,
  RenderVideoRequest,
} from "../../../contracts/api-contracts";
import { ProviderJobQueryService } from "../../shared/provider-job-query.service";
import { ScriptProviderQueryService } from "../../shared/script-provider-query.service";

@Controller()
export class GatewayController {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly providerJobQueryService: ProviderJobQueryService,
    private readonly scriptProviderQueryService: ScriptProviderQueryService,
  ) {}

  @Get("health")
  async health() {
    return this.gatewayService.health();
  }

  @Post("trends")
  async createTrend(@Body() body: CreateTrendRequest) {
    return this.gatewayService.createTrend(body);
  }

  @Post("trends/discover-seed")
  async discoverSeedTrends() {
    return this.gatewayService.discoverSeedTrends();
  }

  @Get("trends")
  async listTrends(
    @Query("category") category?: string,
    @Query("region") region?: string,
    @Query("country") country?: string,
    @Query("take") take?: string,
  ) {
    return this.gatewayService.listTrends({ category, region, country, take });
  }

  @Post("scripts/generate")
  async generateScript(@Body() body: GenerateScriptRequest) {
    return this.gatewayService.generateScript(body);
  }

  @Post("scripts/generate-pending")
  async generatePendingScripts(@Query("take") take?: string) {
    return this.gatewayService.generatePendingScripts(take);
  }

  @Get("scripts")
  async listScripts(
    @Query("trendId") trendId?: string,
    @Query("language") language?: string,
    @Query("take") take?: string,
  ) {
    return this.gatewayService.listScripts({ trendId, language, take });
  }

  @Post("render/jobs")
  async createVideoJob(@Body() body: CreateVideoJobRequest) {
    return this.gatewayService.createVideoJob(body);
  }

  @Post("render/jobs/create-pending")
  async createPendingVideoJobs(@Query("take") take?: string) {
    return this.gatewayService.createPendingVideoJobs(take);
  }

  @Post("render/videos/render")
  async renderVideo(@Body() body: RenderVideoRequest) {
    return this.gatewayService.renderVideo(body);
  }

  @Post("render/videos/render-pending")
  async renderPendingVideos(@Query("take") take?: string) {
    return this.gatewayService.renderPendingVideos(take);
  }

  @Get("render/videos")
  async listVideos(
    @Query("status") status?: string,
    @Query("category") category?: string,
    @Query("region") region?: string,
    @Query("country") country?: string,
    @Query("take") take?: string,
  ) {
    return this.gatewayService.listVideos({
      status,
      category,
      region,
      country,
      take,
    });
  }

  @Post("moderation/videos/moderate")
  async moderateVideo(@Body() body: ModerateVideoRequest) {
    return this.gatewayService.moderateVideo(body);
  }

  @Post("moderation/videos/moderate-pending")
  async moderatePendingVideos(@Query("take") take?: string) {
    return this.gatewayService.moderatePendingVideos(take);
  }

  @Post("moderation/videos/:id/publish")
  async publishApproved(@Param("id") id: string) {
    return this.gatewayService.publishApproved(id);
  }

  @Post("moderation/videos/publish-approved")
  async publishAllApproved(@Query("take") take?: string) {
    return this.gatewayService.publishAllApproved(take);
  }

  @Get("feed/seed")
  async getSeedFeed(
    @Query("userId") userId: string,
    @Query("region") region?: string,
    @Query("country") country?: string,
    @Query("language") language?: string,
    @Query("take") take?: string,
  ) {
    return this.gatewayService.getSeedFeed({
      userId,
      region,
      country,
      language,
      take,
    });
  }

  @Post("feed/events")
  async createFeedEvent(@Body() body: CreateFeedEventRequest) {
    return this.gatewayService.createFeedEvent(body);
  }

  @Post("pipeline/run-seed")
  async runSeedPipeline(@Query("take") take?: string) {
    return this.gatewayService.runSeedPipeline(take || "10");
  }

  // ✅ Provider Job Audit Routes (from Batch 18)
  @Get("provider-jobs")
  async listProviderJobs(
    @Query("videoId") videoId?: string,
    @Query("jobType")
    jobType?:
      | "LLM_SCRIPT"
      | "TTS"
      | "AVATAR_VIDEO"
      | "VIDEO_COMPOSITE"
      | "MODERATION",
    @Query("providerName") providerName?: string,
    @Query("status")
    status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "FALLBACK_USED",
    @Query("fallbackUsed") fallbackUsed?: string,
    @Query("take") take?: string,
  ) {
    const jobs = await this.providerJobQueryService.listProviderJobs({
      videoId,
      jobType,
      providerName,
      status,
      fallbackUsed:
        fallbackUsed === undefined ? undefined : fallbackUsed === "true",
      take: take ? Number(take) : undefined,
    });

    return {
      success: true,
      data: jobs,
      meta: {
        count: jobs.length,
      },
    };
  }

  @Get("provider-jobs/summary")
  async getProviderJobSummary() {
    const summary = await this.providerJobQueryService.getProviderJobSummary();
    return {
      success: true,
      data: summary,
    };
  }

  @Get("provider-jobs/:id")
  async getProviderJob(@Param("id") id: string) {
    const job = await this.providerJobQueryService.getProviderJob(id);
    return {
      success: true,
      data: job,
    };
  }

  // ✅ Script Provider Log Routes (Batch 20)
  @Get("script-provider-logs")
  async listScriptProviderLogs(
    @Query("scriptId") scriptId?: string,
    @Query("trendId") trendId?: string,
    @Query("providerName") providerName?: string,
    @Query("status")
    status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "FALLBACK_USED",
    @Query("fallbackUsed") fallbackUsed?: string,
    @Query("take") take?: string,
  ) {
    const logs = await this.scriptProviderQueryService.listLogs({
      scriptId,
      trendId,
      providerName,
      status,
      fallbackUsed:
        fallbackUsed === undefined ? undefined : fallbackUsed === "true",
      take: take ? Number(take) : undefined,
    });

    return {
      success: true,
      data: logs,
      meta: {
        count: logs.length,
      },
    };
  }

  @Get("script-provider-logs/summary")
  async getScriptProviderLogSummary() {
    const summary = await this.scriptProviderQueryService.getSummary();
    return {
      success: true,
      data: summary,
    };
  }

  @Get("script-provider-logs/:id")
  async getScriptProviderLog(@Param("id") id: string) {
    const log = await this.scriptProviderQueryService.getLog(id);
    return {
      success: true,
      data: log,
    };
  }

  // ✅ Feed Diagnostics Route (Batch 22)
  @Get("feed/diagnostics/:userId")
  async getUserFeedDiagnostics(@Param("userId") userId: string) {
    return this.gatewayService.getUserFeedDiagnostics(userId);
  }

  // ✅ NEW: Service Status Route (Batch 29)
  @Get("observability/services")
  async serviceStatus() {
    return this.gatewayService.serviceStatus();
  }
}
