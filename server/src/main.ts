import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { setupSwagger } from "./config/swagger.config";
import { AppLoggerService } from "./logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useBodyParser("json", { limit: "1mb" });
  if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);
  const rawCorsOrigins = configService.get<string>(
    "CORS_ORIGINS",
    "http://localhost:5173",
  );
  const corsOrigins =
    rawCorsOrigins === "*"
      ? "*"
      : rawCorsOrigins.split(",").map((origin) => origin.trim());

  // 1. Security HTTP Headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production",
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. CORS Configuration
  app.enableCors({
    origin: corsOrigins === "*" ? [] : corsOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // 3. API Versioning & Prefix Configuration
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // 4. Global Validation Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. OpenAPI Swagger Documentation
  setupSwagger(app);

  // 6. Enable Lifecycle Graceful Shutdown
  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");

  logger.log(
    `🚀 Compus Enterprise API Server running on port: ${port}`,
    "Bootstrap",
  );
  logger.log(
    `📚 OpenAPI / Swagger documentation: http://localhost:${port}/api/docs`,
    "Bootstrap",
  );
}

bootstrap().catch((err) => {
  console.error("❌ Application bootstrap failed:", err);
  process.exit(1);
});
