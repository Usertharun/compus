import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Compus API')
    .setDescription('Enterprise Production API documentation for Compus Campus Platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT Authorization',
        description: 'Enter JWT Bearer Token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'User Authentication & Token Lifecycle')
    .addTag('Users', 'User Profile & Account Management')
    .addTag('Health', 'Infrastructure & Database Health Check Endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
    customSiteTitle: 'Compus API Swagger Documentation',
  });
}
