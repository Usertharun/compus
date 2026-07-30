import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';

@ApiTags('Sessions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'View active logged-in device sessions for current account' })
  async getActiveSessions(@CurrentUser('id') userId: string) {
    return this.sessionsService.getUserSessions(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a specific device session' })
  async revokeSession(@CurrentUser('id') userId: string, @Param('id') sessionId: string) {
    return this.sessionsService.revokeSession(userId, sessionId);
  }

  @Delete()
  @ApiOperation({ summary: 'Revoke all other logged-in device sessions' })
  async revokeAllOtherSessions(@CurrentUser('id') userId: string) {
    return this.sessionsService.revokeAllOtherSessions(userId);
  }
}
