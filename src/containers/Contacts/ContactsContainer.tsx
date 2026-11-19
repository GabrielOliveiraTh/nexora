import { useCallback, useMemo } from 'react';
import { Space, Dropdown, App, Popover, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@hooks/useAppStore';
import { useContactSearch } from '@hooks/useContactSearch';
import { useSocket } from '@hooks/useSocket';
import { Spacing } from '@styles/colors';
import { deleteContact } from '@redux/contacts/actions';
import { selectContactsList, selectSelectedContactIds, setSelectedContacts } from '@redux/contacts/slice';
import { contactUpdatedViaSocket, contactDeletedViaSocket } from '@redux/contacts/slice';
import { openContactDrawer } from '@redux/ui/slice';
import { ContactTable } from '@organisms/ContactTable/ContactTable';
import { SearchInput } from '@atoms/SearchInput/SearchInput';
import { Button } from '@atoms/Button/Button';
import { Icon } from '@atoms/Icon/Icon';
import { GrantChildrenHOC } from '@HOC/GrantChildrenHOC';
import { ContactStatus, ContactSource, type Contact } from '@models/Contact.model';
import { enqueueDownload, downloadCsv } from '@helpers/download/download.helper';
import { useAuth } from '@context/AuthContext/AuthContext';

const EXPORT_COLUMNS = [
  'id', 'firstName', 'lastName', 'email', 'phone', 'jobTitle', 'status', 'source',
  'companyId', 'ownerId', 'tags', 'notes', 'lastContactedAt', 'createdAt', 'updatedAt',
] as const satisfies readonly (keyof Contact)[];

export function ContactsContainer() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['contacts', 'common', 'label']);
  const { modal, message } = App.useApp();
  const { user } = useAuth();
  const users = useAppSelector((state) => state.users.items);
  const contacts = useAppSelector(selectContactsList);
  const selectedIds = useAppSelector(selectSelectedContactIds);

  const { filters, updateFilter, resetFilters, filteredContacts, activeFilterCount } = useContactSearch(contacts);

  const tagOptions = useMemo(
    () => [...new Set(contacts.flatMap((c) => c.tags))].sort().map((tag) => ({ value: tag, label: tag })),
    [contacts],
  );

  const ownerOptions = useMemo(
    () =>
      [...new Set(contacts.map((c) => c.ownerId).filter(Boolean))].map((id) => ({
        value: id,
        label: users[id]?.name ?? (id === user?.id ? user.name : id),
      })),
    [contacts, users, user],
  );

  useSocket<Contact>('contacts', 'contact:updated', (contact) => {
    dispatch(contactUpdatedViaSocket(contact));
  });

  useSocket<string>('contacts', 'contact:deleted', (id) => {
    dispatch(contactDeletedViaSocket(id));
  });

  const handleRowClick = useCallback(
    (contact: Contact) => {
      dispatch(openContactDrawer({ mode: 'view', entityId: contact.id }));
    },
    [dispatch],
  );

  const handleEdit = useCallback(
    (contact: Contact) => {
      dispatch(openContactDrawer({ mode: 'edit', entityId: contact.id }));
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (contactId: string) => {
      modal.confirm({
        title: t('contacts:deleteConfirm'),
        okText: t('common:delete'),
        okButtonProps: { danger: true },
        cancelText: t('common:cancel'),
        onOk: () => dispatch(deleteContact(contactId)),
      });
    },
    [dispatch, t, modal],
  );

  const handleBulkDelete = useCallback(() => {
    modal.confirm({
      title: t('contacts:bulkDeleteConfirm', { count: selectedIds.length }),
      okText: t('common:delete'),
      okButtonProps: { danger: true },
      cancelText: t('common:cancel'),
      onOk: async () => {
        await Promise.all(selectedIds.map((id) => dispatch(deleteContact(id))));
        dispatch(setSelectedContacts([]));
      },
    });
  }, [dispatch, selectedIds, t, modal]);

  const handleSelect = useCallback(
    (ids: string[]) => {
      dispatch(setSelectedContacts(ids));
    },
    [dispatch],
  );

  const handleExport = useCallback(() => {
    enqueueDownload('/api/contacts/export', 'contacts.csv').catch(() => {
      // Demo mode (no backend): build the CSV from the contacts in the store.
      try {
        downloadCsv(contacts, EXPORT_COLUMNS, 'contacts.csv');
      } catch {
        void message.error(t('contacts:exportFailed'));
      }
    });
  }, [contacts, message, t]);

  const filterPanel = (
    <Space direction="vertical" size={12} style={{ width: '28rem' }}>
      <div>
        <Typography.Text type="secondary">{t('common:status')}</Typography.Text>
        <Select
          allowClear
          style={{ width: '100%' }}
          placeholder={t('common:any')}
          value={filters.status ?? undefined}
          onChange={(value?: ContactStatus) => updateFilter('status', value ?? null)}
          options={Object.values(ContactStatus).map((s) => ({ value: s, label: t(`contacts:status.${s}`) }))}
        />
      </div>
      <div>
        <Typography.Text type="secondary">{t('label:source')}</Typography.Text>
        <Select
          allowClear
          style={{ width: '100%' }}
          placeholder={t('common:any')}
          value={filters.source ?? undefined}
          onChange={(value?: ContactSource) => updateFilter('source', value ?? null)}
          options={Object.values(ContactSource).map((s) => ({ value: s, label: t(`contacts:source.${s}`) }))}
        />
      </div>
      <div>
        <Typography.Text type="secondary">{t('label:owner')}</Typography.Text>
        <Select
          allowClear
          style={{ width: '100%' }}
          placeholder={t('common:any')}
          value={filters.ownerId ?? undefined}
          onChange={(value?: string) => updateFilter('ownerId', value ?? null)}
          options={ownerOptions}
        />
      </div>
      <div>
        <Typography.Text type="secondary">{t('common:tags')}</Typography.Text>
        <Select
          mode="multiple"
          allowClear
          style={{ width: '100%' }}
          placeholder={t('common:any')}
          value={filters.tags}
          onChange={(value: string[]) => updateFilter('tags', value)}
          options={tagOptions}
        />
      </div>
      <Button block onClick={resetFilters} disabled={activeFilterCount === 0}>
        {t('common:clearFilters')}
      </Button>
    </Space>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: Spacing.md }}>
        <Space size={12}>
          <SearchInput
            value={filters.search}
            onChange={(value) => updateFilter('search', value)}
            placeholder={t('common:search')}
          />
          <Popover trigger="click" placement="bottomLeft" content={filterPanel}>
            <Button icon={<Icon name="filter" />}>
              {t('common:filter')} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </Popover>
        </Space>

        <Space size={8}>
          <GrantChildrenHOC authorizationKey="contacts.export">
            <Button icon={<Icon name="export" />} onClick={handleExport}>
              {t('contacts:exportContacts')}
            </Button>
          </GrantChildrenHOC>

          <GrantChildrenHOC authorizationKey="contacts.create">
            <Button
              type="primary"
              icon={<Icon name="plus" />}
              onClick={() => dispatch(openContactDrawer({ mode: 'create' }))}
            >
              {t('contacts:addContact')}
            </Button>
          </GrantChildrenHOC>

          {selectedIds.length > 0 && (
            <GrantChildrenHOC authorizationKey={['contacts.delete', 'contacts.bulkEdit']} keyMatch="ANY">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: t('common:delete'),
                      danger: true,
                      onClick: handleBulkDelete,
                    },
                  ],
                }}
              >
                <Button icon={<Icon name="more" />}>
                  {t('common:selectedCount', { count: selectedIds.length })}
                </Button>
              </Dropdown>
            </GrantChildrenHOC>
          )}
        </Space>
      </div>

      <ContactTable
        contacts={filteredContacts}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
