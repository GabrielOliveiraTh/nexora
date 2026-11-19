import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { ContactTable } from '@organisms/ContactTable/ContactTable';
import { mockContacts } from '@mock/contacts.mock';
import type { Contact } from '@models/Contact.model';
import '@config/i18n/config';

// jsdom has no layout: give the virtualized scroll area a size so rows render.
const sizeProps = ['clientHeight', 'clientWidth', 'offsetHeight', 'offsetWidth'] as const;
const originals = sizeProps.map((p) => Object.getOwnPropertyDescriptor(HTMLElement.prototype, p));
beforeAll(() => {
  for (const p of sizeProps) {
    Object.defineProperty(HTMLElement.prototype, p, { configurable: true, get: () => (p.endsWith('Height') ? 600 : 1200) });
  }
});
afterAll(() => {
  sizeProps.forEach((p, i) => {
    const original = originals[i];
    if (original) Object.defineProperty(HTMLElement.prototype, p, original);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)[p];
  });
});

function Harness({ contacts, initialSelected = [], onRowClick = vi.fn() }: {
  contacts: Contact[];
  initialSelected?: string[];
  onRowClick?: (c: Contact) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  return (
    <>
      <output data-testid="selected">{selected.join(',')}</output>
      <ContactTable
        contacts={contacts}
        selectedIds={selected}
        onSelect={setSelected}
        onRowClick={onRowClick}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    </>
  );
}

const selected = () => screen.getByTestId('selected').textContent?.split(',').filter(Boolean) ?? [];
const rowFor = (name: string) => screen.getByText(name).closest('[class]')?.parentElement?.closest('div[style*="translateY"]') as HTMLElement;

describe('ContactTable', () => {
  it('clicking a row checkbox selects without opening the drawer (BUG-07)', () => {
    const onRowClick = vi.fn();
    render(<Harness contacts={mockContacts} onRowClick={onRowClick} />);
    const row = rowFor('Carlos Mendes');
    fireEvent.click(within(row).getByRole('checkbox'));
    expect(selected()).toEqual([mockContacts[1].id]);
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.click(within(row).getByText('Carlos Mendes'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('header checkbox reflects visible rows and only toggles them (BUG-14)', () => {
    const visible = mockContacts.filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes('ana'));
    expect(visible.length).toBe(2);
    render(<Harness contacts={visible} initialSelected={mockContacts.map((c) => c.id)} />);

    const header = screen.getAllByRole('checkbox')[0];
    expect(header).toBeChecked();

    fireEvent.click(header);
    expect(selected()).toHaveLength(4);
    expect(selected().some((id) => visible.some((v) => v.id === id))).toBe(false);
  });

  it('sorts by full name when clicking the Name header (BUG-08)', () => {
    render(<Harness contacts={mockContacts} />);
    const names = () =>
      mockContacts
        .map((c) => `${c.firstName} ${c.lastName}`)
        .map((n) => ({ n, top: Number(/translateY\((\d+)px\)/.exec(rowFor(n).style.transform)?.[1]) }))
        .sort((a, b) => a.top - b.top)
        .map((x) => x.n);

    fireEvent.click(screen.getByText('Name'));
    const asc = names();
    expect(asc).toEqual([...asc].sort((a, b) => a.localeCompare(b)));
    expect(screen.getByText('Name').closest('[role="columnheader"]')).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(screen.getByText('Name'));
    expect(names()).toEqual([...asc].reverse());
  });

  it('shows an empty state when there are no rows', () => {
    render(<Harness contacts={[]} />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});
