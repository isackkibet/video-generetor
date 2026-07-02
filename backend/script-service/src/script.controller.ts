import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../../shared/validation';
import { validateQuery, validateParams } from '../../shared/query-validation';
import { ScriptService } from './script.service';
import {
  generateScriptSchema,
  listScriptsQuerySchema,
  idParamSchema,
} from '../../../contracts/validation-schemas';
import { GenerateScriptRequest } from '../../../contracts/api-contracts';
import { ok } from '../../shared/http-response';

@Controller('scripts')
export class ScriptController {
  constructor(private readonly scriptService: ScriptService) {}

  @Post('generate')
  async generateFromTrend(
    @Body(new ZodValidationPipe(generateScriptSchema)) body: GenerateScriptRequest
  ) {
    return ok(await this.scriptService.generateFromTrend(body));
  }

  @Post('generate-pending')
  async generateForPendingTrends(@Query('take') take?: string) {
    return ok(await this.scriptService.generateForAllPendingTrends(take ? Number(take) : 20));
  }

  @Get()
  async listScripts(@Query() rawQuery: Record<string, string | undefined>) {
    const query = validateQuery(listScriptsQuerySchema, rawQuery);
    const scripts = await this.scriptService.listScripts({
      trendId: query.trendId,
      language: query.language,
      take: query.take,
    });
    return ok(scripts, { count: scripts.length });
  }

  @Get(':id')
  async getScript(@Param() rawParams: Record<string, string>) {
    const params = validateParams(idParamSchema, rawParams);
    return ok(await this.scriptService.getScript(params.id));
  }
}
