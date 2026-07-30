import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JoinPolicy } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

export class CreateCommunityDto {
  @ApiProperty({ example: 'Google Developer Student Club' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'gdsc-srmist' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'Official student developer community powered by Google Developers.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Technical Club' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'https://example.com/gdsc-logo.png' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/gdsc-banner.png' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: ['Tech', 'Coding', 'Google', 'Web'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: JoinPolicy, default: JoinPolicy.OPEN })
  @IsOptional()
  @IsEnum(JoinPolicy)
  joinPolicy?: JoinPolicy;

  @ApiPropertyOptional({ example: 'gdsc@srmist.edu.in' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: 'https://gdsc.community.dev' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/gdsc_srm' })
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/gdsc-srm' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/gdsc-srm' })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;
}

export class UpdateCommunityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

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
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: JoinPolicy })
  @IsOptional()
  @IsEnum(JoinPolicy)
  joinPolicy?: JoinPolicy;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  githubUrl?: string;
}

export class SearchCommunitiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Technical Club' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Coding' })
  @IsOptional()
  @IsString()
  tag?: string;
}

export class SubmitJoinRequestDto {
  @ApiPropertyOptional({ example: 'I am a 3rd year CS student passionate about mobile app dev.' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class TransferOwnershipDto {
  @ApiProperty({ description: 'Target user ID to transfer community ownership to' })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}
