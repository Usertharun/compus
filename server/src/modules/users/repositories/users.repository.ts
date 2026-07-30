import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { BaseAbstractRepository } from '@common/repositories/base.repository';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class UsersRepository extends BaseAbstractRepository<User> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
  }

  async findByIdWithProfile(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async updateProfile(userId: string, profileData: Record<string, unknown>) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: {
        userId,
        name: (profileData.name as string) || 'User',
        ...profileData,
      },
    });
  }

  async searchUsers(query: string, skip = 0, take = 10) {
    const whereCondition = query
      ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' as const } },
            { profile: { name: { contains: query, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        skip,
        take,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereCondition }),
    ]);

    return { items, total };
  }
}
