import { Injectable } from '@nestjs/common';
import { Opportunity, PersonalOpportunityStatus } from '@prisma/client';
import { BaseAbstractRepository } from '@common/repositories/base.repository';
import { PrismaService } from '@database/prisma.service';
import { SearchOpportunitiesDto } from '../dto/opportunities.dto';

@Injectable()
export class OpportunitiesRepository extends BaseAbstractRepository<Opportunity> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.opportunity);
  }

  private oppIncludeSelect() {
    return {
      creator: {
        select: {
          id: true,
          email: true,
          profile: { select: { name: true, username: true, avatarUrl: true } },
        },
      },
      organization: true,
      media: true,
      comments: {
        where: { deletedAt: null, parentId: null },
        include: {
          author: {
            select: {
              id: true,
              profile: { select: { name: true, username: true, avatarUrl: true } },
            },
          },
          replies: {
            where: { deletedAt: null },
            include: {
              author: {
                select: {
                  id: true,
                  profile: { select: { name: true, username: true, avatarUrl: true } },
                },
              },
            },
            orderBy: { createdAt: 'asc' as const },
          },
        },
        orderBy: { createdAt: 'desc' as const },
      },
    };
  }

  async findOpportunityById(id: string) {
    return this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
      include: this.oppIncludeSelect(),
    });
  }

  async searchOpportunities(dto: SearchOpportunitiesDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const whereConditions: Record<string, unknown>[] = [{ deletedAt: null, status: 'OPEN' }];

    if (dto.search) {
      const q = dto.search;
      whereConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (dto.category) {
      whereConditions.push({ category: { contains: dto.category, mode: 'insensitive' } });
    }

    if (dto.mode) {
      whereConditions.push({ mode: dto.mode });
    }

    if (dto.skill) {
      whereConditions.push({ requiredSkills: { has: dto.skill } });
    }

    if (dto.organization) {
      whereConditions.push({ companyName: { contains: dto.organization, mode: 'insensitive' } });
    }

    const where = { AND: whereConditions };

    const [items, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.oppIncludeSelect(),
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findLatestOpportunities(limit = 10) {
    return this.prisma.opportunity.findMany({
      where: { deletedAt: null, status: 'OPEN' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: this.oppIncludeSelect(),
    });
  }

  async findExpiringSoon(limit = 10) {
    const now = new Date();
    return this.prisma.opportunity.findMany({
      where: {
        deletedAt: null,
        status: 'OPEN',
        deadline: { gte: now },
      },
      take: limit,
      orderBy: { deadline: 'asc' },
      include: this.oppIncludeSelect(),
    });
  }

  async setPersonalStatus(opportunityId: string, userId: string, status: PersonalOpportunityStatus) {
    return this.prisma.userOpportunityStatus.upsert({
      where: { opportunityId_userId: { opportunityId, userId } },
      update: { status },
      create: { opportunityId, userId, status },
    });
  }

  async removePersonalStatus(opportunityId: string, userId: string) {
    await this.prisma.userOpportunityStatus.deleteMany({
      where: { opportunityId, userId },
    });
  }

  async findUserApplications(userId: string) {
    return this.prisma.userOpportunityStatus.findMany({
      where: { userId },
      include: {
        opportunity: {
          include: this.oppIncludeSelect(),
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addBookmark(opportunityId: string, userId: string) {
    return this.prisma.bookmark.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: 'OPPORTUNITY',
          targetId: opportunityId,
        },
      },
      update: {},
      create: {
        userId,
        targetType: 'OPPORTUNITY',
        targetId: opportunityId,
        opportunityId,
      },
    });
  }

  async removeBookmark(opportunityId: string, userId: string) {
    await this.prisma.bookmark.deleteMany({
      where: { userId, targetType: 'OPPORTUNITY', targetId: opportunityId },
    });
  }
}
