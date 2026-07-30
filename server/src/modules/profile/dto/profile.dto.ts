import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileVisibility } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'alexchen' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,30}$/, {
    message: 'Username must be 3-30 alphanumeric characters or underscores',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'Alex Chen' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'RA2111003010001' })
  @IsOptional()
  @IsString()
  registerNumber?: string;

  @ApiPropertyOptional({ example: 'Computer Science and Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '4th Year' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ example: 'CSE-A' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({ example: 'Full stack developer interested in web architecture and real-time systems.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'North Campus Tech Hub' })
  @IsOptional()
  @IsString()
  campusLocation?: string;

  @ApiPropertyOptional({ example: 'https://portfolio.alexchen.dev' })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/alexchen' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/alexchen' })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ example: 'https://alexchen.dev' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ enum: ProfileVisibility, default: ProfileVisibility.PUBLIC })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  visibility?: ProfileVisibility;

  @ApiPropertyOptional({ enum: ProfileVisibility, default: ProfileVisibility.CAMPUS_ONLY })
  @IsOptional()
  @IsEnum(ProfileVisibility)
  contactVisibility?: ProfileVisibility;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  showSkills?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  showProjects?: boolean;
}

export class SearchStudentsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '4th Year' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ example: 'TypeScript' })
  @IsOptional()
  @IsString()
  skill?: string;

  @ApiPropertyOptional({ example: 'Web Development' })
  @IsOptional()
  @IsString()
  interest?: string;
}

export class AddSkillDto {
  @ApiProperty({ example: 'TypeScript' })
  @IsString()
  @IsNotEmpty()
  skillName: string;

  @ApiPropertyOptional({ example: 'PROGRAMMING' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class AddInterestDto {
  @ApiProperty({ example: 'Artificial Intelligence' })
  @IsString()
  @IsNotEmpty()
  interestName: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Compus Campus Network' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Realtime student collaboration platform built with NestJS & React.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'https://compus.app' })
  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/compus/compus' })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ example: ['React', 'TypeScript', 'NestJS', 'PostgreSQL'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @ApiProperty({ example: '2026-01-01' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Compus Campus Network' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated project summary.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class CreateAchievementDto {
  @ApiProperty({ example: 'Best Innovation Hackathon Winner 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Awarded 1st place for building campus real-time app.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'SRM Hackers Club' })
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiProperty({ example: '2026-05-15' })
  @Type(() => Date)
  @IsDate()
  dateAwarded: Date;

  @ApiPropertyOptional({ example: 'https://example.com/certificate.pdf' })
  @IsOptional()
  @IsUrl()
  certificateUrl?: string;
}

export class UpdateAchievementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateAwarded?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  certificateUrl?: string;
}
