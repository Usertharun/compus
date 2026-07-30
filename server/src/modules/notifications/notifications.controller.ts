import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import {
  CursorNotificationQueryDto,
  UpdateNotificationPreferencesDto,
} from './dto/notifications.dto';

@ApiTags('Notification System')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications (Cursor-based pagination)' })
  async getUserNotifications(
    @CurrentUser('id') userId: string,
    @Query() dto: CursorNotificationQueryDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, dto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get live unread notification count badge' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preference settings' })
  async getUserPreferences(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUserPreferences(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user notification preference settings' })
  async updateUserPreferences(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updateUserPreferences(userId, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark single notification as unread' })
  async markAsUnread(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsUnread(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete notification' })
  async deleteNotification(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.deleteNotification(id, userId);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive notification' })
  async archiveNotification(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationsService.archiveNotification(id, userId);
  }
}
