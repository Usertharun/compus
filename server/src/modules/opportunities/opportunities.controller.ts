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
import { OpportunitiesService } from './opportunities.service';
import {
  AddOppCommentDto,
  CreateOpportunityDto,
  SearchOpportunitiesDto,
  UpdateOpportunityDto,
  UpdatePersonalStatusDto,
} from './dto/opportunities.dto';

@ApiTags('Opportunities Hub')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  // --- DISCOVERY & SEARCH ---

  @Public()
  @Get('browse')
  @ApiOperation({ summary: 'Browse paginated opportunities with category, mode, skills, and org filters' })
  async browseOpportunities(@Query() dto: SearchOpportunitiesDto) {
    return this.opportunitiesService.browseOpportunities(dto);
  }

  @Public()
  @Get('latest')
  @ApiOperation({ summary: 'Get latest posted opportunities' })
  async getLatestOpportunities() {
    return this.opportunitiesService.getLatestOpportunities();
  }

  @Public()
  @Get('expiring-soon')
  @ApiOperation({ summary: 'Get opportunities nearing application deadline' })
  async getExpiringSoon() {
    return this.opportunitiesService.getExpiringSoon();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get list of opportunity categories and active posting counts' })
  async getCategories() {
    return this.opportunitiesService.getCategories();
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List student tracked personal applications and saved statuses' })
  async getUserApplications(@CurrentUser('id') userId: string) {
    return this.opportunitiesService.getUserApplications(userId);
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user saved opportunity bookmarks' })
  async getUserBookmarks(@CurrentUser('id') userId: string) {
    return this.opportunitiesService.getUserBookmarks(userId);
  }

  // --- DETAILS & CRUD ---

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new career, hackathon, or internship opportunity' })
  async createOpportunity(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.createOpportunity(userId, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get detailed opportunity view with organization, eligibility, and comments' })
  async getOpportunityDetails(
    @Param('id') opportunityId: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.opportunitiesService.getOpportunityDetails(opportunityId, viewerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update opportunity posting (Creator only)' })
  async updateOpportunity(
    @CurrentUser('id') userId: string,
    @Param('id') opportunityId: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.updateOpportunity(userId, opportunityId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete opportunity (Creator or Super Admin)' })
  async deleteOpportunity(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') opportunityId: string,
  ) {
    return this.opportunitiesService.deleteOpportunity(userId, opportunityId, role);
  }

  // --- PERSONAL STATUS TRACKING ---

  @Post(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark personal student status (INTERESTED, APPLIED, COMPLETED)' })
  async setPersonalStatus(
    @CurrentUser('id') userId: string,
    @Param('id') opportunityId: string,
    @Body() dto: UpdatePersonalStatusDto,
  ) {
    return this.opportunitiesService.setPersonalStatus(userId, opportunityId, dto);
  }

  @Delete(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove personal student opportunity tracking status' })
  async removePersonalStatus(
    @CurrentUser('id') userId: string,
    @Param('id') opportunityId: string,
  ) {
    return this.opportunitiesService.removePersonalStatus(userId, opportunityId);
  }

  // --- COMMENTS & BOOKMARKS ---

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add comment or nested reply to opportunity' })
  async addComment(
    @CurrentUser('id') userId: string,
    @Param('id') opportunityId: string,
    @Body() dto: AddOppCommentDto,
  ) {
    return this.opportunitiesService.addComment(opportunityId, userId, dto);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete comment' })
  async deleteComment(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.opportunitiesService.deleteComment(userId, commentId);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Save opportunity to bookmarks' })
  async bookmarkOpportunity(
    @CurrentUser('id') userId: string,
    @Param('id') opportunityId: string,
  ) {
    return this.opportunitiesService.bookmarkOpportunity(opportunityId, userId);
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove opportunity from bookmarks' })
  async removeBookmark(
    @CurrentUser('id') userId: string,
    @Param('id') opportunityId: string,
  ) {
    return this.opportunitiesService.removeBookmark(opportunityId, userId);
  }
}
