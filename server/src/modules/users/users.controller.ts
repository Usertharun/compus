import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@common/guards/jwt-auth.guard";
import { RolesGuard } from "@common/guards/roles.guard";
import { Roles } from "@common/decorators/roles.decorator";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";
import { UsersService } from "./users.service";
import {
  CompleteOnboardingDto,
  UpdateProfileDto,
  UpdateUserDto,
} from "./dto/users.dto";
import { PaginationQueryDto } from "@common/dto/pagination.dto";

@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me/hub")
  @ApiOperation({ summary: "Get the active user's campus action hub" })
  async getCampusHub(@CurrentUser("id") userId: string) {
    return this.usersService.getCampusHub(userId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get paginated list of users" })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Get user by unique ID" })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Update user account details" })
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Put("profile")
  @ApiOperation({ summary: "Update active user profile" })
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post("onboarding/complete")
  @ApiOperation({ summary: "Mark onboarding flow completed for active user" })
  async completeOnboarding(
    @CurrentUser("id") userId: string,
    @Body() dto: CompleteOnboardingDto,
  ) {
    return this.usersService.completeOnboarding(userId, dto);
  }
}
