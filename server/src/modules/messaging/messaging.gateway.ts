import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import { MessageType } from '@prisma/client';
import { SendMessageDto } from './dto/messaging.dto';
import { AppLoggerService } from '@logger/logger.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws/messaging',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messagingService: MessagingService,
    private readonly logger: AppLoggerService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        socket.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
      const payload = this.jwtService.verify(token, { secret });
      const userId = payload.sub;

      socket.data.userId = userId;
      this.connectedUsers.set(socket.id, userId);

      this.logger.log(`WebSocket client connected: ${socket.id} (user: ${userId})`, 'MessagingGateway');
      this.server.emit('user_status_changed', { userId, status: 'ONLINE' });
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      this.connectedUsers.delete(socket.id);
      this.logger.log(`WebSocket client disconnected: ${socket.id} (user: ${userId})`, 'MessagingGateway');
      this.server.emit('user_status_changed', { userId, status: 'OFFLINE' });
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = socket.data.userId;
    if (!userId || !data.conversationId) return;

    await socket.join(`conversation:${data.conversationId}`);
    return { status: 'joined', conversationId: data.conversationId };
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data.conversationId) return;
    await socket.leave(`conversation:${data.conversationId}`);
    return { status: 'left', conversationId: data.conversationId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string; content: string; type?: MessageType; mediaUrl?: string; parentId?: string },
  ) {
    const userId = socket.data.userId;
    if (!userId || !data.conversationId || !data.content) return;

    const dto: SendMessageDto = {
      content: data.content,
      type: data.type,
      mediaUrl: data.mediaUrl,
      parentId: data.parentId,
    };

    const message = await this.messagingService.sendMessage(userId, data.conversationId, dto);

    // Broadcast new message to conversation room
    this.server.to(`conversation:${data.conversationId}`).emit('new_message', message);

    return message;
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = socket.data.userId;
    if (!userId || !data.conversationId) return;

    socket.to(`conversation:${data.conversationId}`).emit('typing_started', {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = socket.data.userId;
    if (!userId || !data.conversationId) return;

    socket.to(`conversation:${data.conversationId}`).emit('typing_stopped', {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('read_message')
  async handleReadMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = socket.data.userId;
    if (!userId || !data.messageId) return;

    await this.messagingService.markRead(userId, data.messageId);

    this.server.to(`conversation:${data.conversationId}`).emit('message_read_receipt', {
      messageId: data.messageId,
      userId,
      readAt: new Date(),
    });
  }
}
