import { Injectable } from '@nestjs/common';
import { Community, CommunityRole } from '@prisma/client';
import { BaseAbstractRepository } from '@common/repositories/base.repository';
import { PrismaService } from '@database/prisma.service';
import { SearchCommunitiesDto } from '../dto/communities.dto';

@Injectable()
export class CommunitiesRepository extends BaseAbstractRepository<Community> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.community);
  }

  private communitySelect() {
    return {
      owner: {
        select: {
          id: true,
          email: true,
          profile: { select: { name: true, username: true, avatarUrl: true } },
        },
      },
      members: {
        take: 10,
        orderBy: { joinedAt: 'desc' as const },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { name: true, username: true, avatarUrl: true } },
            },
          },
        },
      },
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.community.findFirst({
      where: { slug: slug.toLowerCase(), deletedAt: null },
      include: this.communitySelect(),
    });
  }

  async findByIdWithDetails(id: string) {
    return this.prisma.community.findFirst({
      where: { id, deletedAt: null },
      include: this.communitySelect(),
    });
  }

  async findMemberRole(communityId: string, userId: string): Promise<CommunityRole | null> {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId, userId },
      },
    });

    return member ? member.role : null;
  }

  async searchCommunities(dto: SearchCommunitiesDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const whereConditions: Record<string, unknown>[] = [{ deletedAt: null }];

    if (dto.search) {
      const q = dto.search;
      whereConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (dto.category) {
      whereConditions.push({ category: { contains: dto.category, mode: 'insensitive' } });
    }

    if (dto.tag) {
      whereConditions.push({ tags: { has: dto.tag } });
    }

    const where = { AND: whereConditions };

    const [items, total] = await Promise.all([
      this.prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: { memberCount: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              profile: { select: { name: true, username: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.community.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findTrendingCommunities(limit = 6) {
    return this.prisma.community.findMany({
      where: { deletedAt: null },
      take: limit,
      orderBy: [{ memberCount: 'desc' }, { postCount: 'desc' }],
      include: {
        owner: {
          select: {
            id: true,
            profile: { select: { name: true, username: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async addMember(communityId: string, userId: string, role: CommunityRole = CommunityRole.MEMBER) {
    const [member] = await Promise.all([
      this.prisma.communityMember.create({
        data: { communityId, userId, role },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return member;
  }

  async removeMember(communityId: string, userId: string) {
    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });

    if (!existing) return;

    await Promise.all([
      this.prisma.communityMember.delete({
        where: { id: existing.id },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);
  }

  async updateMemberRole(communityId: string, userId: string, role: CommunityRole) {
    return this.prisma.communityMember.update({
      where: { communityId_userId: { communityId, userId } },
      data: { role },
    });
  }
}
