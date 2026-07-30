import { Injectable } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { BaseAbstractRepository } from '@common/repositories/base.repository';
import { PrismaService } from '@database/prisma.service';
import { SearchStudentsDto } from '../dto/profile.dto';

@Injectable()
export class ProfileRepository extends BaseAbstractRepository<Profile> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.profile);
  }

  async findByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
          },
        },
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        projects: { orderBy: { startDate: 'desc' } },
        achievements: { orderBy: { dateAwarded: 'desc' } },
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
          },
        },
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        projects: { orderBy: { startDate: 'desc' } },
        achievements: { orderBy: { dateAwarded: 'desc' } },
      },
    });
  }

  async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const existing = await this.prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!existing) return true;
    if (currentUserId && existing.userId === currentUserId) return true;
    return false;
  }

  async searchProfiles(dto: SearchStudentsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const whereConditions: Record<string, unknown>[] = [];

    if (dto.search) {
      const q = dto.search;
      whereConditions.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { department: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (dto.department) {
      whereConditions.push({ department: { contains: dto.department, mode: 'insensitive' } });
    }

    if (dto.year) {
      whereConditions.push({ year: { contains: dto.year, mode: 'insensitive' } });
    }

    if (dto.skill) {
      whereConditions.push({
        skills: {
          some: {
            skill: {
              name: { equals: dto.skill, mode: 'insensitive' },
            },
          },
        },
      });
    }

    if (dto.interest) {
      whereConditions.push({
        interests: {
          some: {
            interest: {
              name: { equals: dto.interest, mode: 'insensitive' },
            },
          },
        },
      });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [items, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, role: true },
          },
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async incrementViewCount(profileId: string, viewerId?: string, ipAddress?: string) {
    await Promise.all([
      this.prisma.profile.update({
        where: { id: profileId },
        data: { viewCount: { increment: 1 } },
      }),
      this.prisma.profileView.create({
        data: {
          profileId,
          viewerId,
          ipAddress,
        },
      }),
    ]);
  }

  async getProfileMetrics(userId: string, profileId: string) {
    const [followersCount, followingCount, postsCount, communitiesCount, eventsCount, viewsCount] =
      await Promise.all([
        this.prisma.follower.count({ where: { followingId: userId } }),
        this.prisma.follower.count({ where: { followerId: userId } }),
        this.prisma.post.count({ where: { authorId: userId } }),
        this.prisma.communityMember.count({ where: { userId } }),
        this.prisma.eventRsvp.count({ where: { userId } }),
        this.prisma.profileView.count({ where: { profileId } }),
      ]);

    return {
      followersCount,
      followingCount,
      postsCount,
      communitiesCount,
      eventsCount,
      viewsCount,
    };
  }
}
