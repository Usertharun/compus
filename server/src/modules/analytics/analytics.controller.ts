import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Product Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post('session')
  @ApiOperation({ summary: 'Record one authenticated active session per UTC day' })
  async recordSession(@CurrentUser('id') userId: string) {
    return this.analytics.recordDailySession(userId);
  }
}
