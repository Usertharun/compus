import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationType, MessageType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class MessageAttachmentDto {
  @ApiProperty({ example: 'https://storage.supabase.co/v1/object/public/chat/file.pdf' })
  @IsUrl()
  url: string;

  @ApiProperty({ enum: MessageType, default: MessageType.FILE })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiPropertyOptional({ example: 'LectureNotes.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: 2048000 })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class CreateDirectConversationDto {
  @ApiProperty({ description: 'Target student User ID to chat with' })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}

export class CreateGroupConversationDto {
  @ApiProperty({ example: 'Study Group - Compiler Design' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'https://example.com/group-avatar.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: ['user-id-1', 'user-id-2'] })
  @IsArray()
  @IsString({ each: true })
  participantUserIds: string[];

  @ApiPropertyOptional({ enum: ConversationType, default: ConversationType.GROUP })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventId?: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'Hey Alex, are you coming to the hackathon briefing?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiPropertyOptional({ example: 'https://storage.supabase.co/v1/object/public/chat/image.png' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Parent message ID if replying to a specific message' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ type: [MessageAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments?: MessageAttachmentDto[];
}

export class EditMessageDto {
  @ApiProperty({ example: 'Updated message content.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AddReactionDto {
  @ApiProperty({ example: '👍' })
  @IsString()
  @IsNotEmpty()
  emoji: string;
}

export class CursorMessageQueryDto {
  @ApiPropertyOptional({ description: 'Message ID cursor for backward pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
