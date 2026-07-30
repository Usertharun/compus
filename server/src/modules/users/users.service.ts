import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UpdateProfileDto, UpdateUserDto } from './dto/users.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '@common/dto/pagination.dto';
import { AppLoggerService } from '@logger/logger.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: AppLoggerService,
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

  async completeOnboarding(userId: string) {
    await this.findOne(userId);

    const updated = await this.usersRepository.update(userId, {
      onboardingCompleted: true,
    });

    return this.sanitizeUser(updated);
  }
}
