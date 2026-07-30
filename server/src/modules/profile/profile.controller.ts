import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import {
  AddInterestDto,
  AddSkillDto,
  CreateAchievementDto,
  CreateProjectDto,
  SearchStudentsDto,
  UpdateAchievementDto,
  UpdateProfileDto,
  UpdateProjectDto,
} from './dto/profile.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get active authenticated student profile with identity metrics' })
  async getOwnProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getOwnProfile(userId);
  }

  @Public()
  @Get('check-username/:username')
  @ApiOperation({ summary: 'Check if username is available for registration/update' })
  async checkUsername(@Param('username') username: string) {
    return this.profileService.checkUsernameAvailability(username);
  }

  @Public()
  @Get(':username')
  @ApiOperation({ summary: 'Get public student profile by @username with privacy rules' })
  async getPublicProfile(
    @Param('username') username: string,
    @CurrentUser('id') viewerId?: string,
    @Ip() ip?: string,
  ) {
    return this.profileService.getPublicProfileByUsername(username, viewerId, ip);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update active student profile details & privacy settings' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Public()
  @Post('search')
  @ApiOperation({ summary: 'Discover and search student profiles across campus' })
  async searchStudents(@Body() dto: SearchStudentsDto) {
    return this.profileService.searchStudents(dto);
  }

  // --- SKILLS & INTERESTS ---

  @Post('skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add skill to student profile' })
  async addSkill(@CurrentUser('id') userId: string, @Body() dto: AddSkillDto) {
    return this.profileService.addSkill(userId, dto);
  }

  @Delete('skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove skill from student profile' })
  async removeSkill(@CurrentUser('id') userId: string, @Param('skillId') skillId: string) {
    return this.profileService.removeSkill(userId, skillId);
  }

  @Post('interests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add interest to student profile' })
  async addInterest(@CurrentUser('id') userId: string, @Body() dto: AddInterestDto) {
    return this.profileService.addInterest(userId, dto);
  }

  @Delete('interests/:interestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove interest from student profile' })
  async removeInterest(@CurrentUser('id') userId: string, @Param('interestId') interestId: string) {
    return this.profileService.removeInterest(userId, interestId);
  }

  // --- PROJECTS CRUD ---

  @Post('projects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add portfolio project to student profile' })
  async addProject(@CurrentUser('id') userId: string, @Body() dto: CreateProjectDto) {
    return this.profileService.addProject(userId, dto);
  }

  @Patch('projects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update portfolio project' })
  async updateProject(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.profileService.updateProject(userId, projectId, dto);
  }

  @Delete('projects/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete portfolio project' })
  async deleteProject(@CurrentUser('id') userId: string, @Param('id') projectId: string) {
    return this.profileService.deleteProject(userId, projectId);
  }

  // --- ACHIEVEMENTS CRUD ---

  @Post('achievements')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add achievement / certificate to student profile' })
  async addAchievement(@CurrentUser('id') userId: string, @Body() dto: CreateAchievementDto) {
    return this.profileService.addAchievement(userId, dto);
  }

  @Patch('achievements/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update achievement' })
  async updateAchievement(
    @CurrentUser('id') userId: string,
    @Param('id') achievementId: string,
    @Body() dto: UpdateAchievementDto,
  ) {
    return this.profileService.updateAchievement(userId, achievementId, dto);
  }

  @Delete('achievements/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete achievement' })
  async deleteAchievement(
    @CurrentUser('id') userId: string,
    @Param('id') achievementId: string,
  ) {
    return this.profileService.deleteAchievement(userId, achievementId);
  }
}
