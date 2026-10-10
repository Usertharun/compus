import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "@database/prisma.service";
import { MessagingRepository } from "./repositories/messaging.repository";
import {
  AddReactionDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  CursorMessageQueryDto,
  EditMessageDto,
  SendMessageDto,
} from "./dto/messaging.dto";
import { AppLoggerService } from "@logger/logger.service";
import { AnalyticsService } from "@modules/analytics/analytics.service";
import { PRODUCT_EVENTS } from "@modules/analytics/analytics.events";

@Injectable()
export class MessagingService {
  constructor(
    private readonly messagingRepository: MessagingRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    @Optional() private readonly eventEmitter?: EventEmitter2,
    @Optional() private readonly analytics?: AnalyticsService,
  ) {}

  async getOrCreateDirectConversation(
    userAId: string,
    dto: CreateDirectConversationDto,
  ) {
    if (userAId === dto.targetUserId) {
      throw new BadRequestException(
        "You cannot start a direct conversation with yourself.",
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: dto.targetUserId },
    });
    if (!targetUser || targetUser.deletedAt || !targetUser.isActive || !targetUser.isVerified) {
      throw new NotFoundException("Target student user not found");
    }

    const privacy = await this.prisma.profile.findUnique({
      where: { userId: dto.targetUserId },
      select: { allowDirectMessages: true },
    });
    if (privacy?.allowDirectMessages === false)
      throw new ForbiddenException(
        "This student is not accepting direct messages.",
      );

    const existing = await this.messagingRepository.findDirectConversation(
      userAId,
      dto.targetUserId,
    );
    if (existing) return existing;

    const newConversation =
      await this.messagingRepository.createDirectConversation(
        userAId,
        dto.targetUserId,
      );
    this.logger.log(
      `Created direct conversation ${newConversation.id} between ${userAId} and ${dto.targetUserId}`,
      "MessagingService",
    );

    return newConversation;
  }

  async createGroupConversation(
    creatorId: string,
    dto: CreateGroupConversationDto,
  ) {
    if (!dto.participantUserIds || dto.participantUserIds.length === 0) {
      throw new BadRequestException(
        "Group conversation requires at least one other participant",
      );
    }

    const ids = [
      ...new Set(dto.participantUserIds.filter((id) => id !== creatorId)),
    ];
    if (!ids.length || ids.length > 50)
      throw new BadRequestException("Choose between 1 and 50 other students.");
    const allowed = await this.prisma.user.count({
      where: {
        id: { in: ids },
        isActive: true,
        isVerified: true,
        deletedAt: null,
        profile: { allowDirectMessages: true },
      },
    });
    if (allowed !== ids.length)
      throw new BadRequestException(
        "Some students are unavailable or do not accept messages.",
      );
    if (dto.communityId || dto.eventId)
      throw new BadRequestException(
        "Use a regular group conversation. Community and event rooms are not supported yet.",
      );

    const group = await this.messagingRepository.createGroupConversation(
      dto,
      creatorId,
    );
    this.logger.log(
      `Created group conversation ${group.id} with ${group.participants.length} members`,
      "MessagingService",
    );

    return group;
  }

  async getUserConversations(userId: string) {
    return this.messagingRepository.findUserConversations(userId);
  }

  async getConversationDetails(conversationId: string, userId: string) {
    const isParticipant = await this.messagingRepository.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        "You are not a participant of this conversation",
      );
    }

    const conversation =
      await this.messagingRepository.findConversationById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");

    return conversation;
  }

  async leaveConversation(userId: string, conversationId: string) {
    const isParticipant = await this.messagingRepository.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant)
      throw new NotFoundException("Conversation membership not found");

    await this.prisma.conversationParticipant.deleteMany({
      where: { conversationId, userId },
    });

    return { success: true, message: "Left conversation successfully" };
  }

  // --- MESSAGES ---

  async sendMessage(
    senderId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const isParticipant = await this.messagingRepository.isParticipant(
      conversationId,
      senderId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        "You are not authorized to send messages in this conversation",
      );
    }

    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestException("Message content cannot be empty");
    }

    const conversation =
      await this.messagingRepository.findConversationById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");
    if (conversation.type === "ONE_TO_ONE") {
      const recipients = conversation.participants
        .filter((p) => p.userId !== senderId)
        .map((p) => p.userId);
      const blocked = await this.prisma.profile.count({
        where: { userId: { in: recipients }, allowDirectMessages: false },
      });
      if (blocked)
        throw new ForbiddenException(
          "This student is not accepting direct messages.",
        );
    }
    if (
      dto.parentId &&
      !(await this.prisma.message.findFirst({
        where: { id: dto.parentId, conversationId, deletedAt: null },
      }))
    )
      throw new BadRequestException(
        "The reply must reference a message in this conversation.",
      );

    const message = await this.messagingRepository.createMessage(
      conversationId,
      senderId,
      dto,
    );
    for (const participant of conversation?.participants || []) {
      if (participant.userId !== senderId)
        this.eventEmitter?.emit("notification.publish", {
          userId: participant.userId,
          type: "NEW_MESSAGE",
          title: "New campus message",
          body: dto.content.slice(0, 100),
          category: "MESSAGES",
          link: "/messages?conversation=" + conversationId,
        });
    }
    await this.analytics?.record(senderId, PRODUCT_EVENTS.MESSAGE_SENT, {
      conversationId,
      conversationType: conversation.type,
    });
    return message;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    dto: CursorMessageQueryDto,
  ) {
    const isParticipant = await this.messagingRepository.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        "You are not a participant of this conversation",
      );
    }

    return this.messagingRepository.findMessagesByConversation(
      conversationId,
      dto,
    );
  }

  async editMessage(userId: string, messageId: string, dto: EditMessageDto) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
    });

    if (!message) throw new NotFoundException("Message not found");
    if (message.senderId !== userId)
      throw new ForbiddenException("Cannot edit message");

    return this.prisma.message.update({
      where: { id: messageId },
      data: { content: dto.content },
    });
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
    });

    if (!message) throw new NotFoundException("Message not found");
    if (message.senderId !== userId)
      throw new ForbiddenException("Cannot delete message");

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: "Message deleted for everyone" };
  }

  async togglePinMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
    });

    if (!message) throw new NotFoundException("Message not found");
    const isParticipant = await this.messagingRepository.isParticipant(
      message.conversationId,
      userId,
    );
    if (!isParticipant) throw new ForbiddenException("Not authorized");

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });

    return { isPinned: updated.isPinned };
  }

  async addReaction(userId: string, messageId: string, dto: AddReactionDto) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
    });

    if (!message) throw new NotFoundException("Message not found");

    if (
      !(await this.messagingRepository.isParticipant(
        message.conversationId,
        userId,
      ))
    )
      throw new ForbiddenException("Not authorized");

    const reaction = await this.messagingRepository.addReaction(
      messageId,
      userId,
      dto.emoji,
    );
    return reaction;
  }

  async removeReaction(userId: string, messageId: string, emoji: string) {
    await this.messagingRepository.removeReaction(messageId, userId, emoji);
    return { success: true, message: "Reaction removed" };
  }

  async markRead(userId: string, messageId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, deletedAt: null },
    });

    if (!message) throw new NotFoundException("Message not found");

    if (
      !(await this.messagingRepository.isParticipant(
        message.conversationId,
        userId,
      ))
    )
      throw new ForbiddenException("Not authorized");

    await Promise.all([
      this.messagingRepository.markMessageRead(messageId, userId),
      this.prisma.conversationParticipant.updateMany({
        where: { conversationId: message.conversationId, userId },
        data: { lastReadAt: new Date() },
      }),
    ]);

    return {
      success: true,
      conversationId: message.conversationId,
      message: "Message marked as read",
    };
  }
}
