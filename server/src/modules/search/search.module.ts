import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchRepository } from './repositories/search.repository';
import { PostgresSearchProvider } from './providers/postgres-search.provider';
import { SEARCH_PROVIDER } from './interfaces/search-provider.interface';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchRepository,
    PostgresSearchProvider,
    {
      provide: SEARCH_PROVIDER,
      useClass: PostgresSearchProvider,
    },
  ],
  exports: [SearchService, SearchRepository],
})
export class SearchModule {}
