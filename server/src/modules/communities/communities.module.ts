import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';
import { CommunitiesRepository } from './repositories/communities.repository';
import { FeedModule } from '@modules/feed/feed.module';

@Module({
  imports: [FeedModule],
  controllers: [CommunitiesController],
  providers: [CommunitiesService, CommunitiesRepository],
  exports: [CommunitiesService, CommunitiesRepository],
})
export class CommunitiesModule {}
