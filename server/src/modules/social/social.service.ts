import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async followUser(followerId: string, targetUserId: string) {
    if (followerId === targetUserId) {
      throw new BadRequestException('You cannot follow your own account');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || !targetUser.isActive) {
      throw new NotFoundException('Target student user not found');
    }

    const existing = await this.prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You are already following this student');
    }

    const record = await this.prisma.follower.create({
      data: {
        followerId,
        followingId: targetUserId,
      },
    });

    this.logger.log(`User ${followerId} followed target ${targetUserId}`, 'SocialService');

    return { success: true, message: 'Successfully followed student', record };
  }

  async unfollowUser(followerId: string, targetUserId: string) {
    const existing = await this.prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('You are not following this student');
    }

    await this.prisma.follower.delete({
      where: { id: existing.id },
    });

    this.logger.log(`User ${followerId} unfollowed target ${targetUserId}`, 'SocialService');

    return { success: true, message: 'Successfully unfollowed student' };
  }

  async getFollowers(userId: string) {
    const records = await this.prisma.follower.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                name: true,
                username: true,
                avatarUrl: true,
                department: true,
                year: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => r.follower);
  }

  async getFollowing(userId: string) {
    const records = await this.prisma.follower.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                name: true,
                username: true,
                avatarUrl: true,
                department: true,
                year: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => r.following);
  }

  async getMutualConnections(activeUserId: string, targetUserId: string) {
    if (activeUserId === targetUserId) {
      return [];
    }

    // Active user's following list
    const activeFollowing = await this.prisma.follower.findMany({
      where: { followerId: activeUserId },
      select: { followingId: true },
    });

    const activeFollowingSet = new Set(activeFollowing.map((f) => f.followingId));

    // Target user's following list
    const targetFollowing = await this.prisma.follower.findMany({
      where: { followerId: targetUserId },
      include: {
        following: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                username: true,
                avatarUrl: true,
                department: true,
              },
            },
          },
        },
      },
    });

    // Intersection
    const mutuals = targetFollowing
      .filter((tf) => activeFollowingSet.has(tf.followingId))
      .map((tf) => tf.following);

    return mutuals;
  }
}
