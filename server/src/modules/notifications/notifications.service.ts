import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsRepository } from './repositories/notifications.repository';
import { MessagingGateway } from '@modules/messaging/messaging.gateway';
import {
  CursorNotificationQueryDto,
  PublishNotificationEventDto,
  UpdateNotificationPreferencesDto,
} from './dto/notifications.dto';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly messagingGateway: MessagingGateway,
    private readonly logger: AppLoggerService,
  ) {}

  @OnEvent('notification.publish')
  async handlePublishEvent(payload: PublishNotificationEventDto) {
    return this.publishNotification(payload);
  }

  async publishNotification(dto: PublishNotificationEventDto) {
    // Check target user preferences
    const preferences = await this.notificationsRepository.getUserPreferences(dto.userId);

    if (!this.isCategoryEnabled(dto.category || 'GENERAL', preferences)) {
      this.logger.log(`Skipping notification type '${dto.type}' due to user preferences for user: ${dto.userId}`, 'NotificationsService');
      return null;
    }

    const notification = await this.notificationsRepository.createOrGroupNotification(dto);
    const unreadCount = await this.notificationsRepository.countUnread(dto.userId);

    // Broadcast real-time Socket.IO notification to user
    if (this.messagingGateway.server) {
      this.messagingGateway.server.emit(`user_notification:${dto.userId}`, {
        notification,
        unreadCount,
      });
    }

    this.logger.log(`Published notification '${dto.title}' for user: ${dto.userId}`, 'NotificationsService');

    return notification;
  }

  async getUserNotifications(userId: string, dto: CursorNotificationQueryDto) {
    return this.notificationsRepository.findUserNotifications(userId, dto);
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepository.countUnread(userId);
    return { unreadCount: count };
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationsRepository.markAsRead(id, userId);
    return { success: true, message: 'Notification marked as read' };
  }

  async markAsUnread(id: string, userId: string) {
    await this.notificationsRepository.markAsUnread(id, userId);
    return { success: true, message: 'Notification marked as unread' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.markAllAsRead(userId);
    return { success: true, message: 'All notifications marked as read' };
  }

  async deleteNotification(id: string, userId: string) {
    await this.notificationsRepository.deleteNotification(id, userId);
    return { success: true, message: 'Notification deleted' };
  }

  async archiveNotification(id: string, userId: string) {
    await this.notificationsRepository.archiveNotification(id, userId);
    return { success: true, message: 'Notification archived' };
  }

  async getUserPreferences(userId: string) {
    return this.notificationsRepository.getUserPreferences(userId);
  }

  async updateUserPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    return this.notificationsRepository.updateUserPreferences(userId, dto);
  }

  private isCategoryEnabled(category: string, preferences: Record<string, unknown>): boolean {
    const cat = category.toUpperCase();
    if (cat === 'MESSAGES' && !preferences.messages) return false;
    if (cat === 'COMMUNITIES' && !preferences.communities) return false;
    if (cat === 'EVENTS' && !preferences.events) return false;
    if (cat === 'OPPORTUNITIES' && !preferences.opportunities) return false;
    if (cat === 'FEED' && !preferences.feedActivity) return false;
    if (cat === 'FOLLOWERS' && !preferences.followers) return false;
    if (cat === 'MENTIONS' && !preferences.mentions) return false;
    return true;
  }
}
