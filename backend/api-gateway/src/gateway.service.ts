import { Injectable } from "@nestjs/common";
import axios, { AxiosRequestConfig } from "axios";
import {
  CreateFeedEventRequest,
  CreateTrendRequest,
  CreateVideoJobRequest,
  GenerateScriptRequest,
  ModerateVideoRequest,
  RenderVideoRequest,
} from "../../../contracts/api-contracts";
import { serviceAuthHeaders } from "../../shared/service-auth";

@Injectable()
export class GatewayService {
  private readonly trendServiceUrl =
    process.env.TREND_SERVICE_URL || "http://localhost:3001";
  private readonly scriptServiceUrl =
    process.env.SCRIPT_SERVICE_URL || "http://localhost:3002";
  private readonly renderServiceUrl =
    process.env.RENDER_SERVICE_URL || "http://localhost:3003";
  private readonly moderationServiceUrl =
    process.env.MODERATION_SERVICE_URL || "http://localhost:3004";
  private readonly recommendationServiceUrl =
    process.env.RECOMMENDATION_SERVICE_URL || "http://localhost:3005";

  async health() {
    return {
      service: "yohpal-live-api-gateway",
      status: "ok",
      services: {
        trendServiceUrl: this.trendServiceUrl,
        scriptServiceUrl: this.scriptServiceUrl,
        renderServiceUrl: this.renderServiceUrl,
        moderationServiceUrl: this.moderationServiceUrl,
        recommendationServiceUrl: this.recommendationServiceUrl,
      },
    };
  }

  async createTrend(body: CreateTrendRequest) {
    return this.post(`${this.trendServiceUrl}/trends`, body);
  }

  async discoverSeedTrends() {
    return this.post(`${this.trendServiceUrl}/trends/discover-seed`, {});
  }

  async listTrends(query: Record<string, string | undefined>) {
    return this.get(`${this.trendServiceUrl}/trends`, query);
  }

  async generateScript(body: GenerateScriptRequest) {
    return this.post(`${this.scriptServiceUrl}/scripts/generate`, body);
  }

  async generatePendingScripts(take?: string) {
    return this.post(
      `${this.scriptServiceUrl}/scripts/generate-pending`,
      {},
      { params: { take } },
    );
  }

  async listScripts(query: Record<string, string | undefined>) {
    return this.get(`${this.scriptServiceUrl}/scripts`, query);
  }

  async createVideoJob(body: CreateVideoJobRequest) {
    return this.post(`${this.renderServiceUrl}/render/jobs`, body);
  }

  async createPendingVideoJobs(take?: string) {
    return this.post(
      `${this.renderServiceUrl}/render/jobs/create-pending`,
      {},
      { params: { take } },
    );
  }

  async renderVideo(body: RenderVideoRequest) {
    return this.post(`${this.renderServiceUrl}/render/videos/render`, body);
  }

  async renderPendingVideos(take?: string) {
    return this.post(
      `${this.renderServiceUrl}/render/videos/render-pending`,
      {},
      { params: { take } },
    );
  }

  async listVideos(query: Record<string, string | undefined>) {
    return this.get(`${this.renderServiceUrl}/render/videos`, query);
  }

  async moderateVideo(body: ModerateVideoRequest) {
    return this.post(
      `${this.moderationServiceUrl}/moderation/videos/moderate`,
      body,
    );
  }

  async moderatePendingVideos(take?: string) {
    return this.post(
      `${this.moderationServiceUrl}/moderation/videos/moderate-pending`,
      {},
      { params: { take } },
    );
  }

  async publishApproved(videoId: string) {
    return this.post(
      `${this.moderationServiceUrl}/moderation/videos/${videoId}/publish`,
      {},
    );
  }

  async publishAllApproved(take?: string) {
    return this.post(
      `${this.moderationServiceUrl}/moderation/videos/publish-approved`,
      {},
      { params: { take } },
    );
  }

  async getSeedFeed(query: Record<string, string | undefined>) {
    return this.get(`${this.recommendationServiceUrl}/feed/seed`, query);
  }

  async createFeedEvent(body: CreateFeedEventRequest) {
    return this.post(`${this.recommendationServiceUrl}/feed/events`, body);
  }

  async getUserFeedDiagnostics(userId: string) {
    return this.get(
      `${this.recommendationServiceUrl}/feed/diagnostics/${userId}`,
    );
  }

  async runSeedPipeline(take = "10") {
    const trends = await this.discoverSeedTrends();
    const scripts = await this.generatePendingScripts(take);
    const jobs = await this.createPendingVideoJobs(take);
    const renders = await this.renderPendingVideos(take);
    const moderation = await this.moderatePendingVideos(take);
    const published = await this.publishAllApproved(take);

    return {
      message: "Seed pipeline completed",
      steps: {
        trends,
        scripts,
        jobs,
        renders,
        moderation,
        published,
      },
    };
  }

  // ✅ NEW: Service status aggregation method
  async serviceStatus() {
    const services = [
      { name: "trend-service", url: this.trendServiceUrl },
      { name: "script-service", url: this.scriptServiceUrl },
      { name: "render-service", url: this.renderServiceUrl },
      { name: "moderation-service", url: this.moderationServiceUrl },
      { name: "recommendation-service", url: this.recommendationServiceUrl },
    ];

    const results = await Promise.all(
      services.map(async (service) => {
        const startedAt = Date.now();
        try {
          const response = await axios.get(`${service.url}/health`, {
            timeout: 5000,
            headers: serviceAuthHeaders(),
          });
          return {
            name: service.name,
            status: "ok",
            latencyMs: Date.now() - startedAt,
            data: response.data,
          };
        } catch (error) {
          return {
            name: service.name,
            status: "down",
            latencyMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    );

    return {
      service: "api-gateway",
      status: results.every((item) => item.status === "ok") ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      services: results,
    };
  }

  // ✅ Updated: Added serviceAuthHeaders to requests
  private async get(url: string, params?: Record<string, unknown>) {
    const response = await axios.get(url, {
      params,
      headers: serviceAuthHeaders(),
    });
    return response.data;
  }

  private async post(url: string, body: unknown, config?: AxiosRequestConfig) {
    const response = await axios.post(url, body, {
      ...(config || {}),
      headers: {
        ...(config?.headers || {}),
        ...serviceAuthHeaders(),
      },
    });
    return response.data;
  }
}
