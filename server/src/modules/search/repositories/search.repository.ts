import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recordSearchHistory(userId: string, query: string) {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return;

    return this.prisma.searchHistory.create({
      data: { userId, query: q },
    });
  }

  async getUserSearchHistory(userId: string, limit = 10) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, query: true, createdAt: true },
    });
  }

  async clearUserSearchHistory(userId: string) {
    await this.prisma.searchHistory.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Search history cleared' };
  }

  async incrementTrendingSearch(query: string) {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 3) return;

    return this.prisma.trendingSearch.upsert({
      where: { query: q },
      update: { searchCount: { increment: 1 } },
      create: { query: q, searchCount: 1 },
    });
  }

  async getTrendingSearches(limit = 10) {
    return this.prisma.trendingSearch.findMany({
      take: limit,
      orderBy: { searchCount: 'desc' },
      select: { query: true, searchCount: true },
    });
  }
}
