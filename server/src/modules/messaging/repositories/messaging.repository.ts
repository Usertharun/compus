import { Injectable } from "@nestjs/common";
import {
  Conversation,
  ConversationType,
  Message,
  ParticipantRole,
} from "@prisma/client";
import { BaseAbstractRepository } from "@common/repositories/base.repository";
import { PrismaService } from "@database/prisma.service";
import {
  CreateGroupConversationDto,
  CursorMessageQueryDto,
  SendMessageDto,
} from "../dto/messaging.dto";
import { CursorPaginatedResponse } from "@modules/feed/dto/feed.dto";

@Injectable()
export class MessagingRepository extends BaseAbstractRepository<Conversation> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.conversation);
  }

  private conversationIncludeSelect() {
    return {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { name: true, username: true, avatarUrl: true },
              },
            },
          },
        },
      },
      messages: {
        where: { deletedAt: null },
        take: 1,
        orderBy: { createdAt: "desc" as const },
        include: {
          sender: {
            select: {
              id: true,
              profile: { select: { name: true, username: true } },
            },
          },
        },
      },
    };
  }

  private messageIncludeSelect() {
    return {
      sender: {
        select: {
          id: true,
          email: true,
          profile: { select: { name: true, username: true, avatarUrl: true } },
        },
      },
      reads: {
        select: { userId: true, readAt: true },
      },
    };
  }

  async findDirectConversation(userAId: string, userBId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.ONE_TO_ONE,
        deletedAt: null,
        participants: {
          every: {
            userId: { in: [userAId, userBId] },
          },
        },
      },
      include: this.conversationIncludeSelect(),
    });

    return conversations.find((c) => c.participants.length === 2) || null;
  }

  async findUserConversations(userId: string) {
    const [conversations, unreadCounts] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          deletedAt: null,
          participants: {
            some: { userId },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        include: this.conversationIncludeSelect(),
      }),
      this.prisma.$queryRaw<
        Array<{ conversationId: string; unreadCount: number }>
      >`
        SELECT m."conversationId", COUNT(*)::int AS "unreadCount"
        FROM messages m
        INNER JOIN conversation_participants cp
          ON cp."conversationId" = m."conversationId"
          AND cp."userId" = ${userId}
        INNER JOIN conversations c ON c.id = m."conversationId"
        WHERE m."deletedAt" IS NULL
          AND c."deletedAt" IS NULL
          AND m."senderId" <> ${userId}
          AND m."createdAt" > COALESCE(cp."lastReadAt", TO_TIMESTAMP(0))
        GROUP BY m."conversationId"
      `,
    ]);
    const unreadByConversation = new Map(
      unreadCounts.map((row) => [row.conversationId, row.unreadCount]),
    );
    return conversations.map((c) => ({
      ...c,
      unreadCount: unreadByConversation.get(c.id) || 0,
    }));
  }

  async findConversationById(id: string) {
    return this.prisma.conversation.findFirst({
      where: { id, deletedAt: null },
      include: this.conversationIncludeSelect(),
    });
  }

  async isParticipant(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.prisma.conversationParticipant.count({
      where: { conversationId, userId, conversation: { deletedAt: null } },
    });
    return count > 0;
  }

  async createDirectConversation(userAId: string, userBId: string) {
    return this.prisma.$transaction(async tx => {
      // Lock the pair in a stable order so simultaneous requests reuse one chat.
      await tx.$queryRaw`SELECT id FROM users WHERE id IN (${userAId}, ${userBId}) ORDER BY id FOR UPDATE`;
      const existing = await tx.conversation.findFirst({
        where: { type: ConversationType.ONE_TO_ONE, deletedAt: null, AND: [
          { participants: { some: { userId: userAId } } },
          { participants: { some: { userId: userBId } } },
          { participants: { every: { userId: { in: [userAId, userBId] } } } },
        ] },
        include: this.conversationIncludeSelect(),
      });
      if (existing) return existing;
      return tx.conversation.create({
      data: {
        type: ConversationType.ONE_TO_ONE,
        isGroup: false,
        participants: {
          create: [
            { userId: userAId, role: ParticipantRole.MEMBER },
            { userId: userBId, role: ParticipantRole.MEMBER },
          ],
        },
      },
      include: this.conversationIncludeSelect(),
    });
    }, { maxWait: 10000, timeout: 20000 });
  }

  async createGroupConversation(
    dto: CreateGroupConversationDto,
    creatorId: string,
  ) {
    const participantIds = Array.from(
      new Set([...dto.participantUserIds, creatorId]),
    );

    return this.prisma.conversation.create({
      data: {
        type: dto.type || ConversationType.GROUP,
        isGroup: true,
        title: dto.title,
        avatarUrl: dto.avatarUrl,
        communityId: dto.communityId,
        eventId: dto.eventId,
        participants: {
          create: participantIds.map((userId) => ({
            userId,
            role:
              userId === creatorId
                ? ParticipantRole.ADMIN
                : ParticipantRole.MEMBER,
          })),
        },
      },
      include: this.conversationIncludeSelect(),
    });
  }

  async findMessagesByConversation(
    conversationId: string,
    dto: CursorMessageQueryDto,
  ): Promise<CursorPaginatedResponse<Record<string, unknown>>> {
    const limit = dto.limit || 20;

    const where: Record<string, unknown> = {
      conversationId,
      deletedAt: null,
    };

    if (dto.cursor) {
      const cursorMsg = await this.prisma.message.findUnique({
        where: { id: dto.cursor },
        select: { createdAt: true },
      });

      if (cursorMsg) {
        where.createdAt = { lt: cursorMsg.createdAt };
      }
    }

    const items = await this.prisma.message.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
      include: this.messageIncludeSelect(),
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  async findMessageById(id: string) {
    return this.prisma.message.findFirst({
      where: { id, deletedAt: null },
      include: this.messageIncludeSelect(),
    });
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    const [message] = await Promise.all([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId,
          content: dto.content,
          type: dto.type || "TEXT",
          mediaUrl: dto.mediaUrl,
          parentId: dto.parentId || null,
          attachments:
            dto.attachments && dto.attachments.length > 0
              ? {
                  create: dto.attachments.map((a) => ({
                    url: a.url,
                    type: a.type,
                    fileName: a.fileName,
                    fileSize: a.fileSize,
                    mimeType: a.mimeType,
                  })),
                }
              : undefined,
        },
        include: this.messageIncludeSelect(),
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return message;
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.messageReaction.upsert({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
      update: {},
      create: { messageId, userId, emoji },
    });
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    await this.prisma.messageReaction.deleteMany({
      where: { messageId, userId, emoji },
    });
  }

  async markMessageRead(messageId: string, userId: string) {
    return this.prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      update: { readAt: new Date() },
      create: { messageId, userId, readAt: new Date() },
    });
  }
}
