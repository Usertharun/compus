import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { FeedService } from './feed.service';
import {
  AddCommentDto,
  CreatePostDto,
  CursorPaginationQueryDto,
  EditCommentDto,
  ReportPostDto,
  UpdatePostDto,
} from './dto/feed.dto';

@ApiTags('Campus Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // --- POSTS CRUD ---

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new campus post with media, hashtags, and mentions' })
  async createPost(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.feedService.createPost(userId, dto);
  }

  @Public()
  @Get('posts/:id')
  @ApiOperation({ summary: 'Get single post details with media and comments' })
  async getPostDetails(
    @Param('id') postId: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.feedService.getPostDetails(postId, viewerId);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update post details (Owner only)' })
  async updatePost(
    @CurrentUser('id') userId: string,
    @Param('id') postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.feedService.updatePost(userId, postId, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete post (Owner or Admin)' })
  async deletePost(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') postId: string,
  ) {
    return this.feedService.deletePost(userId, postId, role);
  }

  // --- FEED STREAMS (CURSOR PAGINATED) ---

  @Public()
  @Get('home')
  @ApiOperation({ summary: 'Get Home feed stream (Cursor-based pagination)' })
  async getHomeFeed(@Query() dto: CursorPaginationQueryDto) {
    return this.feedService.getHomeFeed(dto);
  }

  @Public()
  @Get('latest')
  @ApiOperation({ summary: 'Get Latest chronological feed (Cursor-based pagination)' })
  async getLatestFeed(@Query() dto: CursorPaginationQueryDto) {
    return this.feedService.getLatestFeed(dto);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get Trending feed by engagement velocity' })
  async getTrendingFeed(@Query() dto: CursorPaginationQueryDto) {
    return this.feedService.getTrendingFeed(dto);
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get feed of posts from followed students' })
  async getFollowingFeed(
    @CurrentUser('id') userId: string,
    @Query() dto: CursorPaginationQueryDto,
  ) {
    return this.feedService.getFollowingFeed(userId, dto);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get posts published by specific student' })
  async getUserPosts(
    @Param('userId') targetUserId: string,
    @Query() dto: CursorPaginationQueryDto,
  ) {
    return this.feedService.getUserPosts(targetUserId, dto);
  }

  // --- LIKES & BOOKMARKS ---

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like a post' })
  async likePost(@CurrentUser('id') userId: string, @Param('id') postId: string) {
    return this.feedService.likePost(postId, userId);
  }

  @Delete('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unlike a post' })
  async unlikePost(@CurrentUser('id') userId: string, @Param('id') postId: string) {
    return this.feedService.unlikePost(postId, userId);
  }

  @Post('posts/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Save post to bookmarks' })
  async bookmarkPost(@CurrentUser('id') userId: string, @Param('id') postId: string) {
    return this.feedService.bookmarkPost(postId, userId);
  }

  @Delete('posts/:id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove post from bookmarks' })
  async removeBookmark(@CurrentUser('id') userId: string, @Param('id') postId: string) {
    return this.feedService.removeBookmark(postId, userId);
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List saved posts bookmarks (Cursor-based pagination)' })
  async getUserBookmarks(
    @CurrentUser('id') userId: string,
    @Query() dto: CursorPaginationQueryDto,
  ) {
    return this.feedService.getUserBookmarks(userId, dto);
  }

  // --- COMMENTS & REPLIES ---

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add comment or nested reply to a post' })
  async addComment(
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
    @Body() dto: AddCommentDto,
  ) {
    return this.feedService.addComment(postId, userId, dto);
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Edit comment' })
  async editComment(
    @CurrentUser('id') userId: string,
    @Param('id') commentId: string,
    @Body() dto: EditCommentDto,
  ) {
    return this.feedService.editComment(userId, commentId, dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete comment' })
  async deleteComment(
    @CurrentUser('id') userId: string,
    @Param('id') commentId: string,
  ) {
    return this.feedService.deleteComment(userId, commentId);
  }

  // --- HASHTAGS ---

  @Public()
  @Get('hashtags/trending')
  @ApiOperation({ summary: 'Get top trending campus hashtags' })
  async getTrendingHashtags() {
    return this.feedService.getTrendingHashtags();
  }

  @Public()
  @Get('hashtags/search')
  @ApiOperation({ summary: 'Search hashtags' })
  async searchHashtags(@Query('q') query: string) {
    return this.feedService.searchHashtags(query || '');
  }

  @Public()
  @Get('hashtags/:tag')
  @ApiOperation({ summary: 'Get posts tagged with specific hashtag' })
  async getPostsByHashtag(
    @Param('tag') tag: string,
    @Query() dto: CursorPaginationQueryDto,
  ) {
    return this.feedService.getPostsByHashtag(tag, dto);
  }

  // --- REPORTING ---

  @Post('posts/:id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Report a post for moderation' })
  async reportPost(
    @CurrentUser('id') userId: string,
    @Param('id') postId: string,
    @Body() dto: ReportPostDto,
  ) {
    return this.feedService.reportPost(postId, userId, dto);
  }
}
