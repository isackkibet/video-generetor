import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../shared/validation';
import { validateQuery, validateParams } from '../../shared/query-validation';
import { RenderService } from './render.service';
import {
  createVideoJobSchema,
  renderVideoSchema,
  listVideosQuerySchema,
  idParamSchema,
} from '../../../contracts/validation-schemas';
import { CreateVideoJobRequest, RenderVideoRequest } from '../../../contracts/api-contracts';
import { ok } from '../../shared/http-response';

@Controller('render')
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Post('jobs')
  async createVideoJob(@Body(new ZodValidationPipe(createVideoJobSchema)) body: CreateVideoJobRequest) {
    return ok(await this.renderService.createVideoJob(body));
  }

  @Post('jobs/create-pending')
  async createJobsForUnrenderedScripts(@Query('take') take?: string) {
    return ok(await this.renderService.createJobsForUnrenderedScripts(take ? Number(take) : 20));
  }

  @Post('videos/render')
  async renderVideo(@Body(new ZodValidationPipe(renderVideoSchema)) body: RenderVideoRequest) {
    return ok(await this.renderService.renderVideo(body));
  }

  @Post('videos/render-pending')
  async renderPendingVideos(@Query('take') take?: string) {
    return ok(await this.renderService.renderPendingVideos(take ? Number(take) : 20));
  }

  @Get('videos')
  async listVideos(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(listVideosQuerySchema, rawQuery);
    const videos = await this.renderService.listVideos({
      status: query.status,
      category: query.category,
      region: query.region,
      country: query.country,
      take: query.take,
    });
    return ok(videos, { count: videos.length });
  }

  @Get('videos/:id')
  async getVideo(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.renderService.getVideo(params.id));
  }
}
