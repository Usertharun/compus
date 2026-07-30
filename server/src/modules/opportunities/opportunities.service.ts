import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpportunityStatus, PersonalOpportunityStatus } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { OpportunitiesRepository } from './repositories/opportunities.repository';
import {
  AddOppCommentDto,
  CreateOpportunityDto,
  SearchOpportunitiesDto,
  UpdateOpportunityDto,
  UpdatePersonalStatusDto,
} from './dto/opportunities.dto';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly opportunitiesRepository: OpportunitiesRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async createOpportunity(userId: string, dto: CreateOpportunityDto) {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new BadRequestException('Opportunity title is required');
    }

    // Resolve or upsert Organization entity
    let organizationId: string | undefined = undefined;
    if (dto.companyName) {
      const org = await this.prisma.organization.upsert({
        where: { name: dto.companyName.trim() },
        update: {
          ...(dto.companyLogo && { logoUrl: dto.companyLogo }),
          ...(dto.organizationType && { type: dto.organizationType }),
        },
        create: {
          name: dto.companyName.trim(),
          logoUrl: dto.companyLogo,
          type: dto.organizationType || 'COMPANY',
        },
      });
      organizationId = org.id;
    }

    const opportunity = await this.prisma.opportunity.create({
      data: {
        title: dto.title,
        shortDescription: dto.shortDescription,
        description: dto.description,
        category: dto.category || 'INTERNSHIP',
        companyName: dto.companyName,
        companyLogo: dto.companyLogo,
        organizationId,
        creatorId: userId,
        applicationUrl: dto.applicationUrl,
        registrationUrl: dto.registrationUrl,
        location: dto.location,
        mode: dto.mode || 'HYBRID',
        eligibility: dto.eligibility || [],
        requiredSkills: dto.requiredSkills || [],
        benefits: dto.benefits || [],
        stipend: dto.stipend,
        deadline: dto.deadline,
        startDate: dto.startDate,
        endDate: dto.endDate,
        bannerUrl: dto.bannerUrl,
        tags: dto.tags || [],
        status: OpportunityStatus.OPEN,
        media: dto.media && dto.media.length > 0
          ? {
              create: dto.media.map((m) => ({
                url: m.url,
                type: m.type,
                caption: m.caption,
              })),
            }
          : undefined,
      },
    });

    this.logger.log(`Created new opportunity '${opportunity.title}' (${opportunity.id}) by: ${userId}`, 'OpportunitiesService');

    return this.opportunitiesRepository.findOpportunityById(opportunity.id);
  }

  async getOpportunityDetails(opportunityId: string, viewerId?: string) {
    const opp = await this.opportunitiesRepository.findOpportunityById(opportunityId);

    if (!opp) {
      throw new NotFoundException(`Opportunity '${opportunityId}' not found`);
    }

    let personalStatus: PersonalOpportunityStatus | null = null;
    let isBookmarked = false;

    if (viewerId) {
      const [userStatus, bookmark] = await Promise.all([
        this.prisma.userOpportunityStatus.findUnique({
          where: { opportunityId_userId: { opportunityId, userId: viewerId } },
        }),
        this.prisma.bookmark.findUnique({
          where: {
            userId_targetType_targetId: {
              userId: viewerId,
              targetType: 'OPPORTUNITY',
              targetId: opportunityId,
            },
          },
        }),
      ]);

      personalStatus = userStatus?.status || null;
      isBookmarked = !!bookmark;
    }

    return {
      ...opp,
      personalStatus,
      isBookmarked,
    };
  }

  async updateOpportunity(userId: string, opportunityId: string, dto: UpdateOpportunityDto) {
    const opp = await this.prisma.opportunity.findFirst({
      where: { id: opportunityId, deletedAt: null },
    });

    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.creatorId !== userId) {
      throw new ForbiddenException('Only the Opportunity Creator can edit this posting');
    }

    const updated = await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
        ...(dto.description && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.companyName && { companyName: dto.companyName }),
        ...(dto.companyLogo !== undefined && { companyLogo: dto.companyLogo }),
        ...(dto.applicationUrl !== undefined && { applicationUrl: dto.applicationUrl }),
        ...(dto.registrationUrl !== undefined && { registrationUrl: dto.registrationUrl }),
        ...(dto.location && { location: dto.location }),
        ...(dto.mode && { mode: dto.mode }),
        ...(dto.eligibility && { eligibility: dto.eligibility }),
        ...(dto.requiredSkills && { requiredSkills: dto.requiredSkills }),
        ...(dto.benefits && { benefits: dto.benefits }),
        ...(dto.stipend !== undefined && { stipend: dto.stipend }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline }),
        ...(dto.status && { status: dto.status }),
      },
    });

    return this.opportunitiesRepository.findOpportunityById(updated.id);
  }

  async deleteOpportunity(userId: string, opportunityId: string, userRole?: string) {
    const opp = await this.prisma.opportunity.findFirst({
      where: { id: opportunityId, deletedAt: null },
    });

    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.creatorId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Opportunity Creator or Super Admin can delete this item');
    }

    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { deletedAt: new Date(), status: OpportunityStatus.ARCHIVED },
    });

    return { message: 'Opportunity deleted successfully' };
  }

  // --- PERSONAL STATUS TRACKING ---

  async setPersonalStatus(userId: string, opportunityId: string, dto: UpdatePersonalStatusDto) {
    const opp = await this.prisma.opportunity.findFirst({
      where: { id: opportunityId, deletedAt: null },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');

    const statusRecord = await this.opportunitiesRepository.setPersonalStatus(opportunityId, userId, dto.status);
    return { success: true, message: `Opportunity marked as ${dto.status}`, statusRecord };
  }

  async removePersonalStatus(userId: string, opportunityId: string) {
    await this.opportunitiesRepository.removePersonalStatus(opportunityId, userId);
    return { success: true, message: 'Opportunity personal status removed' };
  }

  async getUserApplications(userId: string) {
    return this.opportunitiesRepository.findUserApplications(userId);
  }

  // --- DISCOVERY & SEARCH ---

  async browseOpportunities(dto: SearchOpportunitiesDto) {
    const { items, total, page, limit } = await this.opportunitiesRepository.searchOpportunities(dto);
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async getLatestOpportunities() {
    return this.opportunitiesRepository.findLatestOpportunities(10);
  }

  async getExpiringSoon() {
    return this.opportunitiesRepository.findExpiringSoon(10);
  }

  async getCategories() {
    const categories = await this.prisma.opportunity.groupBy({
      by: ['category'],
      where: { deletedAt: null },
      _count: { category: true },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }

  // --- COMMENTS & BOOKMARKS ---

  async addComment(opportunityId: string, userId: string, dto: AddOppCommentDto) {
    const opp = await this.prisma.opportunity.findFirst({
      where: { id: opportunityId, deletedAt: null },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunityComment.create({
      data: {
        opportunityId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { name: true, username: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.opportunityComment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Cannot delete comment');

    await this.prisma.opportunityComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Comment deleted successfully' };
  }

  async bookmarkOpportunity(opportunityId: string, userId: string) {
    await this.opportunitiesRepository.addBookmark(opportunityId, userId);
    return { success: true, message: 'Opportunity saved to bookmarks' };
  }

  async removeBookmark(opportunityId: string, userId: string) {
    await this.opportunitiesRepository.removeBookmark(opportunityId, userId);
    return { success: true, message: 'Opportunity removed from bookmarks' };
  }

  async getUserBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId, targetType: 'OPPORTUNITY' },
      include: {
        opportunity: {
          include: {
            creator: {
              select: { id: true, profile: { select: { name: true, username: true } } },
            },
          },
        },
      },
    });

    return bookmarks.map((b) => b.opportunity).filter(Boolean);
  }
}
