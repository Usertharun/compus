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
import { EventsService } from './events.service';
import {
  AddEventCommentDto,
  ChangeEventStatusDto,
  CreateEventDto,
  SearchEventsDto,
  UpdateEventDto,
} from './dto/events.dto';

@ApiTags('Event Management')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // --- DISCOVERY & SEARCH ---

  @Public()
  @Get('browse')
  @ApiOperation({ summary: 'Browse paginated campus events with category, location, and date filters' })
  async browseEvents(@Query() dto: SearchEventsDto) {
    return this.eventsService.browseEvents(dto);
  }

  @Public()
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming campus events' })
  async getUpcomingEvents() {
    return this.eventsService.getUpcomingEvents();
  }

  @Public()
  @Get('ongoing')
  @ApiOperation({ summary: 'Get currently ongoing campus events' })
  async getOngoingEvents() {
    return this.eventsService.getOngoingEvents();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get list of event categories and event counts' })
  async getCategories() {
    return this.eventsService.getCategories();
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user saved event bookmarks' })
  async getUserBookmarks(@CurrentUser('id') userId: string) {
    return this.eventsService.getUserBookmarks(userId);
  }

  // --- DETAILS & CRUD ---

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new campus event or community workshop' })
  async createEvent(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.createEvent(userId, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get detailed event page with organizer, venue, RSVP status, and comments' })
  async getEventDetails(
    @Param('id') eventId: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.eventsService.getEventDetails(eventId, viewerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update event details (Organizer only)' })
  async updateEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(userId, eventId, dto);
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change event lifecycle status with audit logging (Organizer only)' })
  async changeEventStatus(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
    @Body() dto: ChangeEventStatusDto,
  ) {
    return this.eventsService.changeEventStatus(userId, eventId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete event (Organizer or Super Admin)' })
  async deleteEvent(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.deleteEvent(userId, eventId, role);
  }

  // --- REGISTRATION & WAITLIST ---

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register for event (Auto-assigns WAITLISTED if capacity is full)' })
  async registerEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.registerEvent(userId, eventId);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel event registration (Auto-promotes next candidate from waitlist)' })
  async cancelRegistration(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.cancelRegistration(userId, eventId);
  }

  // --- COMMENTS & BOOKMARKS ---

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add comment or nested reply to event' })
  async addComment(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
    @Body() dto: AddEventCommentDto,
  ) {
    return this.eventsService.addComment(eventId, userId, dto);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete comment' })
  async deleteComment(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.eventsService.deleteComment(userId, commentId);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Save event to bookmarks' })
  async bookmarkEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.bookmarkEvent(eventId, userId);
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove event from bookmarks' })
  async removeBookmark(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.removeBookmark(eventId, userId);
  }
}
