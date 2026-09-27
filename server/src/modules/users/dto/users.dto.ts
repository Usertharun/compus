import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CompleteOnboardingDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  department: string;

  @Matches(/^20\d{2}$/)
  year: string;

  @IsArray()
  @ArrayMaxSize(5)
  @ArrayUnique()
  @IsIn(['mentors', 'clubs', 'jobs', 'hackathons', 'study'], { each: true })
  goals: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Alex Chen' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateProfileDto {
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

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Passionate about web apps, NestJS, and real-time systems.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'North Campus' })
  @IsOptional()
  @IsString()
  campusLocation?: string;

  @ApiPropertyOptional({ example: 'https://github.com/username' })
  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/username' })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: ['TypeScript', 'React', 'NestJS'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: ['AI', 'Web Dev', 'Robotics'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
