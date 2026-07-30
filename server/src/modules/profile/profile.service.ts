import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { ProfileRepository } from './repositories/profile.repository';
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
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async getOwnProfile(userId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile record not found');
    }

    const metrics = await this.profileRepository.getProfileMetrics(userId, profile.id);

    return {
      ...profile,
      metrics,
    };
  }

  async getPublicProfileByUsername(username: string, viewerId?: string, ipAddress?: string) {
    const profile = await this.profileRepository.findByUsername(username);

    if (!profile || !profile.user.isVerified) {
      throw new NotFoundException(`Student profile '@${username}' was not found`);
    }

    // Increment profile view count
    if (viewerId !== profile.userId) {
      await this.profileRepository.incrementViewCount(profile.id, viewerId, ipAddress);
    }

    const metrics = await this.profileRepository.getProfileMetrics(profile.userId, profile.id);

    // Apply privacy visibility filters
    const isOwner = viewerId === profile.userId;

    if (profile.visibility === 'PRIVATE' && !isOwner) {
      return {
        id: profile.id,
        username: profile.username,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,
        department: profile.department,
        year: profile.year,
        isPrivate: true,
        metrics: {
          followersCount: metrics.followersCount,
          followingCount: metrics.followingCount,
        },
      };
    }

    return {
      ...profile,
      metrics,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.profileRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundException('Profile record not found');
    }

    if (dto.username && dto.username !== existing.username) {
      const isAvailable = await this.profileRepository.isUsernameAvailable(dto.username, userId);
      if (!isAvailable) {
        throw new ConflictException(`Username '@${dto.username}' is already taken`);
      }
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...(dto.username && { username: dto.username.toLowerCase() }),
        ...(dto.name && { name: dto.name }),
        ...(dto.registerNumber !== undefined && { registerNumber: dto.registerNumber }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.section !== undefined && { section: dto.section }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.bannerUrl !== undefined && { bannerUrl: dto.bannerUrl }),
        ...(dto.campusLocation !== undefined && { campusLocation: dto.campusLocation }),
        ...(dto.portfolioUrl !== undefined && { portfolioUrl: dto.portfolioUrl }),
        ...(dto.linkedinUrl !== undefined && { linkedinUrl: dto.linkedinUrl }),
        ...(dto.githubUrl !== undefined && { githubUrl: dto.githubUrl }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
        ...(dto.visibility && { visibility: dto.visibility }),
        ...(dto.contactVisibility && { contactVisibility: dto.contactVisibility }),
        ...(dto.showSkills !== undefined && { showSkills: dto.showSkills }),
        ...(dto.showProjects !== undefined && { showProjects: dto.showProjects }),
      },
    });

    this.logger.log(`Updated profile identity for user: ${userId}`, 'ProfileService');

    return updated;
  }

  async checkUsernameAvailability(username: string, currentUserId?: string) {
    const isAvailable = await this.profileRepository.isUsernameAvailable(username, currentUserId);
    return { username: username.toLowerCase(), isAvailable };
  }

  async searchStudents(dto: SearchStudentsDto) {
    const { items, total, page, limit } = await this.profileRepository.searchProfiles(dto);
    return new PaginatedResponseDto(items, total, page, limit);
  }

  // --- SKILLS & INTERESTS ---

  async addSkill(userId: string, dto: AddSkillDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const skill = await this.prisma.skill.upsert({
      where: { name: dto.skillName.trim() },
      update: {},
      create: { name: dto.skillName.trim(), category: dto.category || 'GENERAL' },
    });

    const userSkill = await this.prisma.userSkill.upsert({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: skill.id,
        },
      },
      update: {},
      create: {
        profileId: profile.id,
        skillId: skill.id,
      },
      include: { skill: true },
    });

    return userSkill.skill;
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.userSkill.deleteMany({
      where: { profileId: profile.id, skillId },
    });

    return { message: 'Skill removed from profile' };
  }

  async addInterest(userId: string, dto: AddInterestDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const interest = await this.prisma.interest.upsert({
      where: { name: dto.interestName.trim() },
      update: {},
      create: { name: dto.interestName.trim() },
    });

    const userInterest = await this.prisma.userInterest.upsert({
      where: {
        profileId_interestId: {
          profileId: profile.id,
          interestId: interest.id,
        },
      },
      update: {},
      create: {
        profileId: profile.id,
        interestId: interest.id,
      },
      include: { interest: true },
    });

    return userInterest.interest;
  }

  async removeInterest(userId: string, interestId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.userInterest.deleteMany({
      where: { profileId: profile.id, interestId },
    });

    return { message: 'Interest removed from profile' };
  }

  // --- PROJECTS CRUD ---

  async addProject(userId: string, dto: CreateProjectDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.project.create({
      data: {
        profileId: profile.id,
        title: dto.title,
        description: dto.description,
        projectUrl: dto.projectUrl,
        githubUrl: dto.githubUrl,
        techStack: dto.techStack || [],
        startDate: dto.startDate,
        endDate: dto.endDate,
        isCurrent: dto.isCurrent || false,
      },
    });
  }

  async updateProject(userId: string, projectId: string, dto: UpdateProjectDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, profileId: profile.id },
    });

    if (!project) throw new NotFoundException('Project record not found');

    return this.prisma.project.update({
      where: { id: projectId },
      data: { ...dto },
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.project.deleteMany({
      where: { id: projectId, profileId: profile.id },
    });

    return { message: 'Project deleted successfully' };
  }

  // --- ACHIEVEMENTS CRUD ---

  async addAchievement(userId: string, dto: CreateAchievementDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.achievement.create({
      data: {
        profileId: profile.id,
        title: dto.title,
        description: dto.description,
        issuer: dto.issuer,
        dateAwarded: dto.dateAwarded,
        certificateUrl: dto.certificateUrl,
      },
    });
  }

  async updateAchievement(userId: string, achievementId: string, dto: UpdateAchievementDto) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    const achievement = await this.prisma.achievement.findFirst({
      where: { id: achievementId, profileId: profile.id },
    });

    if (!achievement) throw new NotFoundException('Achievement record not found');

    return this.prisma.achievement.update({
      where: { id: achievementId },
      data: { ...dto },
    });
  }

  async deleteAchievement(userId: string, achievementId: string) {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.achievement.deleteMany({
      where: { id: achievementId, profileId: profile.id },
    });

    return { message: 'Achievement deleted successfully' };
  }
}
