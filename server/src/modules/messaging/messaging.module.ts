import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { MessagingRepository } from './repositories/messaging.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway, MessagingRepository],
  exports: [MessagingService, MessagingGateway, MessagingRepository],
})
export class MessagingModule {}
