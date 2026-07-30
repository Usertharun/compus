import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async getUserPermissions(userId: string) {
    const userPermissions = await this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    return userPermissions.map((up) => up.permission);
  }

  async assignPermissionToUser(userId: string, permissionKey: string, assignerId?: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { key: permissionKey },
    });

    if (!permission) {
      throw new NotFoundException(`Permission key '${permissionKey}' was not found`);
    }

    const existing = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`User already possesses permission '${permissionKey}'`);
    }

    const record = await this.prisma.userPermission.create({
      data: {
        userId,
        permissionId: permission.id,
        assignedById: assignerId,
      },
      include: { permission: true },
    });

    this.logger.log(`Granted permission '${permissionKey}' to user: ${userId}`, 'PermissionsService');

    return record.permission;
  }

  async revokePermissionFromUser(userId: string, permissionKey: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { key: permissionKey },
    });

    if (!permission) {
      throw new NotFoundException(`Permission key '${permissionKey}' was not found`);
    }

    await this.prisma.userPermission.deleteMany({
      where: {
        userId,
        permissionId: permission.id,
      },
    });

    this.logger.log(`Revoked permission '${permissionKey}' from user: ${userId}`, 'PermissionsService');

    return { message: `Permission '${permissionKey}' revoked successfully` };
  }
}
