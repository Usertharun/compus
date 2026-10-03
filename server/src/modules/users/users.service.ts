import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { CompleteOnboardingDto, UpdateProfileDto, UpdateUserDto } from './dto/users.dto';
import { PrismaService } from '@database/prisma.service';
import { PaginatedResponseDto, PaginationQueryDto } from '@common/dto/pagination.dto';
import { AppLoggerService } from '@logger/logger.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: AppLoggerService,
    private readonly prisma: PrismaService,
  ) {}

  private sanitizeUser(user: User) {
    const userObj = { ...user };
    delete (userObj as Record<string, unknown>).passwordHash;
    return userObj;
  }

  async findAll(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const { items, total } = await this.usersRepository.searchUsers(query.search || '', skip, limit);

    const sanitizedItems = items.map((u) => this.sanitizeUser(u));

    return new PaginatedResponseDto(sanitizedItems, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findByIdWithProfile(id);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' was not found`);
    }

    return this.sanitizeUser(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const updated = await this.usersRepository.update(id, { ...dto });
    this.logger.log(`Updated user info for ID: ${id}`, 'UsersService');

    return this.sanitizeUser(updated);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.findOne(userId);

    const profile = await this.usersRepository.updateProfile(userId, { ...dto });
    this.logger.log(`Updated profile info for user ID: ${userId}`, 'UsersService');

    return profile;
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    const labels: Record<string, string> = { mentors: 'Find Mentors', clubs: 'Join Student Orgs', jobs: 'Discover Internships', hackathons: 'Hackathons', study: 'Study Partners' };
    return this.prisma.$transaction(async tx => {
      const profile = await tx.profile.update({ where: { userId }, data: { name: dto.name, department: dto.department, year: dto.year } });
      // Only replace onboarding interests, preserving unrelated profile interests.
      await tx.userInterest.deleteMany({ where: { profileId: profile.id, interest: { name: { in: Object.values(labels) } } } });
      for (const goal of dto.goals) {
        const interest = await tx.interest.upsert({ where: { name: labels[goal] }, update: {}, create: { name: labels[goal] } });
        await tx.userInterest.create({ data: { profileId: profile.id, interestId: interest.id } });
      }
      const user = await tx.user.update({ where: { id: userId }, data: { onboardingCompleted: true }, include: { profile: true } });
      return { id: user.id, email: user.email, role: user.role, name: profile.name, onboardingCompleted: user.onboardingCompleted, profile: user.profile };
    }, { maxWait: 10000, timeout: 20000 });
  }
}
