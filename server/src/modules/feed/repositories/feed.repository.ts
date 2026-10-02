import { Injectable } from "@nestjs/common";
import { Post } from "@prisma/client";
import { BaseAbstractRepository } from "@common/repositories/base.repository";
import { PrismaService } from "@database/prisma.service";
import {
  CursorPaginatedResponse,
  CursorPaginationQueryDto,
} from "../dto/feed.dto";

@Injectable()
export class FeedRepository extends BaseAbstractRepository<Post> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.post);
  }

  private postIncludeSelect() {
    return {
      author: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: {
              name: true,
              username: true,
              avatarUrl: true,
              department: true,
              year: true,
            },
          },
        },
      },
      media: true,
      hashtags: { include: { hashtag: true } },
      mentions: {
        include: {
          mentionedUser: {
            select: {
              id: true,
              email: true,
              profile: { select: { name: true, username: true } },
            },
          },
        },
      },
    };
  }

  async findPostById(id: string) {
    return this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...this.postIncludeSelect(),
        comments: {
          where: { deletedAt: null, parentId: null },
          include: {
            author: {
              select: {
                id: true,
                profile: {
                  select: { name: true, username: true, avatarUrl: true },
                },
              },
            },
            replies: {
              where: { deletedAt: null },
              include: {
                author: {
                  select: {
                    id: true,
                    profile: {
                      select: { name: true, username: true, avatarUrl: true },
                    },
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async findLatestFeed(
    dto: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResponse<Record<string, unknown>>> {
    const limit = dto.limit || 10;

    const where: Record<string, unknown> = {
      deletedAt: null,
      visibility: "PUBLIC_CAMPUS",
      ...(dto.category ? { category: dto.category } : {}),
      ...(dto.search?.trim()
        ? {
            OR: [
              { content: { contains: dto.search.trim(), mode: "insensitive" } },
              {
                author: {
                  profile: {
                    name: { contains: dto.search.trim(), mode: "insensitive" },
                  },
                },
              },
              {
                tags: {
                  has: dto.search.trim().replace(/^#/, "").toLowerCase(),
                },
              },
            ],
          }
        : {}),
    };

    if (dto.cursor) {
      const cursorPost = await this.prisma.post.findUnique({
        where: { id: dto.cursor },
        select: { createdAt: true, likeCount: true, id: true },
      });

      if (cursorPost) {
        const chronological = [
          { createdAt: { lt: cursorPost.createdAt } },
          { createdAt: cursorPost.createdAt, id: { lt: cursorPost.id } },
        ];
        where.AND = [
          {
            OR:
              dto.sort === "TRENDING"
                ? [
                    { likeCount: { lt: cursorPost.likeCount } },
                    { likeCount: cursorPost.likeCount, OR: chronological },
                  ]
                : chronological,
          },
        ];
      }
    }

    const items = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy:
        dto.sort === "TRENDING"
          ? [{ likeCount: "desc" }, { createdAt: "desc" }, { id: "desc" }]
          : [{ createdAt: "desc" }, { id: "desc" }],
      include: this.postIncludeSelect(),
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  async findTrendingFeed(
    dto: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResponse<Record<string, unknown>>> {
    const limit = dto.limit || 10;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {
      deletedAt: null,
      visibility: "PUBLIC_CAMPUS",
      createdAt: { gte: sevenDaysAgo },
    };

    if (dto.cursor) {
      const cursorPost = await this.prisma.post.findUnique({
        where: { id: dto.cursor },
        select: { likeCount: true, createdAt: true },
      });

      if (cursorPost) {
        where.OR = [
          { likeCount: { lt: cursorPost.likeCount } },
          {
            likeCount: cursorPost.likeCount,
            createdAt: { lt: cursorPost.createdAt },
          },
        ];
      }
    }

    const items = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: [
        { likeCount: "desc" },
        { commentCount: "desc" },
        { createdAt: "desc" },
      ],
      include: this.postIncludeSelect(),
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  async findFollowingFeed(
    userId: string,
    dto: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResponse<Record<string, unknown>>> {
    const limit = dto.limit || 10;

    const following = await this.prisma.follower.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId);

    const where: Record<string, unknown> = {
      deletedAt: null,
      authorId: { in: followingIds },
      visibility: "PUBLIC_CAMPUS",
    };

    if (dto.cursor) {
      const cursorPost = await this.prisma.post.findUnique({
        where: { id: dto.cursor },
        select: { createdAt: true },
      });

      if (cursorPost) {
        where.createdAt = { lt: cursorPost.createdAt };
      }
    }

    const items = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
      include: this.postIncludeSelect(),
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  async findUserPosts(
    userId: string,
    dto: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResponse<Record<string, unknown>>> {
    const limit = dto.limit || 10;

    const where: Record<string, unknown> = {
      authorId: userId,
      deletedAt: null,
      visibility: "PUBLIC_CAMPUS",
    };

    if (dto.cursor) {
      const cursorPost = await this.prisma.post.findUnique({
        where: { id: dto.cursor },
        select: { createdAt: true },
      });

      if (cursorPost) {
        where.createdAt = { lt: cursorPost.createdAt };
      }
    }

    const items = await this.prisma.post.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
      include: this.postIncludeSelect(),
    });

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  // --- INTERACTIONS & COUNTERS ---

  async likePost(postId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM posts WHERE id = ${postId} FOR UPDATE`;
      const existing = await tx.like.findUnique({
        where: { postId_userId: { postId, userId } },
      });
      if (existing) return { ...existing, created: false };
      const like = await tx.like.create({ data: { postId, userId } });
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
      return { ...like, created: true };
    });
  }

  async unlikePost(postId: string, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM posts WHERE id = ${postId} FOR UPDATE`;
      const existing = await tx.like.findUnique({
        where: { postId_userId: { postId, userId } },
      });
      if (!existing) return;
      await tx.like.delete({ where: { id: existing.id } });
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
    });
  }

  async addBookmark(postId: string, userId: string) {
    return this.prisma.bookmark.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: "POST",
          targetId: postId,
        },
      },
      update: {},
      create: {
        userId,
        targetType: "POST",
        targetId: postId,
        postId,
      },
    });
  }

  async removeBookmark(postId: string, userId: string) {
    await this.prisma.bookmark.deleteMany({
      where: {
        userId,
        targetType: "POST",
        targetId: postId,
      },
    });
  }

  async findUserBookmarks(
    userId: string,
    dto: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResponse<Record<string, unknown>>> {
    const limit = dto.limit || 10;

    const where: Record<string, unknown> = {
      userId,
      targetType: "POST",
      post: {
        deletedAt: null,
        OR: [
          { visibility: "PUBLIC_CAMPUS" },
          { authorId: userId },
          {
            visibility: "COMMUNITY_ONLY",
            community: { members: { some: { userId } } },
          },
        ],
      },
    };

    const total = await this.prisma.bookmark.count({ where });

    if (dto.cursor) {
      const cursorBM = await this.prisma.bookmark.findFirst({
        where: { id: dto.cursor, userId, targetType: 'POST' },
        select: { createdAt: true },
      });

      if (cursorBM) {
        where.OR = [{ createdAt: { lt: cursorBM.createdAt } }, { createdAt: cursorBM.createdAt, id: { gt: dto.cursor } }];
      }
    }

    const bookmarks = await this.prisma.bookmark.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: "desc" }, { id: 'asc' }],
      include: {
        post: {
          include: this.postIncludeSelect(),
        },
      },
    });

    const hasMore = bookmarks.length > limit;
    if (hasMore) bookmarks.pop();

    const items = bookmarks.map((b) => b.post).filter(Boolean) as Record<
      string,
      unknown
    >[];
    const nextCursor =
      hasMore && bookmarks.length > 0
        ? bookmarks[bookmarks.length - 1].id
        : null;

    return { items, nextCursor, hasMore, total };
  }
}
