import { describe, it, expect } from 'vitest';
import { contactsSearchSchema, dealsSearchSchema, dashboardSearchSchema } from '@router/search/schemas';
import { parseSearch } from '@router/search/serializer';

describe('search schemas (BUG-06)', () => {
  it('treats a numeric search as text', () => {
    expect(contactsSearchSchema.parse(parseSearch('?search=123')).search).toBe('123');
  });

  it('falls back to defaults for out-of-range values', () => {
    expect(contactsSearchSchema.parse(parseSearch('?page=0')).page).toBe(1);
    expect(contactsSearchSchema.parse(parseSearch('?pageSize=7')).pageSize).toBe(25);
    expect(contactsSearchSchema.parse(parseSearch('?sortOrder=sideways')).sortOrder).toBe('descend');
    expect(contactsSearchSchema.parse(parseSearch('?status=nope')).status).toBeUndefined();
    expect(dealsSearchSchema.parse(parseSearch('?view=foo')).view).toBe('pipeline');
    expect(dashboardSearchSchema.parse(parseSearch('?period=2w')).period).toBe('30d');
  });

  it('keeps valid values and defaults', () => {
    expect(contactsSearchSchema.parse(parseSearch('?page=3&pageSize=50'))).toMatchObject({ page: 3, pageSize: 50 });
    expect(contactsSearchSchema.parse({})).toEqual({
      page: 1,
      pageSize: 25,
      search: '',
      status: undefined,
      source: undefined,
      sortField: 'createdAt',
      sortOrder: 'descend',
    });
    expect(dealsSearchSchema.parse({}).view).toBe('pipeline');
  });
});
