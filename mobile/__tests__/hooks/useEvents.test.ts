/**
 * useEvents Hook Tests
 * Tests for TanStack Query key factories and hook configuration
 */

import { eventKeys } from '@hooks/useEvents';

// ─────────────────────────────────────────────────────────────────────────────
// Query key factory tests do not need a QueryClient or component rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('eventKeys', () => {
  describe('all', () => {
    it('is the root key tuple', () => {
      expect(eventKeys.all).toEqual(['events']);
    });
  });

  describe('lists()', () => {
    it('returns a key scoped to lists', () => {
      expect(eventKeys.lists()).toEqual(['events', 'list']);
    });

    it('returns a new array reference each call (immutable spread)', () => {
      const a = eventKeys.lists();
      const b = eventKeys.lists();
      expect(a).toEqual(b);
      expect(a).not.toBe(b); // different array instances
    });
  });

  describe('detail(slug)', () => {
    it('includes the slug in the key', () => {
      expect(eventKeys.detail('my-event')).toEqual([
        'events',
        'detail',
        'my-event',
      ]);
    });

    it('generates different keys for different slugs', () => {
      expect(eventKeys.detail('slug-a')).not.toEqual(
        eventKeys.detail('slug-b'),
      );
    });

    it('generates consistent keys for the same slug', () => {
      expect(eventKeys.detail('same')).toEqual(eventKeys.detail('same'));
    });

    it('handles empty string slug', () => {
      expect(eventKeys.detail('')).toEqual(['events', 'detail', '']);
    });
  });

  describe('search(query)', () => {
    it('includes the query in the key', () => {
      expect(eventKeys.search('react native')).toEqual([
        'events',
        'search',
        'react native',
      ]);
    });

    it('generates different keys for different queries', () => {
      expect(eventKeys.search('foo')).not.toEqual(eventKeys.search('bar'));
    });

    it('generates consistent keys for the same query', () => {
      expect(eventKeys.search('test')).toEqual(eventKeys.search('test'));
    });

    it('handles empty string query', () => {
      expect(eventKeys.search('')).toEqual(['events', 'search', '']);
    });
  });

  describe('key hierarchy', () => {
    it('detail key starts with all key', () => {
      const all = eventKeys.all;
      const detail = eventKeys.detail('slug');
      expect(detail.slice(0, all.length)).toEqual(Array.from(all));
    });

    it('search key starts with all key', () => {
      const all = eventKeys.all;
      const search = eventKeys.search('q');
      expect(search.slice(0, all.length)).toEqual(Array.from(all));
    });

    it('lists key starts with all key', () => {
      const all = eventKeys.all;
      const lists = eventKeys.lists();
      expect(lists.slice(0, all.length)).toEqual(Array.from(all));
    });
  });
});
