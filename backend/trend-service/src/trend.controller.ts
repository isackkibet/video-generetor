import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../shared/validation';
import { validateQuery, validateParams } from '../../shared/query-validation';
import { TrendService } from './trend.service';
import {
  createTrendSchema,
  listTrendsQuerySchema,
  idParamSchema,
} from '../../../contracts/validation-schemas';
import { ok } from '../../shared/http-response';

@Controller('trends')
export class TrendController {
  constructor(private readonly trendService: TrendService) {}

  @Post()
  async createTrend(@Body(new ZodValidationPipe(createTrendSchema)) body: any) {
    return ok(await this.trendService.createTrend(body));
  }

  @Post('discover-seed')
  async discoverSeedTrends() {
    return ok(await this.trendService.discoverSeedTrends());
  }

  @Get()
  async listTrends(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(listTrendsQuerySchema, rawQuery);
    const result = await this.trendService.listTrends({
      category: query.category,
      region: query.region,
      country: query.country,
      take: query.take,
    });
    return ok(result, { count: result.length });
  }

  @Get(':id')
  async getTrend(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.trendService.getTrend(params.id));
  }
}
