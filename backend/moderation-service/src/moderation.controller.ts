import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../shared/validation';
import { validateQuery, validateParams } from '../../shared/query-validation';
import { ModerationService } from './moderation.service';
import {
  moderateVideoSchema,
  moderationQueueQuerySchema,
  idParamSchema,
} from '../../../contracts/validation-schemas';
import { ModerateVideoRequest } from '../../../contracts/api-contracts';
import { ok } from '../../shared/http-response';
import { ModerationAction } from '@prisma/client';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('videos/moderate')
  async moderateVideo(@Body(new ZodValidationPipe(moderateVideoSchema)) body: ModerateVideoRequest) {
    return ok(await this.moderationService.moderateVideo(body));
  }

  @Post('videos/moderate-pending')
  async moderatePendingVideos(@Query('take') take?: string) {
    return ok(await this.moderationService.moderatePendingVideos(take ? Number(take) : 20));
  }

  @Post('videos/:id/publish')
  async publishApprovedVideo(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.moderationService.publishApprovedVideo(params.id));
  }

  @Post('videos/publish-approved')
  async publishAllApproved(@Query('take') take?: string) {
    return ok(await this.moderationService.publishAllApproved(take ? Number(take) : 20));
  }

  @Post('videos/:id/approve')
  async approveVideo(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.moderationService.manualApprove(params.id));
  }

  @Post('videos/:id/reject')
  async rejectVideo(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.moderationService.manualReject(params.id));
  }

  @Get('queue')
  async listModerationQueue(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(moderationQueueQuerySchema, rawQuery);
    const result = await this.moderationService.listModerationQueue({
      action: query.action as ModerationAction | undefined,
      take: query.take,
    });
    return ok(result, { count: result.length });
  }

  @Get('videos/:id/history')
  async getModerationHistory(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.moderationService.getModerationHistory(params.id));
  }
}
