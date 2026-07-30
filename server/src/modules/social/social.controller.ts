import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { SocialService } from './social.service';

@ApiTags('Social Graph')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('follow/:targetUserId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Follow a student' })
  async followUser(
    @CurrentUser('id') followerId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.socialService.followUser(followerId, targetUserId);
  }

  @Delete('unfollow/:targetUserId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unfollow a student' })
  async unfollowUser(
    @CurrentUser('id') followerId: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.socialService.unfollowUser(followerId, targetUserId);
  }

  @Public()
  @Get('followers/:userId')
  @ApiOperation({ summary: 'Get list of student followers' })
  async getFollowers(@Param('userId') userId: string) {
    return this.socialService.getFollowers(userId);
  }

  @Public()
  @Get('following/:userId')
  @ApiOperation({ summary: 'Get list of students followed' })
  async getFollowing(@Param('userId') userId: string) {
    return this.socialService.getFollowing(userId);
  }

  @Get('mutual/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get mutual connections between active user and target student' })
  async getMutualConnections(
    @CurrentUser('id') activeUserId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.socialService.getMutualConnections(activeUserId, targetUserId);
  }
}
