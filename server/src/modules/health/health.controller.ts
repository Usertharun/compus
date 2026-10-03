import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from "@nestjs/terminus";
import { Public } from "@common/decorators/public.decorator";
import { PrismaService } from "@database/prisma.service";
import { ConfigService } from "@nestjs/config";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary:
      "Check infrastructure health (Database, Memory, HTTP connectivity)",
  })
  check() {
    return this.health.check([
      () =>
        this.prismaIndicator.pingCheck("database", this.prisma, {
          timeout: 5000,
        }),
      () =>
        this.memory.checkHeap(
          "memory_heap",
          this.config.get<number>("HEALTH_MAX_HEAP_MB", 300) * 1024 * 1024,
        ),
    ]);
  }
}
