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
  async communities(dto: SearchAdminUsersDto) {
    const page = dto.page || 1, limit = dto.limit || 20;
    const where = { deletedAt: null, ...(dto.search ? { name: { contains: dto.search, mode: 'insensitive' as const } } : {}) };
    const [items, total] = await Promise.all([
      this.prisma.community.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ name: 'asc' }, { id: 'asc' }], select: { id: true, name: true, login: { select: { email: true } } } }),
      this.prisma.community.count({ where }),
    ]);
    return new PaginatedResponseDto(items, total, page, limit);
  }
  async provisionCommunity(adminId: string, dto: import('./dto/admin.dto').CommunityLoginDto) {
    const email = dto.email.trim().toLowerCase();
    if (email.endsWith('@srmist.edu.in')) throw new BadRequestException('Use a permanent club mailbox outside the student email domain');
    const community = await this.prisma.community.findFirst({ where: { id: dto.communityId, deletedAt: null } });
    if (!community) throw new NotFoundException('Community not found');
    const currentLogin = await this.prisma.communityLogin.findUnique({ where: { communityId: dto.communityId } });
    if (currentLogin?.email === email) return currentLogin;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('This email already belongs to an account');
    const emailLogin = await this.prisma.communityLogin.findUnique({ where: { email } });
    if (emailLogin && emailLogin.communityId !== dto.communityId)
      throw new BadRequestException('This email is already approved for another community');
    if (currentLogin) {
      const activated = await this.prisma.user.findUnique({ where: { email: currentLogin.email }, select: { id: true } });
      if (activated)
        throw new BadRequestException('This community login is already active. Delete or transfer the existing community account before changing its email.');
    }
    const login = currentLogin
      ? await this.prisma.communityLogin.update({ where: { id: currentLogin.id }, data: { email } })
      : await this.prisma.communityLogin.create({ data: { email, communityId: dto.communityId } });
    await this.adminRepository.recordAdminAuditLog(adminId, 'PROVISION_COMMUNITY_LOGIN', 'COMMUNITY', dto.communityId, { email });
    return login;
  }

  async communityLogins() {
    return this.prisma.communityLogin.findMany({ include: { community: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async revokeSessions(adminId: string, userId: string) {
    await this.prisma.$transaction([
      this.prisma.session.updateMany({ where: { userId }, data: { isRevoked: true } }),
      this.prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } }),
    ]);
    await this.adminRepository.recordAdminAuditLog(adminId, 'REVOKE_SESSIONS', 'USER', userId);
    return { success: true };
  }
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
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    if (user.role === 'SUPER_ADMIN') throw new BadRequestException('Owner accounts cannot be suspended');

    const suspended = await this.adminRepository.suspendUser(userId);
    await this.revokeSessions(adminId, userId);
    await this.adminRepository.recordAdminAuditLog(adminId, 'SUSPEND_USER', 'USER', userId, { reason: dto.reason });

    this.logger.warn(`Admin ${adminId} suspended user ${userId}. Reason: ${dto.reason}`, 'AdminService');

    return { success: true, message: 'User suspended successfully', suspended };
  }

  async reactivateUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    const reactivated = await this.adminRepository.reactivateUser(userId);
    await this.adminRepository.recordAdminAuditLog(adminId, 'REACTIVATE_USER', 'USER', userId);

    return { success: true, message: 'User reactivated successfully', reactivated };
  }

  async softDeleteUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new BadRequestException('Super Admins cannot delete their own account.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    if (user.role === 'SUPER_ADMIN') throw new BadRequestException('Owner accounts cannot be deleted');
    const owned = await this.prisma.community.count({ where: { ownerId: userId, deletedAt: null } });
    if (owned) throw new BadRequestException('Transfer community ownership before deleting this account');

    await this.adminRepository.softDeleteUser(userId);
    await this.revokeSessions(adminId, userId);
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
