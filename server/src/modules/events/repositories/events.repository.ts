import { Injectable } from '@nestjs/common';
import { Event, EventStatus, RsvpStatus } from '@prisma/client';
import { BaseAbstractRepository } from '@common/repositories/base.repository';
import { PrismaService } from '@database/prisma.service';
import { SearchEventsDto } from '../dto/events.dto';

@Injectable()
export class EventsRepository extends BaseAbstractRepository<Event> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.event);
  }

  private eventIncludeSelect() {
    return {
      organizer: {
        select: {
          id: true,
          email: true,
          profile: { select: { name: true, username: true, avatarUrl: true } },
        },
      },
      community: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
        },
      },
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

  async findEventById(id: string) {
    return this.prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: this.eventIncludeSelect(),
    });
  }

  async searchEvents(dto: SearchEventsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const skip = (page - 1) * limit;

    const whereConditions: Record<string, unknown>[] = [{ deletedAt: null }];

    if (dto.search) {
      const q = dto.search;
      whereConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { venue: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (dto.category) {
      whereConditions.push({ category: { contains: dto.category, mode: 'insensitive' } });
    }

    if (dto.communityId) {
      whereConditions.push({ communityId: dto.communityId });
    }

    if (dto.tag) {
      whereConditions.push({ tags: { has: dto.tag } });
    }

    if (dto.status) {
      whereConditions.push({ status: dto.status });
    }

    const where = { AND: whereConditions };

    const [items, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: this.eventIncludeSelect(),
      }),
      this.prisma.event.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findUpcomingEvents(limit = 10) {
    return this.prisma.event.findMany({
      where: {
        deletedAt: null,
        startTime: { gte: new Date() },
        status: { in: [EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN] },
      },
      take: limit,
      orderBy: { startTime: 'asc' },
      include: this.eventIncludeSelect(),
    });
  }

  async findOngoingEvents(limit = 10) {
    const now = new Date();
    return this.prisma.event.findMany({
      where: {
        deletedAt: null,
        startTime: { lte: now },
        endTime: { gte: now },
        status: { not: EventStatus.CANCELLED },
      },
      take: limit,
      orderBy: { startTime: 'asc' },
      include: this.eventIncludeSelect(),
    });
  }

  async registerUser(eventId: string, userId: string, status: RsvpStatus) {
    return this.prisma.$transaction(async (tx) => {
      const rsvp = await tx.eventRsvp.upsert({
        where: { eventId_userId: { eventId, userId } },
        update: { status },
        create: { eventId, userId, status },
      });

      if (status === RsvpStatus.GOING) {
        await tx.event.update({
          where: { id: eventId },
          data: { rsvpCount: { increment: 1 } },
        });
      } else if (status === RsvpStatus.WAITLISTED) {
        await tx.event.update({
          where: { id: eventId },
          data: { waitlistCount: { increment: 1 } },
        });
      }

      return rsvp;
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    const existing = await this.prisma.eventRsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!existing) return null;

    await this.prisma.$transaction(async (tx) => {
      await tx.eventRsvp.delete({ where: { id: existing.id } });

      if (existing.status === RsvpStatus.GOING) {
        await tx.event.update({
          where: { id: eventId },
          data: { rsvpCount: { decrement: 1 } },
        });
      } else if (existing.status === RsvpStatus.WAITLISTED) {
        await tx.event.update({
          where: { id: eventId },
          data: { waitlistCount: { decrement: 1 } },
        });
      }
    });

    return existing;
  }

  async promoteNextWaitlisted(eventId: string) {
    const nextWaitlisted = await this.prisma.eventRsvp.findFirst({
      where: { eventId, status: RsvpStatus.WAITLISTED },
      orderBy: { createdAt: 'asc' },
    });

    if (!nextWaitlisted) return null;

    await this.prisma.$transaction([
      this.prisma.eventRsvp.update({
        where: { id: nextWaitlisted.id },
        data: { status: RsvpStatus.GOING },
      }),
      this.prisma.event.update({
        where: { id: eventId },
        data: {
          rsvpCount: { increment: 1 },
          waitlistCount: { decrement: 1 },
        },
      }),
    ]);

    return nextWaitlisted;
  }

  async addBookmark(eventId: string, userId: string) {
    return this.prisma.bookmark.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: 'EVENT',
          targetId: eventId,
        },
      },
      update: {},
      create: {
        userId,
        targetType: 'EVENT',
        targetId: eventId,
        eventId,
      },
    });
  }

  async removeBookmark(eventId: string, userId: string) {
    await this.prisma.bookmark.deleteMany({
      where: { userId, targetType: 'EVENT', targetId: eventId },
    });
  }

  async recordStatusChange(
    eventId: string,
    fromStatus: EventStatus,
    toStatus: EventStatus,
    changedById: string,
    reason?: string,
  ) {
    await this.prisma.eventStatusHistory.create({
      data: {
        eventId,
        fromStatus,
        toStatus,
        changedById,
        reason,
      },
    });
  }
}
