import { useRef, useMemo, useCallback, useState, type MouseEvent } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Space, Checkbox, Tooltip, Spin, Empty } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, BorderRadius } from '@styles/colors';
import { Avatar } from '@atoms/Avatar/Avatar';
import { StatusTag } from '@atoms/StatusTag/StatusTag';
import { Icon } from '@atoms/Icon/Icon';
import { Button } from '@atoms/Button/Button';
import type { Contact } from '@models/Contact.model';
import { formatDate } from '@helpers/format/format.helper';

const TableContainer = styled.div`
  border: 1px solid ${Colors.borderSecondary};
  border-radius: ${BorderRadius.lg};
  overflow: hidden;
  background: ${Colors.bgContainer};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  padding: ${Spacing.xs} ${Spacing.md};
  background: ${Colors.bgLayout};
  border-bottom: 1px solid ${Colors.borderSecondary};
  font-weight: 600;
  font-size: ${FontSize.xs};
  color: ${Colors.textSecondary};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableRow = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: ${Spacing.xs} ${Spacing.md};
  border-bottom: 1px solid ${Colors.borderSecondary};
  background: ${(props) => (props.$isSelected ? Colors.primaryBg : Colors.bgContainer)};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${(props) => (props.$isSelected ? Colors.primaryBgHover : Colors.bgLayout)};
  }
`;

const HeaderLabel = styled.span<{ $sortable: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${Spacing.xxs};
  cursor: ${(props) => (props.$sortable ? 'pointer' : 'default')};
  user-select: none;
`;

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

const Cell = styled.div<{ $width: number }>`
  width: ${(props) => props.$width}px;
  min-width: ${(props) => props.$width}px;
  padding-right: ${Spacing.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface ContactTableProps {
  contacts: Contact[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onRowClick: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  loading?: boolean;
}

export function ContactTable({
  contacts,
  selectedIds,
  onSelect,
  onRowClick,
  onEdit,
  onDelete,
  loading,
}: ContactTableProps) {
  const { t } = useTranslation(['contacts', 'label', 'common']);
  const parentRef = useRef<HTMLDivElement>(null);
  // Matches the route default (sortField=createdAt, sortOrder=descend).
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);

  // Header checkbox state is computed against the *visible* rows, crossing
  // IDs, so an active search doesn't make it lie or drop hidden selections.
  const visibleIds = useMemo(() => contacts.map((c) => c.id), [contacts]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedIds.includes(id)).length,
    [visibleIds, selectedIds],
  );
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  const handleToggleAllVisible = useCallback(
    (checked: boolean) => {
      if (checked) {
        onSelect([...new Set([...selectedIds, ...visibleIds])]);
      } else {
        const visible = new Set(visibleIds);
        onSelect(selectedIds.filter((id) => !visible.has(id)));
      }
    },
    [onSelect, selectedIds, visibleIds],
  );

  const columns = useMemo<ColumnDef<Contact>[]>(
    () => [
      {
        id: 'select',
        size: 40,
        enableSorting: false,
        header: () => (
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onClick={stopPropagation}
            onChange={(e) => handleToggleAllVisible(e.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onClick={stopPropagation}
            onChange={(e) => {
              onSelect(
                e.target.checked
                  ? [...selectedIds, row.original.id]
                  : selectedIds.filter((id) => id !== row.original.id),
              );
            }}
          />
        ),
      },
      {
        id: 'name',
        accessorFn: (c) => `${c.firstName} ${c.lastName}`,
        header: t('label:name'),
        size: 220,
        cell: ({ row }) => (
          <Space size={8}>
            <Avatar name={`${row.original.firstName} ${row.original.lastName}`} size={28} />
            <span>{row.original.firstName} {row.original.lastName}</span>
          </Space>
        ),
      },
      {
        accessorKey: 'email',
        header: t('label:email'),
        size: 240,
      },
      {
        accessorKey: 'phone',
        header: t('label:phone'),
        size: 160,
      },
      {
        accessorKey: 'jobTitle',
        header: t('label:jobTitle'),
        size: 180,
      },
      {
        accessorKey: 'status',
        header: t('common:status'),
        size: 120,
        cell: ({ row }) => (
          <StatusTag
            type="contactStatus"
            value={row.original.status}
            label={t(`contacts:status.${row.original.status}`)}
          />
        ),
      },
      {
        accessorKey: 'source',
        header: t('label:source'),
        size: 120,
        cell: ({ row }) => t(`contacts:source.${row.original.source}`),
      },
      {
        accessorKey: 'createdAt',
        header: t('common:createdAt'),
        size: 140,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'actions',
        size: 100,
        enableSorting: false,
        header: t('common:actions'),
        cell: ({ row }) => (
          <Space size={4}>
            <Tooltip title={t('common:edit')}>
              <Button
                compact
                type="text"
                icon={<Icon name="edit" fontSize="1.3rem" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.original);
                }}
              />
            </Tooltip>
            <Tooltip title={t('common:delete')}>
              <Button
                compact
                type="text"
                danger
                icon={<Icon name="delete" fontSize="1.3rem" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.original.id);
                }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [selectedIds, onSelect, onEdit, onDelete, t, allVisibleSelected, someVisibleSelected, handleToggleAllVisible],
  );

  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const handleRowClick = useCallback(
    (contact: Contact) => onRowClick(contact),
    [onRowClick],
  );

  return (
    <Spin spinning={!!loading}>
    <TableContainer>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) =>
          headerGroup.headers.map((header) => {
            if (header.isPlaceholder) return <Cell key={header.id} $width={header.getSize()} />;
            const canSort = header.column.getCanSort();
            const sorted = header.column.getIsSorted();
            let ariaSort: 'ascending' | 'descending' | 'none' | undefined;
            if (canSort) {
              if (sorted === 'asc') ariaSort = 'ascending';
              else if (sorted === 'desc') ariaSort = 'descending';
              else ariaSort = 'none';
            }
            return (
              <Cell key={header.id} $width={header.getSize()} role="columnheader" aria-sort={ariaSort}>
                <HeaderLabel
                  $sortable={canSort}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {sorted === 'asc' && <Icon name="caretUp" fontSize="1rem" />}
                  {sorted === 'desc' && <Icon name="caretDown" fontSize="1rem" />}
                </HeaderLabel>
              </Cell>
            );
          }),
        )}
      </TableHeader>

      <div
        ref={parentRef}
        style={{ height: '60rem', overflow: 'auto' }}
      >
        {rows.length === 0 && !loading && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('common:noResults')}
            style={{ paddingTop: '8rem' }}
          />
        )}
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <TableRow
                key={row.id}
                $isSelected={selectedIds.includes(row.original.id)}
                style={{
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%',
                }}
                onClick={() => handleRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <Cell
                    key={cell.id}
                    $width={cell.column.getSize()}
                    // Clicking anywhere in the checkbox cell must only toggle selection.
                    onClick={cell.column.id === 'select' ? stopPropagation : undefined}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Cell>
                ))}
              </TableRow>
            );
          })}
        </div>
      </div>
    </TableContainer>
    </Spin>
  );
}
