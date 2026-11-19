import { Card, Form, Input, Select, Switch, Divider, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@hooks/useAppStore';
import { preferenceUpdated, toggleTheme } from '@redux/preferences/slice';
import { useAuth } from '@context/AuthContext/AuthContext';
import { Spacing } from '@styles/colors';

export function SettingsPage() {
  const { t } = useTranslation(['settings', 'label', 'common']);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.preferences);

  return (
    <div style={{ maxWidth: '60rem' }}>
      <Typography.Title level={3}>{t('settings:title')}</Typography.Title>

      <Card title={t('settings:profile')} style={{ marginBottom: Spacing.md }}>
        <Form layout="vertical">
          <Form.Item label={t('label:name')}>
            <Input value={user?.name ?? ''} disabled />
          </Form.Item>
          <Form.Item label={t('label:email')}>
            <Input value={user?.email ?? ''} disabled />
          </Form.Item>
        </Form>
      </Card>

      <Card title={t('settings:general')} style={{ marginBottom: Spacing.md }}>
        <Form layout="vertical">
          <Form.Item label={t('label:currency')}>
            <Select
              value={preferences.currency}
              onChange={(value) => dispatch(preferenceUpdated({ currency: value }))}
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'BRL', label: 'BRL (R$)' },
              ]}
            />
          </Form.Item>
          <Form.Item label={t('settings:pageSize')}>
            <Select
              value={preferences.tablePageSize}
              onChange={(value) => dispatch(preferenceUpdated({ tablePageSize: value }))}
              options={[
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
            />
          </Form.Item>
          <Divider />
          <Form.Item label={t('settings:darkMode')}>
            <Switch
              checked={preferences.theme === 'dark'}
              onChange={() => dispatch(toggleTheme())}
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
