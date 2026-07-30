import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

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
