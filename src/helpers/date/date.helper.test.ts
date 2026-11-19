import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { isoToDateOnly, dateOnlyToIso } from '@helpers/date/date.helper';

describe('date helper (BUG-09)', () => {
  it('reads a UTC-midnight ISO as the same calendar day', () => {
    expect(isoToDateOnly('2026-12-15T00:00:00.000Z')?.format('YYYY-MM-DD')).toBe('2026-12-15');
  });

  it('writes the picked calendar day as UTC midnight', () => {
    expect(dateOnlyToIso(dayjs('2027-01-15'))).toBe('2027-01-15T00:00:00.000Z');
  });

  it('round-trips without drifting', () => {
    const iso = '2026-12-15T00:00:00.000Z';
    expect(dateOnlyToIso(isoToDateOnly(iso))).toBe(iso);
  });

  it('handles empty / invalid input', () => {
    expect(isoToDateOnly('')).toBeNull();
    expect(isoToDateOnly(null)).toBeNull();
    expect(isoToDateOnly('garbage')).toBeNull();
    expect(dateOnlyToIso(null)).toBe('');
  });
});
