import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MediaType,
  OpportunityMode,
  OpportunityStatus,
  OrganizationType,
  PersonalOpportunityStatus,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination.dto';

export class OpportunityMediaDto {
  @ApiProperty({ example: 'https://storage.supabase.co/v1/object/public/opps/brochure.pdf' })
  @IsUrl()
  url: string;

  @ApiProperty({ enum: MediaType, default: MediaType.DOCUMENT })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ example: 'Official Internship Brochure' })
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Software Engineering Summer Internship 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '12-week paid software engineering internship.' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 'Build scalable backend services using NestJS and PostgreSQL.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'INTERNSHIP' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'Google' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiPropertyOptional({ example: 'https://example.com/google-logo.png' })
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiPropertyOptional({ enum: OrganizationType, default: OrganizationType.COMPANY })
  @IsOptional()
  @IsEnum(OrganizationType)
  organizationType?: OrganizationType;

  @ApiPropertyOptional({ example: 'https://careers.google.com/jobs/12345' })
  @IsOptional()
  @IsUrl()
  applicationUrl?: string;

  @ApiPropertyOptional({ example: 'https://forms.gle/xyz' })
  @IsOptional()
  @IsUrl()
  registrationUrl?: string;

  @ApiProperty({ example: 'Bengaluru / Remote' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ enum: OpportunityMode, default: OpportunityMode.HYBRID })
  @IsOptional()
  @IsEnum(OpportunityMode)
  mode?: OpportunityMode;

  @ApiPropertyOptional({ example: ['B.Tech 3rd/4th Year', 'CGPA > 7.5'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibility?: string[];

  @ApiPropertyOptional({ example: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional({ example: ['Full-time return offer possibility', 'Mentorship'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional({ example: '₹50,000 / month' })
  @IsOptional()
  @IsString()
  stipend?: string;

  @ApiPropertyOptional({ example: '2026-08-30T23:59:59Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-11-30' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ example: 'https://example.com/banner.png' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: ['Tech', 'Backend', 'Internship'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [OpportunityMediaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpportunityMediaDto)
  media?: OpportunityMediaDto[];
}

export class UpdateOpportunityDto {
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
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  applicationUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  registrationUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: OpportunityMode })
  @IsOptional()
  @IsEnum(OpportunityMode)
  mode?: OpportunityMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eligibility?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stipend?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @ApiPropertyOptional({ enum: OpportunityStatus })
  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;
}

export class SearchOpportunitiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'INTERNSHIP' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: OpportunityMode })
  @IsOptional()
  @IsEnum(OpportunityMode)
  mode?: OpportunityMode;

  @ApiPropertyOptional({ example: 'TypeScript' })
  @IsOptional()
  @IsString()
  skill?: string;

  @ApiPropertyOptional({ example: 'Google' })
  @IsOptional()
  @IsString()
  organization?: string;
}

export class UpdatePersonalStatusDto {
  @ApiProperty({ enum: PersonalOpportunityStatus, default: PersonalOpportunityStatus.INTERESTED })
  @IsEnum(PersonalOpportunityStatus)
  status: PersonalOpportunityStatus;
}

export class AddOppCommentDto {
  @ApiProperty({ example: 'Does this internship accept 2nd year students?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID if replying' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
