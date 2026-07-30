import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({ example: 'Artificial Intelligence' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ description: 'Filter by specific domain (PROFILES, POSTS, COMMUNITIES, EVENTS, OPPORTUNITIES, ORGANIZATIONS, MESSAGES)' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class AutocompleteQueryDto {
  @ApiPropertyOptional({ example: 'Ai' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number = 5;
}
