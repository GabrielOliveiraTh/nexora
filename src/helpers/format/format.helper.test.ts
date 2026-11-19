import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@helpers/format/format.helper';

describe('format.helper', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats with EUR currency', () => {
      const result = formatCurrency(1000, 'EUR');
      expect(result).toContain('1,000');
    });

    it('formats large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('formats negative numbers', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
    });
  });
});
