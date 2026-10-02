import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  NotFoundException,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import { IsString, MaxLength } from "class-validator";
import { Response } from "express";
import { PrismaService } from "@database/prisma.service";
import { Public } from "@common/decorators/public.decorator";
import { CurrentUser } from "@common/decorators/current-user.decorator";
class UploadImageDto {
  @IsString()
  @MaxLength(700000)
  data: string;
}
@Controller("uploads")
export class UploadsController {
  constructor(private readonly prisma: PrismaService) {}
  @Post("images")
  async upload(
    @CurrentUser("id") ownerId: string,
    @Body() dto: UploadImageDto,
  ) {
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(
      dto.data,
    );
    if (!match)
      throw new BadRequestException("Upload a JPEG, PNG, or WebP image.");
    const content = Buffer.from(match[2], "base64");
    if (!content.length || content.length > 500000)
      throw new BadRequestException("Image must be smaller than 500 KB.");
    const mimeType = "image/" + match[1];
    const valid =
      match[1] === "jpeg"
        ? content[0] === 0xff && content[1] === 0xd8
        : match[1] === "png"
          ? content
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : content.subarray(0, 4).toString() === "RIFF" &&
            content.subarray(8, 12).toString() === "WEBP";
    if (!valid) throw new BadRequestException("Invalid image format.");
    const asset = await this.prisma.imageAsset.create({
      data: { ownerId, content, mimeType },
      select: { id: true },
    });
    return { path: "/uploads/images/" + asset.id };
  }
  @Public()
  @Get("images/:id")
  async image(@Param("id") id: string, @Res() response: Response) {
    const asset = await this.prisma.imageAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException("Image not found.");
    response.setHeader("Content-Type", asset.mimeType);
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    response.send(Buffer.from(asset.content));
  }
}
@Module({ controllers: [UploadsController] })
export class UploadsModule {}
