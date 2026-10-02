import { Body, Controller, Get, Module, Post } from "@nestjs/common";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { PrismaService } from "@database/prisma.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { Transform } from "class-transformer";
class FeedbackDto {
  @IsIn(["BUG", "IDEA", "OTHER"]) category: string;
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;
  @IsString() @MaxLength(300) page: string;
}
@Controller("feedback")
class FeedbackController {
  constructor(private readonly prisma: PrismaService) {}
  @Post() async submit(
    @CurrentUser("id") userId: string,
    @Body() dto: FeedbackDto,
  ) {
    const entry = await this.prisma.feedback.create({
      data: {
        userId,
        category: dto.category,
        message: dto.message.trim(),
        page: dto.page,
      },
    });
    return { id: entry.id, message: "Feedback saved. Thank you." };
  }
  @Get() @Roles(UserRole.SUPER_ADMIN) async list() {
    return this.prisma.feedback.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { name: true } },
          },
        },
      },
    });
  }
}
@Module({ controllers: [FeedbackController] })
export class FeedbackModule {}
