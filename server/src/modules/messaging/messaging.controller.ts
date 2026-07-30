import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { MessagingService } from './messaging.service';
import {
  AddReactionDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  CursorMessageQueryDto,
  EditMessageDto,
  SendMessageDto,
} from './dto/messaging.dto';

@ApiTags('Real-Time Messaging')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // --- CONVERSATIONS ---

  @Post('conversations/direct')
  @ApiOperation({ summary: 'Get or start 1-to-1 direct conversation with a student' })
  async getOrCreateDirectConversation(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDirectConversationDto,
  ) {
    return this.messagingService.getOrCreateDirectConversation(userId, dto);
  }

  @Post('conversations/group')
  @ApiOperation({ summary: 'Create group conversation' })
  async createGroupConversation(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGroupConversationDto,
  ) {
    return this.messagingService.createGroupConversation(userId, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List active user conversations with unread counts' })
  async getUserConversations(@CurrentUser('id') userId: string) {
    return this.messagingService.getUserConversations(userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation details & participants' })
  async getConversationDetails(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.getConversationDetails(conversationId, userId);
  }

  @Delete('conversations/:id/leave')
  @ApiOperation({ summary: 'Leave conversation' })
  async leaveConversation(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
  ) {
    return this.messagingService.leaveConversation(userId, conversationId);
  }

  // --- MESSAGES ---

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message (REST API fallback)' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(userId, conversationId, dto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Fetch conversation message history (Cursor-based pagination)' })
  async getMessages(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
    @Query() dto: CursorMessageQueryDto,
  ) {
    return this.messagingService.getMessages(userId, conversationId, dto);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Edit message content (Sender only)' })
  async editMessage(
    @CurrentUser('id') userId: string,
    @Param('id') messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.messagingService.editMessage(userId, messageId, dto);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Soft delete message for everyone (Sender only)' })
  async deleteMessage(
    @CurrentUser('id') userId: string,
    @Param('id') messageId: string,
  ) {
    return this.messagingService.deleteMessage(userId, messageId);
  }

  @Post('messages/:id/pin')
  @ApiOperation({ summary: 'Toggle message pin status' })
  async togglePinMessage(
    @CurrentUser('id') userId: string,
    @Param('id') messageId: string,
  ) {
    return this.messagingService.togglePinMessage(userId, messageId);
  }

  @Post('messages/:id/react')
  @ApiOperation({ summary: 'Add emoji reaction to message' })
  async addReaction(
    @CurrentUser('id') userId: string,
    @Param('id') messageId: string,
    @Body() dto: AddReactionDto,
  ) {
    return this.messagingService.addReaction(userId, messageId, dto);
  }

  @Delete('messages/:id/react')
  @ApiOperation({ summary: 'Remove emoji reaction from message' })
  async removeReaction(
    @CurrentUser('id') userId: string,
    @Param('id') messageId: string,
    @Query('emoji') emoji: string,
  ) {
    return this.messagingService.removeReaction(userId, messageId, emoji);
  }

  @Post('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  async markRead(
    @CurrentUser('id') userId: string,
    @Param('id') messageId: string,
  ) {
    return this.messagingService.markRead(userId, messageId);
  }
}
