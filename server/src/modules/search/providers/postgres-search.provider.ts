import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ISearchProvider, UnifiedSearchResult } from '../interfaces/search-provider.interface';

@Injectable()
export class PostgresSearchProvider implements ISearchProvider {
  constructor(private readonly prisma: PrismaService) {}

  async searchUnified(
    query: string,
    userId?: string,
    targetModule?: string,
    limit = 10,
  ): Promise<UnifiedSearchResult> {
    const q = query.trim();
    if (!q) {
      return {
        profiles: [],
        posts: [],
        communities: [],
        events: [],
        opportunities: [],
        organizations: [],
        messages: [],
        hashtags: [],
      };
    }

    const mod = targetModule?.toUpperCase();

    const [profiles, posts, communities, events, opportunities, organizations, messages, hashtags] =
      await Promise.all([
        !mod || mod === 'PROFILES'
          ? this.prisma.profile.findMany({
              where: {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { username: { contains: q, mode: 'insensitive' } },
                  { department: { contains: q, mode: 'insensitive' } },
                  { bio: { contains: q, mode: 'insensitive' } },
                ],
              },
              take: limit,
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                department: true,
                year: true,
              },
            })
          : [],

        !mod || mod === 'POSTS'
          ? this.prisma.post.findMany({
              where: {
                deletedAt: null,
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { content: { contains: q, mode: 'insensitive' } },
                  { tags: { hasSome: [q] } },
                ],
              },
              take: limit,
              orderBy: { createdAt: 'desc' },
              include: {
                author: {
                  select: { id: true, profile: { select: { name: true, username: true, avatarUrl: true } } },
                },
              },
            })
          : [],

        !mod || mod === 'COMMUNITIES'
          ? this.prisma.community.findMany({
              where: {
                deletedAt: null,
                isPrivate: false,
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                  { slug: { contains: q, mode: 'insensitive' } },
                  { category: { contains: q, mode: 'insensitive' } },
                ],
              },
              take: limit,
              orderBy: { memberCount: 'desc' },
            })
          : [],

        !mod || mod === 'EVENTS'
          ? this.prisma.event.findMany({
              where: {
                deletedAt: null,
                status: 'PUBLISHED',
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                  { venue: { contains: q, mode: 'insensitive' } },
                  { category: { contains: q, mode: 'insensitive' } },
                ],
              },
              take: limit,
              orderBy: { startTime: 'asc' },
            })
          : [],

        !mod || mod === 'OPPORTUNITIES'
          ? this.prisma.opportunity.findMany({
              where: {
                deletedAt: null,
                status: 'OPEN',
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                  { companyName: { contains: q, mode: 'insensitive' } },
                  { category: { contains: q, mode: 'insensitive' } },
                  { location: { contains: q, mode: 'insensitive' } },
                ],
              },
              take: limit,
              orderBy: { createdAt: 'desc' },
            })
          : [],

        !mod || mod === 'ORGANIZATIONS'
          ? this.prisma.organization.findMany({
              where: {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                ],
              },
              take: limit,
            })
          : [],

        (!mod || mod === 'MESSAGES') && userId
          ? this.prisma.message.findMany({
              where: {
                deletedAt: null,
                content: { contains: q, mode: 'insensitive' },
                conversation: {
                  deletedAt: null,
                  participants: {
                    some: { userId },
                  },
                },
              },
              take: limit,
              orderBy: { createdAt: 'desc' },
              include: {
                sender: {
                  select: { id: true, profile: { select: { name: true, username: true } } },
                },
              },
            })
          : [],

        !mod || mod === 'HASHTAGS'
          ? this.prisma.hashtag.findMany({
              where: {
                tag: { contains: q, mode: 'insensitive' },
              },
              take: limit,
              orderBy: { postCount: 'desc' },
            })
          : [],
      ]);

    return {
      profiles,
      posts,
      communities,
      events,
      opportunities,
      organizations,
      messages,
      hashtags,
    };
  }

  async autocomplete(query: string, limit = 5): Promise<string[]> {
    const q = query.trim();
    if (!q) return [];

    const [profiles, communities, events, hashtags] = await Promise.all([
      this.prisma.profile.findMany({
        where: { name: { startsWith: q, mode: 'insensitive' } },
        take: limit,
        select: { name: true },
      }),
      this.prisma.community.findMany({
        where: { name: { startsWith: q, mode: 'insensitive' } },
        take: limit,
        select: { name: true },
      }),
      this.prisma.event.findMany({
        where: { title: { startsWith: q, mode: 'insensitive' } },
        take: limit,
        select: { title: true },
      }),
      this.prisma.hashtag.findMany({
        where: { tag: { startsWith: q, mode: 'insensitive' } },
        take: limit,
        select: { tag: true },
      }),
    ]);

    const suggestions = [
      ...profiles.map((p) => p.name),
      ...communities.map((c) => c.name),
      ...events.map((e) => e.title),
      ...hashtags.map((h) => `#${h.tag}`),
    ];

    return Array.from(new Set(suggestions)).slice(0, limit);
  }
}
