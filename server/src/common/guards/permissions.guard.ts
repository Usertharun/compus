import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@database/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.id) {
      throw new ForbiddenException('User context missing for permission check');
    }

    // SUPER_ADMIN has full system control
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Fetch user permissions from database
    const userPermissionRecords = await this.prisma.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    });

    const userPermissionKeys = new Set(userPermissionRecords.map((up) => up.permission.key));

    const hasAllPermissions = requiredPermissions.every((perm) => userPermissionKeys.has(perm));

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Access denied. Required permission(s): [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
