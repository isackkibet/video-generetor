import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../shared/validation';
import { validateQuery, validateParams } from '../../shared/query-validation';
import { RecommendationService } from './recommendation.service';
import {
  seedFeedQuerySchema,
  feedEventSchema,
  userIdParamSchema,
  idParamSchema,
} from '../../../contracts/validation-schemas';
import { CreateFeedEventRequest, SeedFeedRequest } from '../../../contracts/api-contracts';
import { ok } from '../../shared/http-response';

@Controller()
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('feed/seed')
  async getSeedFeed(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(seedFeedQuerySchema, rawQuery);
    const request: SeedFeedRequest = {
      userId: query.userId,
      region: query.region,
      country: query.country,
      language: query.language,
      take: query.take,
    };
    const feed = await this.recommendationService.getSeedFeed(request);
    return ok(feed, { count: feed.length });
  }

  @Post('feed/events')
  async createFeedEvent(@Body(new ZodValidationPipe(feedEventSchema)) body: CreateFeedEventRequest) {
    return ok(await this.recommendationService.createFeedEvent(body));
  }

  @Get('feed/diagnostics/:userId')
  async getUserFeedDiagnostics(@Param() rawParams: Record<string, string>) {
    const params = validateParams(userIdParamSchema, rawParams);
    return ok(await this.recommendationService.getUserFeedDiagnostics(params.userId));
  }

  @Get('videos/:id')
  async getVideoById(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.recommendationService.getVideoById(params.id));
  }
}
