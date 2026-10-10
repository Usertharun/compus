import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { AppLoggerService } from '@logger/logger.service';
import { ACTIVATION_EVENTS, PRODUCT_EVENTS, ProductEvent } from './analytics.events';

type ActivityRow = { userId: string; eventType: string; createdAt: Date };

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async record(userId: string, eventType: ProductEvent, metadata?: Prisma.InputJsonValue) {
    try {
      await this.prisma.activityLog.create({
        data: { userId, eventType, ...(metadata === undefined ? {} : { metadata }) },
      });
    } catch {
      // Product analytics must never make a completed user action fail.
      this.logger.warn(`Unable to record product event ${eventType}`, 'AnalyticsService');
    }
  }

  async recordDailySession(userId: string) {
    const start = this.startOfUtcDay(new Date());
    try {
      const existing = await this.prisma.activityLog.findFirst({
        where: {
          userId,
          eventType: PRODUCT_EVENTS.SESSION_ACTIVE,
          createdAt: { gte: start },
        },
        select: { id: true },
      });
      if (!existing) await this.record(userId, PRODUCT_EVENTS.SESSION_ACTIVE);
      return { recorded: !existing, date: start.toISOString().slice(0, 10) };
    } catch {
      this.logger.warn('Unable to record daily product session', 'AnalyticsService');
      return { recorded: false, date: start.toISOString().slice(0, 10) };
    }
  }

  async getProductOverview() {
    const now = new Date();
    const dayStart = this.startOfUtcDay(now);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);
    const trendStart = this.startOfUtcDay(new Date(now.getTime() - 13 * 86400000));
    const studentWhere = { role: UserRole.VERIFIED_USER, deletedAt: null } as const;

    const [
      totalStudents,
      onboardedStudents,
      newStudents7d,
      newStudents30d,
      dailyUsers,
      weeklyUsers,
      monthlyUsers,
      trackingStart,
      recentActivity,
      trackedStudents,
    ] = await Promise.all([
      this.prisma.user.count({ where: studentWhere }),
      this.prisma.user.count({ where: { ...studentWhere, onboardingCompleted: true } }),
      this.prisma.user.count({ where: { ...studentWhere, createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.user.count({ where: { ...studentWhere, createdAt: { gte: thirtyDaysAgo } } }),
      this.activeUsersSince(dayStart),
      this.activeUsersSince(sevenDaysAgo),
      this.activeUsersSince(thirtyDaysAgo),
      this.prisma.activityLog.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
      this.prisma.activityLog.findMany({
        where: { createdAt: { gte: ninetyDaysAgo }, user: studentWhere },
        select: { userId: true, eventType: true, createdAt: true },
      }),
      this.prisma.user.findMany({
        where: { ...studentWhere, createdAt: { gte: ninetyDaysAgo } },
        select: { id: true, createdAt: true },
      }),
    ]);

    const trendActivity = recentActivity.filter((row) => row.createdAt >= trendStart);
    const eventUsers = new Map<string, Set<string>>();
    for (const activity of trendActivity) {
      if (!eventUsers.has(activity.eventType)) eventUsers.set(activity.eventType, new Set());
      eventUsers.get(activity.eventType)!.add(activity.userId);
    }
    const registeredIds = eventUsers.get(PRODUCT_EVENTS.ACCOUNT_REGISTERED) || new Set<string>();
    const onboardedIds = eventUsers.get(PRODUCT_EVENTS.ONBOARDING_COMPLETED) || new Set<string>();
    const valueActionIds = new Set(
      trendActivity
        .filter((row) => ACTIVATION_EVENTS.includes(row.eventType as ProductEvent))
        .map((row) => row.userId),
    );
    const onboardedNewUsers = [...registeredIds].filter((id) => onboardedIds.has(id)).length;
    const activatedNewUsers = [...registeredIds].filter((id) => valueActionIds.has(id)).length;

    const trend = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(trendStart.getTime() + index * 86400000);
      const key = date.toISOString().slice(0, 10);
      const activeUsers = new Set(
        trendActivity
          .filter((row) => row.createdAt.toISOString().slice(0, 10) === key)
          .map((row) => row.userId),
      ).size;
      const registrations = trackedStudents.filter(
        (user) => user.createdAt.toISOString().slice(0, 10) === key,
      ).length;
      return { date: key, activeUsers, registrations };
    });

    const dataSince = trackingStart?.createdAt || null;
    return {
      generatedAt: now,
      dataSince,
      audience: {
        totalStudents,
        onboardedStudents,
        onboardingRate: this.percent(onboardedStudents, totalStudents),
        newStudents7d,
        newStudents30d,
      },
      activity: {
        dailyActiveUsers: dailyUsers,
        weeklyActiveUsers: weeklyUsers,
        monthlyActiveUsers: monthlyUsers,
        stickiness: this.percent(dailyUsers, monthlyUsers),
      },
      activation: {
        registered: registeredIds.size,
        onboarded: onboardedNewUsers,
        activated: activatedNewUsers,
        onboardingConversion: this.percent(onboardedNewUsers, registeredIds.size),
        activationConversion: this.percent(activatedNewUsers, registeredIds.size),
      },
      actions: ACTIVATION_EVENTS.map((eventType) => ({
        eventType,
        users: eventUsers.get(eventType)?.size || 0,
        events: trendActivity.filter((row) => row.eventType === eventType).length,
      })),
      retention: {
        day7: this.retentionFor(7, dataSince, now, trackedStudents, recentActivity),
        day28: this.retentionFor(28, dataSince, now, trackedStudents, recentActivity),
      },
      trend,
    };
  }

  private async activeUsersSince(since: Date) {
    const rows = await this.prisma.activityLog.findMany({
      where: {
        createdAt: { gte: since },
        user: { role: UserRole.VERIFIED_USER, deletedAt: null },
      },
      distinct: ['userId'],
      select: { userId: true },
    });
    return rows.length;
  }

  private retentionFor(
    days: number,
    dataSince: Date | null,
    now: Date,
    users: { id: string; createdAt: Date }[],
    activity: ActivityRow[],
  ) {
    if (!dataSince || now.getTime() - dataSince.getTime() < days * 86400000) {
      return { rate: null, eligibleUsers: 0, retainedUsers: 0, status: 'COLLECTING' };
    }
    const eligible = users.filter(
      (user) =>
        user.createdAt >= dataSince &&
        now.getTime() - user.createdAt.getTime() >= days * 86400000,
    );
    const retained = eligible.filter((user) =>
      activity.some(
        (row) =>
          row.userId === user.id &&
          row.createdAt.getTime() >= user.createdAt.getTime() + days * 86400000,
      ),
    );
    return {
      rate: this.percent(retained.length, eligible.length),
      eligibleUsers: eligible.length,
      retainedUsers: retained.length,
      status: eligible.length ? 'READY' : 'COLLECTING',
    };
  }

  private startOfUtcDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private percent(value: number, total: number) {
    return total ? Math.round((value / total) * 1000) / 10 : 0;
  }
}
