import { Controller, Get, Header } from '@nestjs/common';
import { metricsRegistry } from './metrics';

@Controller()
export class MetricsController {
  @Get('metrics')
  @Header('Content-Type', 'text/plain')
  async metrics() {
    return metricsRegistry.metrics();
  }
}
