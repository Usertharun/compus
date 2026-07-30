import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommunityRole, JoinPolicy, RequestStatus } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { CommunitiesRepository } from './repositories/communities.repository';
import { FeedRepository } from '@modules/feed/repositories/feed.repository';
import {
  CreateCommunityDto,
  SearchCommunitiesDto,
  SubmitJoinRequestDto,
  TransferOwnershipDto,
  UpdateCommunityDto,
} from './dto/communities.dto';
import { CursorPaginationQueryDto } from '@modules/feed/dto/feed.dto';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class CommunitiesService {
  constructor(
    private readonly communitiesRepository: CommunitiesRepository,
    private readonly feedRepository: FeedRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async createCommunity(userId: string, dto: CreateCommunityDto) {
    const slug = dto.slug.toLowerCase();

    const existingSlug = await this.prisma.community.findFirst({
      where: { slug, deletedAt: null },
    });

    if (existingSlug) {
      throw new ConflictException(`Community slug '${slug}' is already registered`);
    }

    const community = await this.prisma.$transaction(async (tx) => {
      const comm = await tx.community.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          category: dto.category || 'Interest Group',
          avatarUrl: dto.avatarUrl,
          bannerUrl: dto.bannerUrl,
          tags: dto.tags || [],
          joinPolicy: dto.joinPolicy || JoinPolicy.OPEN,
          contactEmail: dto.contactEmail,
          websiteUrl: dto.websiteUrl,
          instagramUrl: dto.instagramUrl,
          linkedinUrl: dto.linkedinUrl,
          githubUrl: dto.githubUrl,
          ownerId: userId,
          memberCount: 1,
        },
      });

      await tx.communityMember.create({
        data: {
          communityId: comm.id,
          userId,
          role: CommunityRole.OWNER,
        },
      });

      return comm;
    });

    this.logger.log(`Created new community '${community.name}' (${community.id}) by user: ${userId}`, 'CommunitiesService');

    return this.communitiesRepository.findBySlug(slug);
  }

  async getCommunityDetails(slug: string, viewerId?: string) {
    const community = await this.communitiesRepository.findBySlug(slug);

    if (!community) {
      throw new NotFoundException(`Community '${slug}' not found`);
    }

    let userRole: CommunityRole | null = null;
    let hasPendingRequest = false;

    if (viewerId) {
      userRole = await this.communitiesRepository.findMemberRole(community.id, viewerId);
      if (!userRole) {
        const pending = await this.prisma.communityJoinRequest.findUnique({
          where: {
            communityId_userId: {
              communityId: community.id,
              userId: viewerId,
            },
          },
        });
        hasPendingRequest = pending?.status === RequestStatus.PENDING;
      }
    }

    const [moderators, statistics] = await Promise.all([
      this.prisma.communityMember.findMany({
        where: { communityId: community.id, role: { in: [CommunityRole.OWNER, CommunityRole.MODERATOR] } },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { name: true, username: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.getCommunityStatistics(community.id),
    ]);

    return {
      ...community,
      userRole,
      hasPendingRequest,
      moderators,
      statistics,
    };
  }

  async updateCommunity(userId: string, communityId: string, dto: UpdateCommunityDto) {
    const role = await this.communitiesRepository.findMemberRole(communityId, userId);

    if (role !== CommunityRole.OWNER && role !== CommunityRole.MODERATOR) {
      throw new ForbiddenException('Only community Owner or Moderators can update community settings');
    }

    const updated = await this.prisma.community.update({
      where: { id: communityId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
        ...(dto.tags && { tags: dto.tags }),
        ...(dto.joinPolicy && { joinPolicy: dto.joinPolicy }),
        ...(dto.contactEmail !== undefined && { contactEmail: dto.contactEmail }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
        ...(dto.instagramUrl !== undefined && { instagramUrl: dto.instagramUrl }),
        ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl }),
        ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
      },
    });

    return this.communitiesRepository.findByIdWithDetails(updated.id);
  }

  async deleteCommunity(userId: string, communityId: string, userRole?: string) {
    const role = await this.communitiesRepository.findMemberRole(communityId, userId);

    if (role !== CommunityRole.OWNER && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only the Community Owner can delete this community');
    }

    await this.prisma.community.update({
      where: { id: communityId },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Soft deleted community: ${communityId}`, 'CommunitiesService');

    return { message: 'Community deleted successfully' };
  }

  // --- DISCOVERY & SEARCH ---

  async browseCommunities(dto: SearchCommunitiesDto) {
    const { items, total, page, limit } = await this.communitiesRepository.searchCommunities(dto);
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async getTrendingCommunities() {
    return this.communitiesRepository.findTrendingCommunities(6);
  }

  async getCategories() {
    const categories = await this.prisma.community.groupBy({
      by: ['category'],
      where: { deletedAt: null },
      _count: { category: true },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }

  // --- MEMBERSHIP & JOIN FLOWS ---

  async joinCommunity(userId: string, communityId: string) {
    const community = await this.prisma.community.findFirst({
      where: { id: communityId, deletedAt: null },
    });

    if (!community) throw new NotFoundException('Community not found');

    const existingRole = await this.communitiesRepository.findMemberRole(communityId, userId);
    if (existingRole) {
      throw new ConflictException('You are already a member of this community');
    }

    if (community.joinPolicy === JoinPolicy.APPROVAL_REQUIRED) {
      throw new BadRequestException('This community requires approval to join. Please submit a join request.');
    }

    if (community.joinPolicy === JoinPolicy.INVITE_ONLY) {
      throw new ForbiddenException('This community is invite-only.');
    }

    const member = await this.communitiesRepository.addMember(communityId, userId, CommunityRole.MEMBER);
    return { success: true, message: 'Joined community successfully', member };
  }

  async requestAccess(userId: string, communityId: string, dto: SubmitJoinRequestDto) {
    const community = await this.prisma.community.findFirst({
      where: { id: communityId, deletedAt: null },
    });

    if (!community) throw new NotFoundException('Community not found');

    const existingRole = await this.communitiesRepository.findMemberRole(communityId, userId);
    if (existingRole) throw new ConflictException('You are already a member of this community');

    const request = await this.prisma.communityJoinRequest.upsert({
      where: {
        communityId_userId: { communityId, userId },
      },
      update: {
        status: RequestStatus.PENDING,
        message: dto.message,
      },
      create: {
        communityId,
        userId,
        status: RequestStatus.PENDING,
        message: dto.message,
      },
    });

    return { success: true, message: 'Membership request submitted', request };
  }

  async leaveCommunity(userId: string, communityId: string) {
    const role = await this.communitiesRepository.findMemberRole(communityId, userId);

    if (!role) throw new NotFoundException('You are not a member of this community');
    if (role === CommunityRole.OWNER) {
      throw new BadRequestException('Community Owner cannot leave without transferring ownership first.');
    }

    await this.communitiesRepository.removeMember(communityId, userId);
    return { success: true, message: 'Left community successfully' };
  }

  async getPendingRequests(userId: string, communityId: string) {
    const role = await this.communitiesRepository.findMemberRole(communityId, userId);

    if (role !== CommunityRole.OWNER && role !== CommunityRole.MODERATOR) {
      throw new ForbiddenException('Only Community Owner or Moderators can view join requests');
    }

    return this.prisma.communityJoinRequest.findMany({
      where: { communityId, status: RequestStatus.PENDING },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true, username: true, avatarUrl: true, department: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptJoinRequest(userId: string, requestId: string) {
    const request = await this.prisma.communityJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Join request not found');

    const role = await this.communitiesRepository.findMemberRole(request.communityId, userId);
    if (role !== CommunityRole.OWNER && role !== CommunityRole.MODERATOR) {
      throw new ForbiddenException('Only Owner or Moderator can accept requests');
    }

    await this.prisma.$transaction([
      this.prisma.communityJoinRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.APPROVED },
      }),
      this.prisma.communityMember.create({
        data: {
          communityId: request.communityId,
          userId: request.userId,
          role: CommunityRole.MEMBER,
        },
      }),
      this.prisma.community.update({
        where: { id: request.communityId },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return { success: true, message: 'Join request accepted' };
  }

  async rejectJoinRequest(userId: string, requestId: string) {
    const request = await this.prisma.communityJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new NotFoundException('Join request not found');

    const role = await this.communitiesRepository.findMemberRole(request.communityId, userId);
    if (role !== CommunityRole.OWNER && role !== CommunityRole.MODERATOR) {
      throw new ForbiddenException('Only Owner or Moderator can reject requests');
    }

    await this.prisma.communityJoinRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.REJECTED },
    });

    return { success: true, message: 'Join request rejected' };
  }

  // --- ROLES & MODERATION ---

  async assignModerator(ownerId: string, communityId: string, targetUserId: string) {
    const role = await this.communitiesRepository.findMemberRole(communityId, ownerId);
    if (role !== CommunityRole.OWNER) throw new ForbiddenException('Only Community Owner can assign moderators');

    await this.communitiesRepository.updateMemberRole(communityId, targetUserId, CommunityRole.MODERATOR);
    return { success: true, message: 'User promoted to Community Moderator' };
  }

  async removeModerator(ownerId: string, communityId: string, targetUserId: string) {
    const role = await this.communitiesRepository.findMemberRole(communityId, ownerId);
    if (role !== CommunityRole.OWNER) throw new ForbiddenException('Only Community Owner can remove moderators');

    await this.communitiesRepository.updateMemberRole(communityId, targetUserId, CommunityRole.MEMBER);
    return { success: true, message: 'User demoted to Community Member' };
  }

  async transferOwnership(ownerId: string, communityId: string, dto: TransferOwnershipDto) {
    const role = await this.communitiesRepository.findMemberRole(communityId, ownerId);
    if (role !== CommunityRole.OWNER) throw new ForbiddenException('Only Community Owner can transfer ownership');

    const targetRole = await this.communitiesRepository.findMemberRole(communityId, dto.targetUserId);
    if (!targetRole) throw new BadRequestException('Target user must be a member of the community first.');

    await this.prisma.$transaction([
      this.prisma.communityMember.update({
        where: { communityId_userId: { communityId, userId: ownerId } },
        data: { role: CommunityRole.MODERATOR },
      }),
      this.prisma.communityMember.update({
        where: { communityId_userId: { communityId, userId: dto.targetUserId } },
        data: { role: CommunityRole.OWNER },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: { ownerId: dto.targetUserId },
      }),
    ]);

    return { success: true, message: 'Community ownership transferred successfully' };
  }

  // --- COMMUNITY FEED REUSE ---

  async getCommunityFeed(communityId: string, dto: CursorPaginationQueryDto) {
    const limit = dto.limit || 10;
    const where: Record<string, unknown> = {
      communityId,
      deletedAt: null,
    };

    if (dto.cursor) {
      const cursorPost = await this.prisma.post.findUnique({
        where: { id: dto.cursor },
        select: { createdAt: true },
      });
      if (cursorPost) {
        where.createdAt = { lt: cursorPost.createdAt };
      }
    }

    const items = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true, username: true, avatarUrl: true } },
          },
        },
        media: true,
      },
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  private async getCommunityStatistics(communityId: string) {
    const [memberCount, postCount, pendingRequestCount] = await Promise.all([
      this.prisma.communityMember.count({ where: { communityId } }),
      this.prisma.post.count({ where: { communityId, deletedAt: null } }),
      this.prisma.communityJoinRequest.count({ where: { communityId, status: RequestStatus.PENDING } }),
    ]);

    return {
      memberCount,
      postCount,
      pendingRequestCount,
    };
  }
}
