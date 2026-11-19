import { useState, useCallback, useMemo } from 'react';
import type { Contact } from '@models/Contact.model';
import type { ContactStatus, ContactSource } from '@models/Contact.model';

interface ContactSearchFilters {
  search: string;
  status: ContactStatus | null;
  source: ContactSource | null;
  ownerId: string | null;
  tags: string[];
}

const defaultFilters: ContactSearchFilters = {
  search: '',
  status: null,
  source: null,
  ownerId: null,
  tags: [],
};

export function useContactSearch(contacts: Contact[]) {
  const [filters, setFilters] = useState<ContactSearchFilters>(defaultFilters);

  const updateFilter = useCallback(<K extends keyof ContactSearchFilters>(
    key: K,
    value: ContactSearchFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchLower);
        const matchesEmail = contact.email.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesEmail) return false;
      }
      if (filters.status && contact.status !== filters.status) return false;
      if (filters.source && contact.source !== filters.source) return false;
      if (filters.ownerId && contact.ownerId !== filters.ownerId) return false;
      if (filters.tags.length > 0 && !filters.tags.some((t) => contact.tags.includes(t))) return false;
      return true;
    });
  }, [contacts, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (filters.source) count++;
    if (filters.ownerId) count++;
    if (filters.tags.length > 0) count++;
    return count;
  }, [filters]);

  return { filters, updateFilter, resetFilters, filteredContacts, activeFilterCount };
}
