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
import { CommunitiesService } from './communities.service';
import {
  CreateCommunityDto,
  SearchCommunitiesDto,
  SubmitJoinRequestDto,
  TransferOwnershipDto,
  UpdateCommunityDto,
} from './dto/communities.dto';
import { CursorPaginationQueryDto } from '@modules/feed/dto/feed.dto';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  // --- DISCOVERY & BROWSE ---

  @Public()
  @Get('browse')
  @ApiOperation({ summary: 'Browse paginated list of campus communities' })
  async browseCommunities(@Query() dto: SearchCommunitiesDto) {
    return this.communitiesService.browseCommunities(dto);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get top trending campus communities by membership velocity' })
  async getTrendingCommunities() {
    return this.communitiesService.getTrendingCommunities();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search communities by name, category, description, and tags' })
  async searchCommunities(@Query() dto: SearchCommunitiesDto) {
    return this.communitiesService.browseCommunities(dto);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List community categories and active community counts' })
  async getCategories() {
    return this.communitiesService.getCategories();
  }

  // --- DETAILS & CRUD ---

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new campus community or student organization' })
  async createCommunity(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommunityDto,
  ) {
    return this.communitiesService.createCommunity(userId, dto);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get detailed community page with members, moderators, and statistics' })
  async getCommunityDetails(
    @Param('slug') slug: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.communitiesService.getCommunityDetails(slug, viewerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update community profile info (Owner or Moderator)' })
  async updateCommunity(
    @CurrentUser('id') userId: string,
    @Param('id') communityId: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communitiesService.updateCommunity(userId, communityId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete community (Owner or Super Admin)' })
  async deleteCommunity(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') communityId: string,
  ) {
    return this.communitiesService.deleteCommunity(userId, communityId, role);
  }

  // --- MEMBERSHIP & JOIN REQUESTS ---

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Join community (Instant for OPEN join policy)' })
  async joinCommunity(
    @CurrentUser('id') userId: string,
    @Param('id') communityId: string,
  ) {
    return this.communitiesService.joinCommunity(userId, communityId);
  }

  @Post(':id/request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit membership request (If APPROVAL_REQUIRED policy)' })
  async requestAccess(
    @CurrentUser('id') userId: string,
    @Param('id') communityId: string,
    @Body() dto: SubmitJoinRequestDto,
  ) {
    return this.communitiesService.requestAccess(userId, communityId, dto);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Leave community' })
  async leaveCommunity(
    @CurrentUser('id') userId: string,
    @Param('id') communityId: string,
  ) {
    return this.communitiesService.leaveCommunity(userId, communityId);
  }

  @Get(':id/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List pending join requests for community (Owner/Moderator)' })
  async getPendingRequests(
    @CurrentUser('id') userId: string,
    @Param('id') communityId: string,
  ) {
    return this.communitiesService.getPendingRequests(userId, communityId);
  }

  @Post('requests/:requestId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve pending join request (Owner/Moderator)' })
  async acceptJoinRequest(
    @CurrentUser('id') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.communitiesService.acceptJoinRequest(userId, requestId);
  }

  @Post('requests/:requestId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject pending join request (Owner/Moderator)' })
  async rejectJoinRequest(
    @CurrentUser('id') userId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.communitiesService.rejectJoinRequest(userId, requestId);
  }

  // --- ROLES & MODERATION ---

  @Post(':id/moderators/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Promote member to Community Moderator (Owner only)' })
  async assignModerator(
    @CurrentUser('id') ownerId: string,
    @Param('id') communityId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.communitiesService.assignModerator(ownerId, communityId, targetUserId);
  }

  @Delete(':id/moderators/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Demote Moderator to Member (Owner only)' })
  async removeModerator(
    @CurrentUser('id') ownerId: string,
    @Param('id') communityId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.communitiesService.removeModerator(ownerId, communityId, targetUserId);
  }

  @Post(':id/transfer-ownership')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Transfer community ownership (Owner only)' })
  async transferOwnership(
    @CurrentUser('id') ownerId: string,
    @Param('id') communityId: string,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.communitiesService.transferOwnership(ownerId, communityId, dto);
  }

  // --- COMMUNITY FEED INTEGRATION ---

  @Public()
  @Get(':id/feed')
  @ApiOperation({ summary: 'Get posts published inside community (Cursor-based pagination)' })
  async getCommunityFeed(
    @Param('id') communityId: string,
    @Query() dto: CursorPaginationQueryDto,
  ) {
    return this.communitiesService.getCommunityFeed(communityId, dto);
  }
}
