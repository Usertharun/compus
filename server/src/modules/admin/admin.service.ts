import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AdminRepository } from './repositories/admin.repository';
import {
  CreateAnnouncementDto,
  ResolveReportDto,
  SearchAdminUsersDto,
  SuspendUserDto,
  SystemSettingDto,
  ToggleFeatureFlagDto,
} from './dto/admin.dto';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async getDashboardOverview() {
    return this.adminRepository.getPlatformOverviewStats();
  }

  async searchUsers(dto: SearchAdminUsersDto) {
    const { items, total, page, limit } = await this.adminRepository.searchUsers(dto);
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async suspendUser(adminId: string, userId: string, dto: SuspendUserDto) {
    if (adminId === userId) {
      throw new BadRequestException('Super Admins cannot suspend their own account.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const suspended = await this.adminRepository.suspendUser(userId);
    await this.adminRepository.recordAdminAuditLog(adminId, 'SUSPEND_USER', 'USER', userId, { reason: dto.reason });

    this.logger.warn(`Admin ${adminId} suspended user ${userId}. Reason: ${dto.reason}`, 'AdminService');

    return { success: true, message: 'User suspended successfully', suspended };
  }

  async reactivateUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const reactivated = await this.adminRepository.reactivateUser(userId);
    await this.adminRepository.recordAdminAuditLog(adminId, 'REACTIVATE_USER', 'USER', userId);

    return { success: true, message: 'User reactivated successfully', reactivated };
  }

  async softDeleteUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new BadRequestException('Super Admins cannot delete their own account.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.adminRepository.softDeleteUser(userId);
    await this.adminRepository.recordAdminAuditLog(adminId, 'SOFT_DELETE_USER', 'USER', userId);

    return { success: true, message: 'User soft-deleted successfully' };
  }

  // --- MODERATION & REPORTS ---

  async getReports() {
    return this.adminRepository.findReports(50);
  }

  async resolveReport(adminId: string, reportId: string, dto: ResolveReportDto) {
    const resolved = await this.adminRepository.resolveReport(reportId, dto);
    await this.adminRepository.recordAdminAuditLog(adminId, 'RESOLVE_REPORT', 'POST_REPORT', reportId, dto);

    return { success: true, message: `Report marked as ${dto.status}`, resolved };
  }

  async deletePost(adminId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    await this.adminRepository.deletePostByAdmin(postId);
    await this.adminRepository.recordAdminAuditLog(adminId, 'DELETE_POST_MODERATION', 'POST', postId);

    return { success: true, message: 'Post removed by administrator' };
  }

  async restorePost(adminId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    await this.adminRepository.restorePostByAdmin(postId);
    await this.adminRepository.recordAdminAuditLog(adminId, 'RESTORE_POST_MODERATION', 'POST', postId);

    return { success: true, message: 'Post restored by administrator' };
  }

  // --- SYSTEM SETTINGS & FEATURE FLAGS ---

  async getSystemSettings() {
    return this.adminRepository.getSystemSettings();
  }

  async updateSystemSetting(adminId: string, dto: SystemSettingDto) {
    const setting = await this.adminRepository.upsertSystemSetting(dto);
    await this.adminRepository.recordAdminAuditLog(adminId, 'UPDATE_SYSTEM_SETTING', 'SYSTEM_SETTING', setting.id, dto);

    return setting;
  }

  async getFeatureFlags() {
    return this.adminRepository.getFeatureFlags();
  }

  async toggleFeatureFlag(adminId: string, dto: ToggleFeatureFlagDto) {
    const flag = await this.adminRepository.toggleFeatureFlag(dto);
    await this.adminRepository.recordAdminAuditLog(adminId, 'TOGGLE_FEATURE_FLAG', 'FEATURE_FLAG', flag.id, dto);

    return flag;
  }

  async createAnnouncement(adminId: string, dto: CreateAnnouncementDto) {
    const announcement = await this.adminRepository.createAnnouncement(dto);
    await this.adminRepository.recordAdminAuditLog(adminId, 'CREATE_ANNOUNCEMENT', 'SYSTEM_ANNOUNCEMENT', announcement.id, dto);

    return announcement;
  }

  async getAnnouncements() {
    return this.adminRepository.getAnnouncements();
  }

  async getAnalyticsOverview() {
    const [recentUsers, topCommunities, topOpportunities] = await Promise.all([
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, createdAt: true },
      }),
      this.prisma.community.findMany({
        take: 5,
        orderBy: { memberCount: 'desc' },
        select: { id: true, name: true, memberCount: true, postCount: true },
      }),
      this.prisma.opportunity.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, companyName: true, category: true },
      }),
    ]);

    return {
      recentUsers,
      topCommunities,
      topOpportunities,
    };
  }

  async getAuditLogs() {
    return this.adminRepository.getAuditLogs(50);
  }
}
