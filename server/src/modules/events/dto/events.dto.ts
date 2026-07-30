import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, EventVisibility, MediaType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

export class EventMediaDto {
  @ApiProperty({ example: 'https://storage.supabase.co/v1/object/public/events/poster.jpg' })
  @IsUrl()
  url: string;

  @ApiProperty({ enum: MediaType, default: MediaType.IMAGE })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ example: 'Event Official Poster' })
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Compus AI & Cloud Computing Summit 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Join us for a 1-day summit on NextGen AI and Cloud Tech.' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 'Comprehensive summit featuring keynote speakers, hands-on workshops, and networking sessions.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Hackathon' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiProperty({ example: 'Main Auditorium' })
  @IsString()
  @IsNotEmpty()
  venue: string;

  @ApiPropertyOptional({ example: 'Tech Block 1' })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ example: 'Auditorium A' })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789' })
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;

  @ApiProperty({ example: '2026-08-15T09:00:00Z' })
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty({ example: '2026-08-15T17:00:00Z' })
  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @ApiPropertyOptional({ example: '2026-08-14T23:59:59Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationDeadline?: Date;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ enum: EventVisibility, default: EventVisibility.PUBLIC_CAMPUS })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;

  @ApiPropertyOptional({ example: ['AI', 'Cloud', 'Workshop'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Community ID if hosted by a community' })
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiPropertyOptional({ type: [EventMediaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventMediaDto)
  media?: EventMediaDto[];
}

export class UpdateEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationDeadline?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({ enum: EventVisibility })
  @IsOptional()
  @IsEnum(EventVisibility)
  visibility?: EventVisibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SearchEventsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Hackathon' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'community-id-123' })
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiPropertyOptional({ example: 'AI' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

export class ChangeEventStatusDto {
  @ApiProperty({ enum: EventStatus })
  @IsEnum(EventStatus)
  status: EventStatus;

  @ApiPropertyOptional({ example: 'Event postponed due to venue maintenance.' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddEventCommentDto {
  @ApiProperty({ example: 'Will certificates be provided for attendees?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID if replying' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
