import {
  Controller,
  Delete,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { SearchService } from './search.service';
import { AutocompleteQueryDto, SearchQueryDto } from './dto/search.dto';

@ApiTags('Global Search & Discovery Engine')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Unified multi-domain search (Profiles, Posts, Communities, Events, Opps, Orgs, Messages, Hashtags)' })
  async searchUnified(
    @Query() dto: SearchQueryDto,
    @CurrentUser('id') userId?: string,
  ) {
    return this.searchService.searchUnified(dto, userId);
  }

  @Public()
  @Get('autocomplete')
  @ApiOperation({ summary: 'Instant search bar autocomplete and prefix suggestions' })
  async autocomplete(@Query() dto: AutocompleteQueryDto) {
    return this.searchService.autocomplete(dto);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get platform top trending search queries' })
  async getTrendingSearches() {
    return this.searchService.getTrendingSearches();
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user personal search query history' })
  async getUserSearchHistory(@CurrentUser('id') userId: string) {
    return this.searchService.getUserSearchHistory(userId);
  }

  @Delete('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Clear user search query history' })
  async clearSearchHistory(@CurrentUser('id') userId: string) {
    return this.searchService.clearSearchHistory(userId);
  }

  @Public()
  @Get('discovery')
  @ApiOperation({ summary: 'Unified discovery recommendations (Suggested Profiles, Recommended Communities, Events, Opps, Posts)' })
  async getDiscoveryRecommendations() {
    return this.searchService.getDiscoveryRecommendations();
  }
}
