import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import {
  CreateAnnouncementDto,
  ResolveReportDto,
  SearchAdminUsersDto,
  SystemSettingDto,
  ToggleFeatureFlagDto,
} from '../dto/admin.dto';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformOverviewStats() {
    const [
      totalUsers,
      activeUsers,
      totalCommunities,
      totalPosts,
      totalEvents,
      totalOpportunities,
      totalMessages,
      totalNotifications,
      pendingReports,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.community.count({ where: { deletedAt: null } }),
      this.prisma.post.count({ where: { deletedAt: null } }),
      this.prisma.event.count({ where: { deletedAt: null } }),
      this.prisma.opportunity.count({ where: { deletedAt: null } }),
      this.prisma.message.count({ where: { deletedAt: null } }),
      this.prisma.notification.count({ where: { deletedAt: null } }),
      this.prisma.postReport.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalCommunities,
      totalPosts,
      totalEvents,
      totalOpportunities,
      totalMessages,
      totalNotifications,
      pendingReports,
      systemHealth: 'OPERATIONAL',
      timestamp: new Date(),
    };
  }

  async searchUsers(dto: SearchAdminUsersDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const whereConditions: Record<string, unknown>[] = [{ deletedAt: null }];

    if (dto.search) {
      whereConditions.push({
        OR: [
          { email: { contains: dto.search, mode: 'insensitive' } },
          { profile: { name: { contains: dto.search, mode: 'insensitive' } } },
          { profile: { username: { contains: dto.search, mode: 'insensitive' } } },
        ],
      });
    }

    if (dto.role) whereConditions.push({ role: dto.role });
    if (dto.isActive !== undefined) whereConditions.push({ isActive: dto.isActive });
    if (dto.department) whereConditions.push({ profile: { department: dto.department } });

    const where = { AND: whereConditions };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          lastLoginAt: true,
          createdAt: true,
          profile: {
            select: { name: true, username: true, department: true, year: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items: users, total, page, limit };
  }

  async suspendUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async reactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async softDeleteUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // --- MODERATION & REPORTS ---

  async findReports(limit = 20) {
    return this.prisma.postReport.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { id: true, email: true, profile: { select: { name: true, username: true } } },
        },
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            authorId: true,
            deletedAt: true,
          },
        },
      },
    });
  }

  async resolveReport(reportId: string, dto: ResolveReportDto) {
    const report = await this.prisma.postReport.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        details: dto.details,
      },
    });

    if (dto.deleteContent && report.postId) {
      await this.prisma.post.update({
        where: { id: report.postId },
        data: { deletedAt: new Date() },
      });
    }

    return report;
  }

  async deletePostByAdmin(postId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  }

  async restorePostByAdmin(postId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: null },
    });
  }

  // --- SYSTEM SETTINGS & FEATURE FLAGS ---

  async getSystemSettings() {
    return this.prisma.systemSetting.findMany();
  }

  async upsertSystemSetting(dto: SystemSettingDto) {
    return this.prisma.systemSetting.upsert({
      where: { key: dto.key },
      update: { value: dto.value as unknown as Prisma.InputJsonValue, description: dto.description },
      create: { key: dto.key, value: dto.value as unknown as Prisma.InputJsonValue, description: dto.description },
    });
  }

  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany();
  }

  async toggleFeatureFlag(dto: ToggleFeatureFlagDto) {
    return this.prisma.featureFlag.upsert({
      where: { key: dto.key },
      update: { isEnabled: dto.isEnabled, description: dto.description },
      create: { key: dto.key, isEnabled: dto.isEnabled, description: dto.description },
    });
  }

  async createAnnouncement(dto: CreateAnnouncementDto) {
    return this.prisma.systemAnnouncement.create({
      data: {
        title: dto.title,
        content: dto.content,
        priority: dto.priority || 'NORMAL',
      },
    });
  }

  async getAnnouncements() {
    return this.prisma.systemAnnouncement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- AUDIT LOGS ---

  async recordAdminAuditLog(adminId: string, action: string, resource: string, resourceId?: string, details?: Record<string, unknown> | object) {
    return this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action,
        resource,
        resourceId,
        details: (details as unknown as Prisma.InputJsonValue) || undefined,
      },
    });
  }

  async getAuditLogs(limit = 20) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }
}
