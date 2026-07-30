import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus, UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

export class SearchAdminUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Filter active status (true/false)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class SuspendUserDto {
  @ApiProperty({ example: 'Violation of community guidelines regarding spam.' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ResolveReportDto {
  @ApiProperty({ enum: ReportStatus, default: ReportStatus.REVIEWED })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiPropertyOptional({ example: 'Post removed due to inappropriate content.' })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({ description: 'Set true to soft delete the reported post' })
  @IsOptional()
  @IsBoolean()
  deleteContent?: boolean;
}

export class SystemSettingDto {
  @ApiProperty({ example: 'MAX_POST_ATTACHMENTS' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: { limit: 10 } })
  @IsObject()
  value: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'Maximum allowed attachments per post' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ToggleFeatureFlagDto {
  @ApiProperty({ example: 'ENABLE_REALTIME_CHAT' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ example: 'Enable Socket.IO real-time chat module' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Scheduled System Maintenance' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Compus will undergo maintenance on Sunday between 2 AM - 4 AM UTC.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'HIGH' })
  @IsOptional()
  @IsString()
  priority?: string;
}
