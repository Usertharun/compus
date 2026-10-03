import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from "class-validator";
import { plainToInstance } from "class-transformer";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class EnvironmentVariables {
  @IsOptional()
  @IsEmail()
  OWNER_EMAIL?: string;
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsOptional()
  API_PREFIX: string = "api/v1";

  @IsString()
  @IsOptional()
  NEON_ORG_ID?: string;

  @IsString()
  @IsOptional()
  NEON_PROJECT_ID?: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  DATABASE_URL_UNPOOLED?: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string = "localhost";

  @IsInt()
  @IsOptional()
  REDIS_PORT: number = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = "15m";

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string = "7d";

  @IsString()
  @IsOptional()
  CORS_ORIGINS: string = "http://localhost:5173,http://localhost:3000";

  @IsString()
  @IsOptional()
  APP_URL: string = "http://localhost:5173";

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsInt()
  @IsOptional()
  SMTP_PORT: number = 587;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASS?: string;

  @IsString()
  @IsOptional()
  SMTP_FROM?: string;

  @IsString()
  @IsOptional()
  BREVO_API_KEY?: string;

  @IsString()
  @IsOptional()
  BREVO_SENDER_EMAIL?: string;

  @IsString()
  @IsOptional()
  BREVO_SENDER_NAME: string = "Compus";

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_KEY?: string;

  @IsString()
  @IsOptional()
  CLOUDINARY_API_SECRET?: string;

  @IsString()
  @IsOptional()
  LOG_LEVEL: string = "info";

  @IsInt()
  @Min(64)
  @IsOptional()
  HEALTH_MAX_HEAP_MB: number = 300;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `❌ Environment Configuration Validation Error:\n${errors.map((error) => error.property + ": " + Object.values(error.constraints || {}).join(", ")).join("\n")}`,
    );
  }

  if (validatedConfig.NODE_ENV === Environment.Production) {
    for (const key of ["JWT_SECRET", "JWT_REFRESH_SECRET"] as const) {
      if (
        validatedConfig[key].length < 32 ||
        /replace|change.?me|example/i.test(validatedConfig[key])
      )
        throw new Error(
          key + " must be a unique random secret of at least 32 characters",
        );
    }
    if (validatedConfig.JWT_SECRET === validatedConfig.JWT_REFRESH_SECRET)
      throw new Error("JWT secrets must be different");
    for (const origin of [
      validatedConfig.APP_URL,
      ...validatedConfig.CORS_ORIGINS.split(","),
    ]) {
      let url: URL;
      try {
        url = new URL(origin.trim());
      } catch {
        throw new Error(
          "APP_URL and CORS_ORIGINS must contain explicit HTTPS origins",
        );
      }
      if (
        url.protocol !== "https:" ||
        url.hostname === "localhost" ||
        url.pathname !== "/" ||
        url.search ||
        url.hash ||
        url.username ||
        url.password
      )
        throw new Error(
          "APP_URL and CORS_ORIGINS must contain explicit HTTPS origins",
        );
    }
    if (!validatedConfig.DATABASE_URL_UNPOOLED)
      throw new Error("DATABASE_URL_UNPOOLED is required for migrations");
    if (
      ![
        validatedConfig.CLOUDINARY_CLOUD_NAME,
        validatedConfig.CLOUDINARY_API_KEY,
        validatedConfig.CLOUDINARY_API_SECRET,
      ].every(Boolean)
    ) {
      throw new Error("Cloudinary credentials are required in production");
    }
  }
  const cloudinary = [
    validatedConfig.CLOUDINARY_CLOUD_NAME,
    validatedConfig.CLOUDINARY_API_KEY,
    validatedConfig.CLOUDINARY_API_SECRET,
  ];
  if (cloudinary.some(Boolean) && !cloudinary.every(Boolean))
    throw new Error("All Cloudinary credentials must be configured together");
  return validatedConfig;
}
