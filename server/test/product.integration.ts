import { UploadsController } from "../src/modules/uploads/uploads.module";
import { PostgresSearchProvider } from "../src/modules/search/providers/postgres-search.provider";
import "reflect-metadata";
import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../src/database/prisma.service";
import { FeedRepository } from "../src/modules/feed/repositories/feed.repository";
import { FeedService } from "../src/modules/feed/feed.service";
import { CommunitiesRepository } from "../src/modules/communities/repositories/communities.repository";
import { CommunitiesService } from "../src/modules/communities/communities.service";
import { EventsRepository } from "../src/modules/events/repositories/events.repository";
import { EventsService } from "../src/modules/events/events.service";
import { OpportunitiesRepository } from "../src/modules/opportunities/repositories/opportunities.repository";
import { OpportunitiesService } from "../src/modules/opportunities/opportunities.service";
import { MessagingRepository } from "../src/modules/messaging/repositories/messaging.repository";
import { MessagingService } from "../src/modules/messaging/messaging.service";
import { ProfileRepository } from "../src/modules/profile/repositories/profile.repository";
import { ProfileService } from "../src/modules/profile/profile.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
const prisma = new PrismaService();
const logger = { log() {} } as any;
const emitter = new EventEmitter2();
const feedRepo = new FeedRepository(prisma);
const feed = new FeedService(feedRepo, prisma, logger, emitter);
const communities = new CommunitiesService(
  new CommunitiesRepository(prisma),
  feedRepo,
  prisma,
  logger,
);
const events = new EventsService(new EventsRepository(prisma), prisma, logger);
const opps = new OpportunitiesService(
  new OpportunitiesRepository(prisma),
  prisma,
  logger,
  emitter,
);
const messaging = new MessagingService(
  new MessagingRepository(prisma),
  prisma,
  logger,
  emitter,
);
const profile = new ProfileService(
  new ProfileRepository(prisma),
  prisma,
  logger,
);
const marker = "compus-qa-" + randomUUID();
const ids: string[] = [];
const conversationIds: string[] = [];
const organization = marker + "-org";
async function main() {
  try {
    await prisma.$connect();
    for (let i = 0; i < 3; i++) {
      const u = await prisma.user.create({
        data: {
          email: marker + "-" + i + "@srmist.edu.in",
          passwordHash: "NO_LOGIN_TEST_FIXTURE",
          isVerified: true,
          onboardingCompleted: true,
          profile: {
            create: {
              name: "Compus QA " + i,
              username: marker + "-" + i,
              department: "QA",
              year: "2027",
            },
          },
        },
      });
      ids.push(u.id);
    }
    const [owner, student, outsider] = ids;
    const post = await feed.createPost(owner, {
      content: "Integration test campus post",
      category: "GENERAL",
    });
    assert(post);
    await Promise.all([
      feed.likePost(post.id, student),
      feed.likePost(post.id, student),
    ]);
    await feed.bookmarkPost(post.id, student);
    await feed.addComment(post.id, student, {
      content: "Persistent test comment",
    });
    const detail = await feed.getPostDetails(post.id, student);
    assert(detail.isLiked && detail.isBookmarked);
    assert.equal(detail.likeCount, 1);
    assert.equal(detail.commentCount, 1);
    assert.equal(detail.comments[0].content, "Persistent test comment");
    const page = await feed.getLatestFeed({ limit: 50 }, student);
    assert.equal(page.items.find((p) => p.id === post.id)?.isLiked, true);
    await assert.rejects(feed.deletePost(outsider, post.id));
    const draft = await feed.createPost(owner, {
      content: "Private draft",
      visibility: "PRIVATE_DRAFT",
    });
    assert(draft);
    await assert.rejects(feed.getPostDetails(draft.id, outsider));
    await assert.rejects(feed.likePost(draft.id, outsider));
    assert.equal(
      (
        await feed.getLatestFeed(
          { limit: 50, search: "Integration test campus post" },
          student,
        )
      ).items.some((p) => p.id === post.id),
      true,
    );
    assert.equal(
      (
        await new PostgresSearchProvider(prisma).searchUnified(
          "Private draft",
          outsider,
          "POSTS",
        )
      ).posts.length,
      0,
    );
    console.log(
      "PASS feed persistence, personalization, comments and ownership",
    );
    const community = await communities.createCommunity(owner, {
      name: marker,
      slug: marker,
      description: "Temporary integration fixture",
      category: "Technology",
      joinPolicy: "APPROVAL_REQUIRED",
    });
    assert(community);
    await communities.requestAccess(student, community.id, {});
    const requests = await communities.getPendingRequests(owner, community.id);
    await assert.rejects(
      communities.acceptJoinRequest(outsider, requests[0].id),
    );
    await communities.acceptJoinRequest(owner, requests[0].id);
    const communityPost = await feed.createPost(student, {
      content: "Private community update",
      communityId: community.id,
    });
    assert(communityPost);
    assert.equal(communityPost.visibility, "COMMUNITY_ONLY");
    await assert.rejects(feed.getPostDetails(communityPost.id, outsider));
    assert.equal(
      (
        await communities.getCommunityFeed(
          community.id,
          { limit: 20 },
          outsider,
        )
      ).items.length,
      0,
    );
    assert.equal(
      (await communities.getCommunityFeed(community.id, { limit: 20 }, owner))
        .items.length,
      1,
    );
    console.log("PASS community creation, approval and member-only feed");
    const startTime = new Date(Date.now() + 86400000);
    const endTime = new Date(startTime.getTime() + 3600000);
    const event = await events.createEvent(owner, {
      title: marker,
      description: "QA fixture",
      venue: "Test only",
      startTime,
      endTime,
      capacity: 1,
    });
    assert(event);
    await assert.rejects(events.registerEvent(student, event.id));
    await events.changeEventStatus(owner, event.id, {
      status: "REGISTRATION_OPEN",
    });
    const registrations = await Promise.all([
      events.registerEvent(student, event.id),
      events.registerEvent(outsider, event.id),
    ]);
    assert.equal(
      registrations.filter((r) => r.rsvp.status === "GOING").length,
      1,
    );
    assert.equal(
      registrations.filter((r) => r.rsvp.status === "WAITLISTED").length,
      1,
    );
    const going = registrations.find((r) => r.rsvp.status === "GOING")!.rsvp
      .userId;
    const waiting = registrations.find((r) => r.rsvp.status === "WAITLISTED")!
      .rsvp.userId;
    await events.cancelRegistration(going, event.id);
    assert.equal(
      (await events.getEventDetails(event.id, waiting)).userRsvpStatus,
      "GOING",
    );
    console.log("PASS event publish, registration, waitlist and promotion");
    const opp = await opps.createOpportunity(owner, {
      title: marker,
      description: "QA fixture",
      category: "Internship",
      companyName: organization,
      location: "Test only",
    });
    assert(opp);
    const application = await opps.apply(student, opp.id, {
      coverLetter: "QA cover letter",
    });
    assert.equal(
      (await opps.getUserApplications(student))[0].id,
      application.id,
    );
    await assert.rejects(opps.getApplicants(outsider, opp.id));
    await opps.reviewApplication(owner, opp.id, application.id, "ACCEPTED");
    assert.equal(
      (await opps.getUserApplications(student))[0].status,
      "ACCEPTED",
    );
    console.log("PASS real applications and owner-only review");
    const convo = await messaging.getOrCreateDirectConversation(owner, {
      targetUserId: student,
    });
    conversationIds.push(convo.id);
    const message = await messaging.sendMessage(owner, convo.id, {
      content: "Persistent QA message",
    });
    assert.equal(
      (await messaging.getMessages(student, convo.id, { limit: 20 })).items[0]
        .id,
      message.id,
    );
    await assert.rejects(
      messaging.getMessages(outsider, convo.id, { limit: 20 }),
    );
    await assert.rejects(messaging.markRead(outsider, message.id));
    await messaging.markRead(student, message.id);
    await profile.updateProfile(student, {
      allowDirectMessages: false,
      showLocation: false,
      campusLocation: "Hidden QA location",
    });
    await assert.rejects(
      messaging.sendMessage(owner, convo.id, { content: "must be blocked" }),
    );
    const search = await profile.searchStudents({
      search: "Compus QA",
      limit: 50,
    });
    assert.equal(
      search.items.find((p) => p.userId === student)?.campusLocation,
      null,
    );
    console.log("PASS private messages, read receipts and privacy settings");
    await prisma.feedback.create({
      data: {
        userId: student,
        category: "BUG",
        message: "QA feedback",
        page: "/campus",
      },
    });
    assert.equal(
      await prisma.feedback.count({ where: { userId: student } }),
      1,
    );
    console.log("PASS persisted tester feedback");
    const uploads = new UploadsController(prisma);
    const image = await uploads.upload(student, {
      data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    });
    assert(image.path.startsWith("/uploads/images/"));
    await assert.rejects(
      uploads.upload(student, { data: "data:image/png;base64,AA==" }),
    );
    console.log("PASS real image persistence and invalid upload rejection");
  } finally {
    if (ids.length) {
      await prisma.post.deleteMany({ where: { authorId: { in: ids } } });
      await prisma.event.deleteMany({ where: { organizerId: { in: ids } } });
      await prisma.opportunity.deleteMany({
        where: { creatorId: { in: ids } },
      });
      await prisma.community.deleteMany({ where: { ownerId: { in: ids } } });
      await prisma.conversation.deleteMany({
        where: { id: { in: conversationIds } },
      });
      await prisma.organization.deleteMany({ where: { name: organization } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
      console.log("QA fixture cleanup completed.");
    }
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e.name + ": " + e.message);
  process.exitCode = 1;
});
