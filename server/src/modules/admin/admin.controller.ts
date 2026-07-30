import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import {
  CreateAnnouncementDto,
  ResolveReportDto,
  SearchAdminUsersDto,
  SuspendUserDto,
  SystemSettingDto,
  ToggleFeatureFlagDto,
} from './dto/admin.dto';

@ApiTags('Platform Administration & Moderation')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- DASHBOARD & ANALYTICS ---

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin platform overview statistics and system health' })
  async getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform usage, community growth, and opportunity analytics' })
  async getAnalyticsOverview() {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'List immutable administrator audit trail logs' })
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  // --- USER MANAGEMENT ---

  @Get('users')
  @ApiOperation({ summary: 'Search and filter platform users for administration' })
  async searchUsers(@Query() dto: SearchAdminUsersDto) {
    return this.adminService.searchUsers(dto);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  async suspendUser(
    @CurrentUser('id') adminId: string,
    @Param('id') userId: string,
    @Body() dto: SuspendUserDto,
  ) {
    return this.adminService.suspendUser(adminId, userId, dto);
  }

  @Post('users/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate suspended user account' })
  async reactivateUser(
    @CurrentUser('id') adminId: string,
    @Param('id') userId: string,
  ) {
    return this.adminService.reactivateUser(adminId, userId);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Soft delete user account' })
  async softDeleteUser(
    @CurrentUser('id') adminId: string,
    @Param('id') userId: string,
  ) {
    return this.adminService.softDeleteUser(adminId, userId);
  }

  // --- MODERATION & REPORTS ---

  @Get('reports')
  @ApiOperation({ summary: 'List submitted content moderation reports' })
  async getReports() {
    return this.adminService.getReports();
  }

  @Patch('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve or dismiss content report' })
  async resolveReport(
    @CurrentUser('id') adminId: string,
    @Param('id') reportId: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.adminService.resolveReport(adminId, reportId, dto);
  }

  @Delete('moderation/posts/:id')
  @ApiOperation({ summary: 'Soft delete abusive feed post by administrator' })
  async deletePost(
    @CurrentUser('id') adminId: string,
    @Param('id') postId: string,
  ) {
    return this.adminService.deletePost(adminId, postId);
  }

  @Patch('moderation/posts/:id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted post' })
  async restorePost(
    @CurrentUser('id') adminId: string,
    @Param('id') postId: string,
  ) {
    return this.adminService.restorePost(adminId, postId);
  }

  // --- SYSTEM SETTINGS, FEATURE FLAGS & ANNOUNCEMENTS ---

  @Get('system/settings')
  @ApiOperation({ summary: 'List platform system settings' })
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Patch('system/settings')
  @ApiOperation({ summary: 'Update system setting key-value configuration' })
  async updateSystemSetting(
    @CurrentUser('id') adminId: string,
    @Body() dto: SystemSettingDto,
  ) {
    return this.adminService.updateSystemSetting(adminId, dto);
  }

  @Get('system/feature-flags')
  @ApiOperation({ summary: 'List platform feature flags' })
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Patch('system/feature-flags')
  @ApiOperation({ summary: 'Toggle feature flag state' })
  async toggleFeatureFlag(
    @CurrentUser('id') adminId: string,
    @Body() dto: ToggleFeatureFlagDto,
  ) {
    return this.adminService.toggleFeatureFlag(adminId, dto);
  }

  @Post('system/announcements')
  @ApiOperation({ summary: 'Publish global system announcement' })
  async createAnnouncement(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.adminService.createAnnouncement(adminId, dto);
  }

  @Get('system/announcements')
  @ApiOperation({ summary: 'List active system announcements' })
  async getAnnouncements() {
    return this.adminService.getAnnouncements();
  }
}
