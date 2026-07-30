import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PublishNotificationEventDto {
  @ApiProperty({ description: 'Target user ID to receive notification' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'NEW_MESSAGE' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'New Message from Alex' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Hey, are you joining the hackathon?' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ example: '/messages/conv-123' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.NORMAL })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ example: 'MESSAGES' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Optional group ID for aggregating similar notifications' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  messages?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  communities?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  events?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  opportunities?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  feedActivity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  followers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mentions?: boolean;
}

export class CursorNotificationQueryDto {
  @ApiPropertyOptional({ description: 'Notification ID cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 15, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 15;
}
