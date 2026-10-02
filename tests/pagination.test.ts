import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeItems, hasNextPage } from '../src/services/pagination.ts';

test('paging keeps records beyond the first 50 and replaces overlapping records without duplicates', () => {
  const first = Array.from({ length: 50 }, (_, i) => ({ id: String(i), title: 'original' }));
  const next = Array.from({ length: 50 }, (_, i) => ({ id: String(i + 49), title: 'updated' }));
  const result = mergeItems(first, next);
  assert.equal(result.length, 99);
  assert.equal(result.find(item => item.id === '49')?.title, 'updated');
  assert.equal(result.at(-1)?.id, '98');
});

test('both cursor and numbered paging stop only at the final page', () => {
  assert.equal(hasNextPage({ items: [], page: 1, totalPages: 3 }), true);
  assert.equal(hasNextPage({ items: [], page: 3, totalPages: 3 }), false);
  assert.equal(hasNextPage({ items: [], hasMore: true, nextCursor: 'next' }), true);
  assert.equal(hasNextPage({ items: [], hasMore: false }), false);
});
