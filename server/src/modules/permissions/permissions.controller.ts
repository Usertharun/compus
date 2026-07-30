import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { RequirePermissions } from '@common/decorators/permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PermissionsService } from './permissions.service';
import { IsNotEmpty, IsString } from 'class-validator';

class AssignPermissionDto {
  @IsString()
  @IsNotEmpty()
  permissionKey: string;
}

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('canManagePermissions')
  @ApiOperation({ summary: 'List all available system permissions' })
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get permissions assigned to a specific user' })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }

  @Post('user/:userId/assign')
  @RequirePermissions('canManagePermissions')
  @ApiOperation({ summary: 'Assign a permission to a user' })
  async assignPermission(
    @Param('userId') userId: string,
    @Body() dto: AssignPermissionDto,
    @CurrentUser('id') assignerId: string,
  ) {
    return this.permissionsService.assignPermissionToUser(userId, dto.permissionKey, assignerId);
  }

  @Delete('user/:userId/revoke/:permissionKey')
  @RequirePermissions('canManagePermissions')
  @ApiOperation({ summary: 'Revoke a permission from a user' })
  async revokePermission(
    @Param('userId') userId: string,
    @Param('permissionKey') permissionKey: string,
  ) {
    return this.permissionsService.revokePermissionFromUser(userId, permissionKey);
  }
}
