import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CompleteOnboardingDto, UpdateProfileDto, UpdateUserDto } from './dto/users.dto';
import { PrismaService } from '@database/prisma.service';
import { PaginatedResponseDto, PaginationQueryDto } from '@common/dto/pagination.dto';
import { AppLoggerService } from '@logger/logger.service';
import { User } from '@prisma/client';
import { AnalyticsService } from '@modules/analytics/analytics.service';
import { PRODUCT_EVENTS } from '@modules/analytics/analytics.events';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: AppLoggerService,
    private readonly prisma: PrismaService,
    @Optional() private readonly analytics?: AnalyticsService,
  ) {}

  private sanitizeUser(user: User) {
    const userObj = { ...user };
    delete (userObj as Record<string, unknown>).passwordHash;
    return userObj;
  }

  async getCampusHub(userId: string) {
    const now = new Date();
    const [profile, notifications, unreadCount, registrations, applications, saved] =
      await Promise.all([
        this.prisma.profile.findUnique({
          where: { userId },
          select: { name: true },
        }),
        this.prisma.notification.findMany({
          where: {
            userId,
            isRead: false,
            isArchived: false,
            deletedAt: null,
          },
          orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          take: 5,
          select: {
            id: true,
            title: true,
            body: true,
            link: true,
            category: true,
            priority: true,
            createdAt: true,
          },
        }),
        this.prisma.notification.count({
          where: {
            userId,
            isRead: false,
            isArchived: false,
            deletedAt: null,
          },
        }),
        this.prisma.eventRsvp.findMany({
          where: {
            userId,
            status: { in: ['GOING', 'WAITLISTED'] },
            event: {
              deletedAt: null,
              startTime: { gte: now },
              status: { not: 'CANCELLED' },
            },
          },
          orderBy: { event: { startTime: 'asc' } },
          take: 5,
          select: {
            status: true,
            event: {
              select: {
                id: true,
                title: true,
                venue: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        }),
        this.prisma.opportunityApplication.findMany({
          where: { userId, opportunity: { deletedAt: null } },
          orderBy: { appliedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            appliedAt: true,
            opportunity: {
              select: {
                id: true,
                title: true,
                companyName: true,
                deadline: true,
              },
            },
          },
        }),
        this.prisma.bookmark.findMany({
          where: {
            userId,
            targetType: 'OPPORTUNITY',
            opportunity: {
              deletedAt: null,
              status: 'OPEN',
              OR: [{ deadline: null }, { deadline: { gte: now } }],
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            opportunity: {
              select: {
                id: true,
                title: true,
                companyName: true,
                deadline: true,
              },
            },
          },
        }),
      ]);

    return {
      generatedAt: now,
      firstName: profile?.name?.trim().split(/\s+/)[0] || 'Student',
      unreadCount,
      notifications,
      upcomingEvents: registrations.map(({ event, status }) => ({
        ...event,
        registrationStatus: status,
      })),
      applications: applications.map(({ opportunity, ...application }) => ({
        ...application,
        opportunity,
      })),
      savedOpportunities: saved
        .filter((bookmark) => bookmark.opportunity)
        .map(({ opportunity, ...bookmark }) => ({ ...bookmark, opportunity })),
    };
  }

  async findAll(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const { items, total } = await this.usersRepository.searchUsers(query.search || '', skip, limit);

    const sanitizedItems = items.map((u) => this.sanitizeUser(u));

    return new PaginatedResponseDto(sanitizedItems, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findByIdWithProfile(id);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' was not found`);
    }

    return this.sanitizeUser(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const updated = await this.usersRepository.update(id, { ...dto });
    this.logger.log(`Updated user info for ID: ${id}`, 'UsersService');

    return this.sanitizeUser(updated);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.findOne(userId);

    const profile = await this.usersRepository.updateProfile(userId, { ...dto });
    this.logger.log(`Updated profile info for user ID: ${userId}`, 'UsersService');

    return profile;
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    const labels: Record<string, string> = { mentors: 'Find Mentors', clubs: 'Join Student Orgs', jobs: 'Discover Internships', hackathons: 'Hackathons', study: 'Study Partners' };
    const result = await this.prisma.$transaction(async tx => {
      const profile = await tx.profile.update({ where: { userId }, data: { name: dto.name, department: dto.department, year: dto.year } });
      // Only replace onboarding interests, preserving unrelated profile interests.
      await tx.userInterest.deleteMany({ where: { profileId: profile.id, interest: { name: { in: Object.values(labels) } } } });
      for (const goal of dto.goals) {
        const interest = await tx.interest.upsert({ where: { name: labels[goal] }, update: {}, create: { name: labels[goal] } });
        await tx.userInterest.create({ data: { profileId: profile.id, interestId: interest.id } });
      }
      const user = await tx.user.update({ where: { id: userId }, data: { onboardingCompleted: true }, include: { profile: true } });
      return { id: user.id, email: user.email, role: user.role, name: profile.name, onboardingCompleted: user.onboardingCompleted, profile: user.profile };
    }, { maxWait: 10000, timeout: 20000 });
    await this.analytics?.record(userId, PRODUCT_EVENTS.ONBOARDING_COMPLETED);
    return result;
  }
}
