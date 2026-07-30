import { Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { BaseAbstractRepository } from '@common/repositories/base.repository';
import { PrismaService } from '@database/prisma.service';
import {
  CursorNotificationQueryDto,
  PublishNotificationEventDto,
  UpdateNotificationPreferencesDto,
} from '../dto/notifications.dto';
import { CursorPaginatedResponse } from '@modules/feed/dto/feed.dto';

@Injectable()
export class NotificationsRepository extends BaseAbstractRepository<Notification> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.notification);
  }

  async findUserNotifications(
    userId: string,
    dto: CursorNotificationQueryDto,
  ): Promise<CursorPaginatedResponse<Record<string, unknown>>> {
    const limit = dto.limit || 15;

    const where: Record<string, unknown> = {
      userId,
      deletedAt: null,
      isArchived: false,
    };

    if (dto.cursor) {
      const cursorNotif = await this.prisma.notification.findUnique({
        where: { id: dto.cursor },
        select: { createdAt: true },
      });

      if (cursorNotif) {
        where.createdAt = { lt: cursorNotif.createdAt };
      }
    }

    const items = await this.prisma.notification.findMany({
      where,
      take: limit + 1,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false, deletedAt: null, isArchived: false },
    });
  }

  async getUserPreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updateUserPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...dto },
    });
  }

  async createOrGroupNotification(dto: PublishNotificationEventDto) {
    // Check if grouping is applicable
    if (dto.groupId) {
      const existingGroup = await this.prisma.notification.findFirst({
        where: {
          userId: dto.userId,
          groupId: dto.groupId,
          isRead: false,
          deletedAt: null,
        },
      });

      if (existingGroup) {
        return this.prisma.notification.update({
          where: { id: existingGroup.id },
          data: {
            title: dto.title,
            body: dto.body,
            groupCount: { increment: 1 },
            updatedAt: new Date(),
          },
        });
      }
    }

    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        link: dto.link,
        priority: dto.priority || 'NORMAL',
        category: dto.category || 'GENERAL',
        groupId: dto.groupId,
        metadata: (dto.metadata as unknown as Prisma.InputJsonValue) || undefined,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAsUnread(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: false },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  async archiveNotification(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isArchived: true },
    });
  }
}
