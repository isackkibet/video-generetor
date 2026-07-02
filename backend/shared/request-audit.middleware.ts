import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logInfo, logWarn } from './logger';

@Injectable()
export class RequestAuditMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    const requestId = String(req.headers['x-request-id'] || '');

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const payload = {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        ip: req.ip,
      };

      if (res.statusCode >= 400) {
        logWarn({
          service: process.env.SERVICE_NAME || 'api-gateway',
          requestId,
          message: 'HTTP request failed',
          metadata: payload,
        });
      } else {
        logInfo({
          service: process.env.SERVICE_NAME || 'api-gateway',
          requestId,
          message: 'HTTP request completed',
          metadata: payload,
        });
      }
    });

    next();
  }
}
