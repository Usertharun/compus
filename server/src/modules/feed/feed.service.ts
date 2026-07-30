import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { FeedRepository } from './repositories/feed.repository';
import {
  AddCommentDto,
  CreatePostDto,
  CursorPaginationQueryDto,
  EditCommentDto,
  ReportPostDto,
  UpdatePostDto,
} from './dto/feed.dto';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async createPost(userId: string, dto: CreatePostDto) {
    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestException('Post content cannot be empty');
    }

    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        title: dto.title,
        content: dto.content,
        category: dto.category || 'GENERAL',
        visibility: dto.visibility || 'PUBLIC_CAMPUS',
        tags: dto.tags || [],
        media: dto.media && dto.media.length > 0
          ? {
              create: dto.media.map((m) => ({
                url: m.url,
                type: m.type,
                fileName: m.fileName,
                fileSize: m.fileSize,
                mimeType: m.mimeType,
                caption: m.caption,
              })),
            }
          : undefined,
      },
    });

    // Parse Hashtags & Mentions asynchronously
    await Promise.all([
      this.processHashtags(post.id, dto.content, dto.tags),
      this.processMentions(post.id, dto.content),
    ]);

    this.logger.log(`Created new post: ${post.id} by author: ${userId}`, 'FeedService');

    return this.feedRepository.findPostById(post.id);
  }

  async getPostDetails(postId: string, viewerId?: string) {
    const post = await this.feedRepository.findPostById(postId);

    if (!post) {
      throw new NotFoundException(`Post with ID '${postId}' was not found`);
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    let isLiked = false;
    let isBookmarked = false;

    if (viewerId) {
      const [like, bookmark] = await Promise.all([
        this.prisma.like.findUnique({
          where: { postId_userId: { postId, userId: viewerId } },
        }),
        this.prisma.bookmark.findUnique({
          where: {
            userId_targetType_targetId: {
              userId: viewerId,
              targetType: 'POST',
              targetId: postId,
            },
          },
        }),
      ]);

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return {
      ...post,
      isLiked,
      isBookmarked,
    };
  }

  async updatePost(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException(`Post '${postId}' was not found`);
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You are not authorized to edit this post');
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.category && { category: dto.category }),
        ...(dto.visibility && { visibility: dto.visibility }),
      },
    });

    if (dto.content) {
      await this.processHashtags(postId, dto.content);
      await this.processMentions(postId, dto.content);
    }

    return this.feedRepository.findPostById(updated.id);
  }

  async deletePost(userId: string, postId: string, userRole?: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException(`Post '${postId}' was not found`);
    }

    if (post.authorId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('You are not authorized to delete this post');
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Soft deleted post: ${postId}`, 'FeedService');

    return { message: 'Post deleted successfully' };
  }

  // --- FEEDS ---

  async getLatestFeed(dto: CursorPaginationQueryDto) {
    return this.feedRepository.findLatestFeed(dto);
  }

  async getHomeFeed(dto: CursorPaginationQueryDto) {
    return this.feedRepository.findLatestFeed(dto);
  }

  async getTrendingFeed(dto: CursorPaginationQueryDto) {
    return this.feedRepository.findTrendingFeed(dto);
  }

  async getFollowingFeed(userId: string, dto: CursorPaginationQueryDto) {
    return this.feedRepository.findFollowingFeed(userId, dto);
  }

  async getUserPosts(targetUserId: string, dto: CursorPaginationQueryDto) {
    return this.feedRepository.findUserPosts(targetUserId, dto);
  }

  // --- LIKES & BOOKMARKS ---

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) throw new NotFoundException('Post not found');

    await this.feedRepository.likePost(postId, userId);
    return { success: true, message: 'Liked post' };
  }

  async unlikePost(postId: string, userId: string) {
    await this.feedRepository.unlikePost(postId, userId);
    return { success: true, message: 'Unliked post' };
  }

  async bookmarkPost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) throw new NotFoundException('Post not found');

    await this.feedRepository.addBookmark(postId, userId);
    return { success: true, message: 'Post saved to bookmarks' };
  }

  async removeBookmark(postId: string, userId: string) {
    await this.feedRepository.removeBookmark(postId, userId);
    return { success: true, message: 'Removed post from bookmarks' };
  }

  async getUserBookmarks(userId: string, dto: CursorPaginationQueryDto) {
    return this.feedRepository.findUserBookmarks(userId, dto);
  }

  // --- COMMENTS & REPLIES ---

  async addComment(postId: string, userId: string, dto: AddCommentDto) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) throw new NotFoundException('Post not found');

    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, postId, deletedAt: null },
      });
      if (!parentComment) throw new NotFoundException('Parent comment not found');
    }

    const [comment] = await Promise.all([
      this.prisma.comment.create({
        data: {
          postId,
          authorId: userId,
          content: dto.content,
          parentId: dto.parentId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              profile: { select: { name: true, username: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    return comment;
  }

  async editComment(userId: string, commentId: string, dto: EditCommentDto) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Cannot edit comment');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Cannot delete comment');

    await Promise.all([
      this.prisma.comment.update({
        where: { id: commentId },
        data: { deletedAt: new Date() },
      }),
      this.prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Comment deleted successfully' };
  }

  // --- HASHTAGS & MENTIONS ---

  async searchHashtags(query: string) {
    return this.prisma.hashtag.findMany({
      where: { tag: { contains: query.toLowerCase() } },
      take: 10,
      orderBy: { postCount: 'desc' },
    });
  }

  async getTrendingHashtags() {
    return this.prisma.hashtag.findMany({
      take: 10,
      orderBy: { postCount: 'desc' },
    });
  }

  async getPostsByHashtag(tag: string, dto: CursorPaginationQueryDto) {
    const limit = dto.limit || 10;
    const hashtag = await this.prisma.hashtag.findUnique({
      where: { tag: tag.toLowerCase() },
    });

    if (!hashtag) {
      return { items: [], nextCursor: null, hasMore: false };
    }

    const where: Record<string, unknown> = {
      hashtagId: hashtag.id,
      post: { deletedAt: null, visibility: 'PUBLIC_CAMPUS' },
    };

    if (dto.cursor) {
      where.id = { lt: dto.cursor };
    }

    const postHashtags = await this.prisma.postHashtag.findMany({
      where,
      take: limit + 1,
      orderBy: { id: 'desc' },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: { select: { name: true, username: true, avatarUrl: true } },
              },
            },
            media: true,
          },
        },
      },
    });

    const hasMore = postHashtags.length > limit;
    if (hasMore) postHashtags.pop();

    const items = postHashtags.map((ph) => ph.post);
    const nextCursor = hasMore && postHashtags.length > 0 ? postHashtags[postHashtags.length - 1].id : null;

    return { items, nextCursor, hasMore };
  }

  // --- REPORTING ---

  async reportPost(postId: string, reporterId: string, dto: ReportPostDto) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) throw new NotFoundException('Post not found');

    const report = await this.prisma.postReport.create({
      data: {
        postId,
        reporterId,
        reason: dto.reason,
        details: dto.details,
      },
    });

    this.logger.log(`Post ${postId} reported by user ${reporterId}`, 'FeedService');

    return { success: true, message: 'Report submitted for review', reportId: report.id };
  }

  // --- PRIVATE HELPER METHODS ---

  private async processHashtags(postId: string, content: string, extraTags: string[] = []) {
    const regex = /#([a-zA-Z0-9_]+)/g;
    const extractedTags = new Set<string>();

    let match;
    while ((match = regex.exec(content)) !== null) {
      extractedTags.add(match[1].toLowerCase());
    }

    for (const tag of extraTags) {
      extractedTags.add(tag.toLowerCase());
    }

    if (extractedTags.size === 0) return;

    for (const tag of extractedTags) {
      const hashtag = await this.prisma.hashtag.upsert({
        where: { tag },
        update: { postCount: { increment: 1 } },
        create: { tag, postCount: 1 },
      });

      await this.prisma.postHashtag.upsert({
        where: { postId_hashtagId: { postId, hashtagId: hashtag.id } },
        update: {},
        create: { postId, hashtagId: hashtag.id },
      });
    }
  }

  private async processMentions(postId: string, content: string) {
    const regex = /@([a-zA-Z0-9_]+)/g;
    const extractedUsernames = new Set<string>();

    let match;
    while ((match = regex.exec(content)) !== null) {
      extractedUsernames.add(match[1].toLowerCase());
    }

    if (extractedUsernames.size === 0) return;

    const mentionedProfiles = await this.prisma.profile.findMany({
      where: { username: { in: Array.from(extractedUsernames) } },
      select: { userId: true },
    });

    for (const p of mentionedProfiles) {
      await this.prisma.mention.create({
        data: {
          postId,
          mentionedUserId: p.userId,
        },
      });
    }
  }
}
