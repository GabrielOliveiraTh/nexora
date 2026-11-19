import dayjs, { type Dayjs } from 'dayjs';

const DATE_ONLY = /^(\d{4}-\d{2}-\d{2})/;

/**
 * Calendar dates (e.g. a deal's expected close date) are stored as
 * `YYYY-MM-DDT00:00:00.000Z`. They must be read and written as *date only*,
 * otherwise the local timezone shifts them by a day (UTC-3 shows the previous
 * day, UTC+9 saves the previous day).
 */
export function isoToDateOnly(iso: string | null | undefined): Dayjs | null {
  if (!iso) return null;
  const match = DATE_ONLY.exec(iso);
  if (!match) return null;
  const parsed = dayjs(match[1]); // local midnight of that calendar day
  return parsed.isValid() ? parsed : null;
}

export function dateOnlyToIso(date: Dayjs | null | undefined): string {
  if (!date || !date.isValid()) return '';
  return `${date.format('YYYY-MM-DD')}T00:00:00.000Z`;
}
