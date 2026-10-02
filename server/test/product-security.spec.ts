import { ForbiddenException } from "@nestjs/common";
import { FeedService } from "../src/modules/feed/feed.service";
import { MessagingService } from "../src/modules/messaging/messaging.service";
import { NotificationsService } from "../src/modules/notifications/notifications.service";
import { ProfileService } from "../src/modules/profile/profile.service";
import { OpportunitiesService } from "../src/modules/opportunities/opportunities.service";
import { EventsService } from '../src/modules/events/events.service';
const logger = { log: jest.fn() } as any;
describe("Real service access boundaries", () => {
  it('does not reveal unpublished events to another student', async () => {
    const repo = { findEventById: jest.fn().mockResolvedValue({ organizerId: 'owner', status: 'DRAFT', visibility: 'PUBLIC_CAMPUS', communityId: null }) } as any;
    await expect(new EventsService(repo, {} as any, logger).getEventDetails('event', 'student')).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('blocks registration by nonmembers of a private community event', async () => {
    const repo = { registerUser: jest.fn() } as any;
    const prisma = { event: { findFirst: jest.fn().mockResolvedValue({ organizerId: 'owner', status: 'REGISTRATION_OPEN', visibility: 'COMMUNITY_ONLY', communityId: 'private' }) }, communityMember: { findUnique: jest.fn().mockResolvedValue(null) } } as any;
    await expect(new EventsService(repo, prisma, logger).registerEvent('student', 'event')).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.registerUser).not.toHaveBeenCalled();
  });
  it.each(["likePost", "bookmarkPost", "addComment"])(
    "blocks %s on another student private draft",
    async (method) => {
      const repository = { likePost: jest.fn(), addBookmark: jest.fn() } as any;
      const prisma = {
        post: {
          findFirst: jest
            .fn()
            .mockResolvedValue({
              id: "p",
              authorId: "owner",
              visibility: "PRIVATE_DRAFT",
            }),
        },
      } as any;
      const service = new FeedService(repository, prisma, logger);
      await expect(
        (service as any)[method]("p", "intruder", { content: "hello" }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(repository.likePost).not.toHaveBeenCalled();
      expect(repository.addBookmark).not.toHaveBeenCalled();
    },
  );
  it("blocks nonmembers from private community post details", async () => {
    const repository = {
      findPostById: jest
        .fn()
        .mockResolvedValue({
          authorId: "a",
          visibility: "COMMUNITY_ONLY",
          communityId: "c",
        }),
    } as any;
    const prisma = {
      communityMember: { findUnique: jest.fn().mockResolvedValue(null) },
    } as any;
    await expect(
      new FeedService(repository, prisma, logger).getPostDetails(
        "p",
        "outsider",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it.each(["markRead", "addReaction"])(
    "blocks %s outside a conversation",
    async (method) => {
      const repo = {
        isParticipant: jest.fn().mockResolvedValue(false),
        markMessageRead: jest.fn(),
        addReaction: jest.fn(),
      } as any;
      const prisma = {
        message: {
          findFirst: jest.fn().mockResolvedValue({ conversationId: "private" }),
        },
      } as any;
      await expect(
        (new MessagingService(repo, prisma, logger) as any)[method](
          "outsider",
          "message",
          { emoji: "👍" },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.markMessageRead).not.toHaveBeenCalled();
      expect(repo.addReaction).not.toHaveBeenCalled();
    },
  );
  it("honors direct-message opt-out for existing conversations", async () => {
    const repo = {
      isParticipant: jest.fn().mockResolvedValue(true),
      findConversationById: jest
        .fn()
        .mockResolvedValue({
          type: "ONE_TO_ONE",
          participants: [{ userId: "a" }, { userId: "b" }],
        }),
      createMessage: jest.fn(),
    } as any;
    const prisma = {
      profile: { count: jest.fn().mockResolvedValue(1) },
    } as any;
    await expect(
      new MessagingService(repo, prisma, logger).sendMessage("a", "c", {
        content: "hello",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.createMessage).not.toHaveBeenCalled();
  });
  it("sends private notifications only to the recipient room", async () => {
    const repo = {
      getUserPreferences: jest.fn().mockResolvedValue({ messages: true }),
      createOrGroupNotification: jest.fn().mockResolvedValue({ id: "n" }),
      countUnread: jest.fn().mockResolvedValue(1),
    } as any;
    const emit = jest.fn();
    const gateway = {
      server: { to: jest.fn().mockReturnValue({ emit }), emit: jest.fn() },
    } as any;
    await new NotificationsService(repo, gateway, logger).publishNotification({
      userId: "recipient",
      type: "NEW_MESSAGE",
      title: "Message",
      body: "private",
      category: "MESSAGES",
    });
    expect(gateway.server.to).toHaveBeenCalledWith("user:recipient");
    expect(emit).toHaveBeenCalled();
    expect(gateway.server.emit).not.toHaveBeenCalled();
  });
  it("omits hidden location and skills from student search", async () => {
    const repo = {
      searchProfiles: jest
        .fn()
        .mockResolvedValue({
          items: [
            {
              name: "Student",
              campusLocation: "private location",
              showLocation: false,
              showSkills: false,
              skills: [{ name: "private skill" }],
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        }),
    } as any;
    const result = await new ProfileService(
      repo,
      {} as any,
      logger,
    ).searchStudents({});
    expect(result.items[0].campusLocation).toBeNull();
    expect(result.items[0].skills).toEqual([]);
  });
  it("rejects applicant listing by someone other than the creator", async () => {
    const prisma = {
      opportunity: { findFirst: jest.fn().mockResolvedValue(null) },
      opportunityApplication: { findMany: jest.fn() },
    } as any;
    await expect(
      new OpportunitiesService({} as any, prisma, logger).getApplicants(
        "outsider",
        "opportunity",
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.opportunityApplication.findMany).not.toHaveBeenCalled();
  });
});
