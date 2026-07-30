import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ISearchProvider, SEARCH_PROVIDER } from './interfaces/search-provider.interface';
import { SearchRepository } from './repositories/search.repository';
import { AutocompleteQueryDto, SearchQueryDto } from './dto/search.dto';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class SearchService {
  constructor(
    @Inject(SEARCH_PROVIDER) private readonly searchProvider: ISearchProvider,
    private readonly searchRepository: SearchRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async searchUnified(dto: SearchQueryDto, userId?: string) {
    const results = await this.searchProvider.searchUnified(
      dto.q,
      userId,
      dto.module,
      dto.limit,
    );

    // Asynchronously log search history and increment trending keyword
    if (dto.q && dto.q.trim().length >= 2) {
      if (userId) {
        this.searchRepository.recordSearchHistory(userId, dto.q).catch(() => {});
      }
      this.searchRepository.incrementTrendingSearch(dto.q).catch(() => {});
    }

    this.logger.log(`Unified search executed for query '${dto.q}' (module: ${dto.module || 'ALL'})`, 'SearchService');

    return results;
  }

  async autocomplete(dto: AutocompleteQueryDto) {
    return this.searchProvider.autocomplete(dto.q, dto.limit);
  }

  async getTrendingSearches() {
    return this.searchRepository.getTrendingSearches(10);
  }

  async getUserSearchHistory(userId: string) {
    return this.searchRepository.getUserSearchHistory(userId, 10);
  }

  async clearSearchHistory(userId: string) {
    return this.searchRepository.clearUserSearchHistory(userId);
  }

  async getDiscoveryRecommendations() {
    const [recommendedCommunities, recommendedEvents, suggestedProfiles, trendingOpportunities, popularPosts] =
      await Promise.all([
        this.prisma.community.findMany({
          where: { deletedAt: null, isPrivate: false },
          take: 5,
          orderBy: { memberCount: 'desc' },
        }),
        this.prisma.event.findMany({
          where: { deletedAt: null, status: 'PUBLISHED' },
          take: 5,
          orderBy: { rsvpCount: 'desc' },
        }),
        this.prisma.profile.findMany({
          take: 5,
          orderBy: { viewCount: 'desc' },
          select: { id: true, name: true, username: true, avatarUrl: true, department: true, year: true },
        }),
        this.prisma.opportunity.findMany({
          where: { deletedAt: null, status: 'OPEN' },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.post.findMany({
          where: { deletedAt: null },
          take: 5,
          orderBy: { likeCount: 'desc' },
          include: {
            author: {
              select: { id: true, profile: { select: { name: true, username: true, avatarUrl: true } } },
            },
          },
        }),
      ]);

    return {
      recommendedCommunities,
      recommendedEvents,
      suggestedProfiles,
      trendingOpportunities,
      popularPosts,
    };
  }
}
