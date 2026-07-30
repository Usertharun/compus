export interface UnifiedSearchResult {
  profiles: Array<Record<string, unknown>>;
  posts: Array<Record<string, unknown>>;
  communities: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  opportunities: Array<Record<string, unknown>>;
  organizations: Array<Record<string, unknown>>;
  messages: Array<Record<string, unknown>>;
  hashtags: Array<Record<string, unknown>>;
}

export interface ISearchProvider {
  searchUnified(query: string, userId?: string, targetModule?: string, limit?: number): Promise<UnifiedSearchResult>;
  autocomplete(query: string, limit?: number): Promise<string[]>;
}

export const SEARCH_PROVIDER = 'SEARCH_PROVIDER';
