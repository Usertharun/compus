import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class SentryService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit(): void {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    if (dsn) {
      Sentry.init({
        dsn,
        environment,
        tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
      });
      this.logger.log('✅ Sentry APM Error Tracing initialized', 'SentryService');
    } else {
      this.logger.warn('ℹ️ Sentry DSN not provided. Sentry tracing disabled.', 'SentryService');
    }
  }

  captureException(exception: unknown, hint?: EventHint): void {
    Sentry.captureException(exception, hint);
  }

  captureMessage(message: string, level?: Sentry.SeverityLevel): void {
    Sentry.captureMessage(message, level);
  }
}

export type EventHint = Record<string, unknown>;
