import { describe, it, expect } from 'vitest';
import { toCsv } from '@helpers/download/download.helper';

describe('toCsv (BUG-11)', () => {
  it('builds header + rows and escapes special characters', () => {
    const csv = toCsv(
      [
        { name: 'Ana', notes: 'said "hi", left', tags: ['a', 'b'] },
        { name: 'Bob', notes: null, tags: [] },
      ],
      ['name', 'notes', 'tags'],
    );
    expect(csv.split('\r\n')).toEqual([
      'name,notes,tags',
      'Ana,"said ""hi"", left",a;b',
      'Bob,,',
    ]);
  });
});
