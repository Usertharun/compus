import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { EventStatus, RsvpStatus } from "@prisma/client";
import { PrismaService } from "@database/prisma.service";
import { EventsRepository } from "./repositories/events.repository";
import {
  AddEventCommentDto,
  ChangeEventStatusDto,
  CreateEventDto,
  SearchEventsDto,
  UpdateEventDto,
} from "./dto/events.dto";
import { PaginatedResponseDto, PaginationQueryDto } from "@common/dto/pagination.dto";
import { AppLoggerService } from "@logger/logger.service";
import { AnalyticsService } from "@modules/analytics/analytics.service";
import { PRODUCT_EVENTS } from "@modules/analytics/analytics.events";

@Injectable()
export class EventsService {
  async organized(userId: string, dto: PaginationQueryDto) {
    const page = dto.page || 1, limit = dto.limit || 20;
    const where = { organizerId: userId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.event.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], include: { organizer: { select: { id: true, profile: { select: { name: true } } } } } }),
      this.prisma.event.count({ where }),
    ]);
    return new PaginatedResponseDto(items, total, page, limit);
  }
  async registrations(userId: string, dto: PaginationQueryDto) {
    const page = dto.page || 1, limit = dto.limit || 20;
    const where = { userId, status: { in: [RsvpStatus.GOING, RsvpStatus.WAITLISTED] }, event: { deletedAt: null } };
    const [rows, total] = await Promise.all([
      this.prisma.eventRsvp.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], include: { event: { include: { organizer: { select: { id: true, profile: { select: { name: true } } } } } } } }),
      this.prisma.eventRsvp.count({ where }),
    ]);
    return new PaginatedResponseDto(rows.map(r => ({ ...r.event, userRsvpStatus: r.status })), total, page, limit);
  }

  private async organizer(userId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({ where: { id: eventId, deletedAt: null } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== userId) throw new ForbiddenException('Only the organizer can manage attendance');
    return event;
  }

  async attendees(userId: string, eventId: string, dto: PaginationQueryDto) {
    await this.organizer(userId, eventId);
    const page = dto.page || 1, limit = dto.limit || 20;
    const where = { eventId, status: { in: [RsvpStatus.GOING, RsvpStatus.WAITLISTED] } };
    const [items, total] = await Promise.all([
      this.prisma.eventRsvp.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { userId: true, status: true, checkedIn: true, user: { select: { profile: { select: { name: true } } } } } }),
      this.prisma.eventRsvp.count({ where }),
    ]);
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async attendance(userId: string, eventId: string, attendeeId: string, checkedIn: boolean) {
    const event = await this.organizer(userId, eventId);
    if (event.status === EventStatus.CANCELLED) throw new BadRequestException('Cancelled events cannot record attendance');
    const changed = await this.prisma.eventRsvp.updateMany({ where: { eventId, userId: attendeeId, status: RsvpStatus.GOING }, data: { checkedIn } });
    if (changed.count !== 1) throw new BadRequestException('Only confirmed registrations can be checked in');
    return { success: true };
  }
  private async assertCanView(event: { organizerId: string; status: EventStatus; visibility: string; communityId: string | null }, viewerId?: string) {
    if (event.organizerId === viewerId) return;
    if (event.status === EventStatus.DRAFT) throw new ForbiddenException('This event has not been published.');
    if (event.visibility === 'COMMUNITY_ONLY') {
      const member = viewerId && event.communityId ? await this.prisma.communityMember.findUnique({ where: { communityId_userId: { communityId: event.communityId, userId: viewerId } } }) : null;
      if (!member) throw new ForbiddenException('Join the hosting community to access this event.');
    }
  }
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    @Optional() private readonly analytics?: AnalyticsService,
  ) {}

  async createEvent(userId: string, dto: CreateEventDto) {
    if (new Date(dto.startTime) >= new Date(dto.endTime)) {
      throw new BadRequestException("Event end time must be after start time");
    }

    if (dto.communityId) {
      const community = await this.prisma.community.findFirst({
        where: { id: dto.communityId, deletedAt: null },
      });
      if (!community)
        throw new NotFoundException("Hosting community not found");
      const member = await this.prisma.communityMember.findUnique({ where: { communityId_userId: { communityId: dto.communityId, userId } } });
      if (!member || !['OWNER', 'MODERATOR'].includes(member.role)) throw new ForbiddenException('Only community owners and moderators can host events for this community.');
    }
    if (dto.visibility === 'COMMUNITY_ONLY' && !dto.communityId) throw new BadRequestException('Community events require a hosting community.');

    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        shortDescription: dto.shortDescription,
        description: dto.description,
        category: dto.category || "Workshop",
        bannerUrl: dto.bannerUrl,
        coverImageUrl: dto.coverImageUrl,
        venue: dto.venue,
        building: dto.building,
        room: dto.room,
        isOnline: dto.isOnline || false,
        meetingUrl: dto.meetingUrl,
        startTime: dto.startTime,
        endTime: dto.endTime,
        registrationDeadline: dto.registrationDeadline,
        capacity: dto.capacity,
        visibility: dto.visibility || "PUBLIC_CAMPUS",
        tags: dto.tags || [],
        organizerId: userId,
        communityId: dto.communityId,
        status: EventStatus.DRAFT,
        media:
          dto.media && dto.media.length > 0
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

    this.logger.log(
      `Created new event '${event.title}' (${event.id}) by organizer: ${userId}`,
      "EventsService",
    );

    return this.eventsRepository.findEventById(event.id);
  }

  async getEventDetails(eventId: string, viewerId?: string) {
    const event = await this.eventsRepository.findEventById(eventId);

    if (!event) {
      throw new NotFoundException(`Event '${eventId}' not found`);
    }
    await this.assertCanView(event, viewerId);

    let userRsvpStatus: RsvpStatus | null = null;
    let isBookmarked = false;

    if (viewerId) {
      const [rsvp, bookmark] = await Promise.all([
        this.prisma.eventRsvp.findUnique({
          where: { eventId_userId: { eventId, userId: viewerId } },
        }),
        this.prisma.bookmark.findUnique({
          where: {
            userId_targetType_targetId: {
              userId: viewerId,
              targetType: "EVENT",
              targetId: eventId,
            },
          },
        }),
      ]);

      userRsvpStatus = rsvp?.status || null;
      isBookmarked = !!bookmark;
    }

    const isFull = event.capacity ? event.rsvpCount >= event.capacity : false;

    return {
      ...event,
      userRsvpStatus,
      isBookmarked,
      isFull,
    };
  }

  async updateEvent(userId: string, eventId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) throw new NotFoundException("Event not found");
    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        "Only the Event Organizer can update this event",
      );
    }

    if ((dto.startTime || event.startTime) >= (dto.endTime || event.endTime)) throw new BadRequestException('Event end time must be after start time');
    if (dto.capacity !== undefined && (dto.capacity < 1 || dto.capacity < event.rsvpCount)) throw new BadRequestException('Capacity must be positive and accommodate confirmed registrations');
    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.shortDescription !== undefined && {
          shortDescription: dto.shortDescription,
        }),
        ...(dto.description && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
        ...(dto.coverImageUrl !== undefined && {
          coverImageUrl: dto.coverImageUrl,
        }),
        ...(dto.venue && { venue: dto.venue }),
        ...(dto.building !== undefined && { building: dto.building }),
        ...(dto.room !== undefined && { room: dto.room }),
        ...(dto.isOnline !== undefined && { isOnline: dto.isOnline }),
        ...(dto.meetingUrl !== undefined && { meetingUrl: dto.meetingUrl }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.registrationDeadline !== undefined && {
          registrationDeadline: dto.registrationDeadline,
        }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.visibility && { visibility: dto.visibility }),
        ...(dto.tags && { tags: dto.tags }),
      },
    });

    return this.eventsRepository.findEventById(updated.id);
  }

  async changeEventStatus(
    userId: string,
    eventId: string,
    dto: ChangeEventStatusDto,
  ) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) throw new NotFoundException("Event not found");
    if (event.organizerId !== userId) {
      throw new ForbiddenException(
        "Only the Event Organizer can change status",
      );
    }

    const fromStatus = event.status;
    const toStatus = dto.status;
    const transitions: Record<EventStatus, EventStatus[]> = {
      DRAFT: [EventStatus.PUBLISHED, EventStatus.REGISTRATION_OPEN, EventStatus.CANCELLED],
      PUBLISHED: [EventStatus.REGISTRATION_OPEN, EventStatus.CANCELLED],
      REGISTRATION_OPEN: [EventStatus.REGISTRATION_CLOSED, EventStatus.ONGOING, EventStatus.CANCELLED],
      REGISTRATION_CLOSED: [EventStatus.REGISTRATION_OPEN, EventStatus.ONGOING, EventStatus.CANCELLED],
      ONGOING: [EventStatus.COMPLETED, EventStatus.CANCELLED],
      COMPLETED: [], CANCELLED: [],
    };
    if (!transitions[fromStatus].includes(toStatus)) throw new BadRequestException('This event status change is not allowed');

    await this.prisma.$transaction(async tx => {
      const changed = await tx.event.updateMany({ where: { id: eventId, status: fromStatus, deletedAt: null }, data: { status: toStatus } });
      if (!changed.count) throw new ConflictException('Event changed. Refresh and try again');
      await tx.eventStatusHistory.create({ data: { eventId, fromStatus, toStatus, changedById: userId, reason: dto.reason } });
      if (toStatus === EventStatus.CANCELLED) {
        const registrations = await tx.eventRsvp.findMany({ where: { eventId, status: { in: [RsvpStatus.GOING, RsvpStatus.WAITLISTED] } }, select: { userId: true } });
        if (registrations.length) await tx.notification.createMany({ data: registrations.map(r => ({ userId: r.userId, type: 'EVENT_CANCELLED', category: 'EVENTS', title: 'Event cancelled', body: event.title + ' has been cancelled by its organizer.', link: '/events' })) });
      }
    });

    this.logger.log(
      `Event ${eventId} status changed from ${fromStatus} to ${toStatus}`,
      "EventsService",
    );

    return this.eventsRepository.findEventById(eventId);
  }

  async deleteEvent(userId: string, eventId: string, userRole?: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) throw new NotFoundException("Event not found");
    if (event.organizerId !== userId && userRole !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "Only Event Organizer or Super Admin can delete this event",
      );
    }

    await this.prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date(), status: EventStatus.CANCELLED },
    });

    return { message: "Event deleted successfully" };
  }

  // --- REGISTRATION & WAITLIST ENGINE ---

  async registerEvent(userId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) throw new NotFoundException("Event not found");
    await this.assertCanView(event, userId);

    if (
      event.status !== EventStatus.REGISTRATION_OPEN ||
      event.startTime <= new Date()
    )
      throw new BadRequestException("Registration is not open for this event.");

    if (
      event.registrationDeadline &&
      new Date() > new Date(event.registrationDeadline)
    ) {
      throw new BadRequestException("Event registration deadline has passed.");
    }

    const existing = await this.prisma.eventRsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existing && existing.status !== RsvpStatus.CANCELLED) {
      throw new ConflictException(
        `You are already registered for this event (${existing.status}).`,
      );
    }

    let targetStatus: RsvpStatus = RsvpStatus.GOING;

    if (event.capacity && event.rsvpCount >= event.capacity) {
      targetStatus = RsvpStatus.WAITLISTED;
    }

    const rsvp = await this.eventsRepository.registerUser(
      eventId,
      userId,
      targetStatus,
    );
    await this.analytics?.record(userId, PRODUCT_EVENTS.EVENT_REGISTERED, {
      eventId,
      status: rsvp.status,
    });
    const message =
      rsvp.status === RsvpStatus.WAITLISTED
        ? "Event capacity is full. You have been added to the waitlist."
        : "Successfully registered for event.";

    return { success: true, message, rsvp };
  }

  async cancelRegistration(userId: string, eventId: string) {
    const previousRsvp = await this.eventsRepository.cancelRegistration(
      eventId,
      userId,
    );

    if (!previousRsvp) {
      throw new NotFoundException(
        "You do not have an active registration for this event.",
      );
    }

    return {
      success: true,
      message: "Event registration cancelled.",
      promotedCandidateId: previousRsvp.promotedUserId,
    };
  }

  // --- DISCOVERY & SEARCH ---

  async browseEvents(dto: SearchEventsDto, viewerId?: string) {
    const { items, total, page, limit } =
      await this.eventsRepository.searchEvents(dto);
    const rsvps = viewerId
      ? await this.prisma.eventRsvp.findMany({
          where: { userId: viewerId, eventId: { in: items.map((i) => i.id) } },
          select: { eventId: true, status: true },
        })
      : [];
    return new PaginatedResponseDto(
      items.map((i) => ({
        ...i,
        userRsvpStatus: rsvps.find((r) => r.eventId === i.id)?.status || null,
      })),
      total,
      page,
      limit,
    );
  }

  async getUpcomingEvents() {
    return this.eventsRepository.findUpcomingEvents(10);
  }

  async getOngoingEvents() {
    return this.eventsRepository.findOngoingEvents(10);
  }

  async getCategories() {
    const categories = await this.prisma.event.groupBy({
      by: ["category"],
      where: { deletedAt: null },
      _count: { category: true },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }

  // --- COMMENTS & REPLIES ---

  async addComment(eventId: string, userId: string, dto: AddEventCommentDto) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });
    if (!event) throw new NotFoundException("Event not found");

    return this.prisma.eventComment.create({
      data: {
        eventId,
        authorId: userId,
        content: dto.content,
        parentId: dto.parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: { name: true, username: true, avatarUrl: true },
            },
          },
        },
      },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.eventComment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== userId)
      throw new ForbiddenException("Cannot delete comment");

    await this.prisma.eventComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: "Comment deleted successfully" };
  }

  // --- BOOKMARKS ---

  async bookmarkEvent(eventId: string, userId: string) {
    await this.eventsRepository.addBookmark(eventId, userId);
    return { success: true, message: "Event saved to bookmarks" };
  }

  async removeBookmark(eventId: string, userId: string) {
    await this.eventsRepository.removeBookmark(eventId, userId);
    return { success: true, message: "Event removed from bookmarks" };
  }

  async getUserBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId, targetType: "EVENT" },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                profile: { select: { name: true, username: true } },
              },
            },
          },
        },
      },
    });

    return bookmarks.map((b) => b.event).filter(Boolean);
  }
}
