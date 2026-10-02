import type { Page } from './models';

export function mergeItems<T extends { id: string | number }>(previous: T[], incoming: T[]): T[] {
  const items = new Map(previous.map(item => [item.id, item]));
  incoming.forEach(item => items.set(item.id, item));
  return [...items.values()];
}

export function hasNextPage(page: Page<unknown>): boolean {
  return page.hasMore ?? ((page.page ?? 1) < (page.totalPages ?? 1));
}
