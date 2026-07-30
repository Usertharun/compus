import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType, PostCategory, PostVisibility, ReportReason } from '@prisma/client';
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

export class MediaAttachmentDto {
  @ApiProperty({ example: 'https://storage.supabase.co/v1/object/public/feed/image.jpg' })
  @IsUrl()
  url: string;

  @ApiProperty({ enum: MediaType, default: MediaType.IMAGE })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ example: 'campus-event.jpg' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: 1048576 })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional({ example: 'image/jpeg' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 'Group photo at the hackathon' })
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreatePostDto {
  @ApiPropertyOptional({ example: 'Compus Fall Hackathon 2026 Registration Open!' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Excited to announce our 24-hour campus hackathon! Join us at @alexchen #hackathon #compus' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ enum: PostCategory, default: PostCategory.GENERAL })
  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @ApiPropertyOptional({ enum: PostVisibility, default: PostVisibility.PUBLIC_CAMPUS })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ type: [MediaAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaAttachmentDto)
  media?: MediaAttachmentDto[];

  @ApiPropertyOptional({ example: ['hackathon', 'compus'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: PostCategory })
  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @ApiPropertyOptional({ enum: PostVisibility })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;
}

export class CursorPaginationQueryDto {
  @ApiPropertyOptional({ description: 'ID of the last post received for cursor pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class AddCommentDto {
  @ApiProperty({ example: 'Great initiative! Looking forward to participating.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID if replying to a comment' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class EditCommentDto {
  @ApiProperty({ example: 'Updated comment text.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ReportPostDto {
  @ApiProperty({ enum: ReportReason, default: ReportReason.SPAM })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiPropertyOptional({ example: 'Contains inappropriate promotional material.' })
  @IsOptional()
  @IsString()
  details?: string;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
