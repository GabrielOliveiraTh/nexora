import { List, Badge, Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@hooks/useAppStore';
import { notificationRead, allNotificationsRead } from '@redux/notifications/slice';
import { Icon } from '@atoms/Icon/Icon';
import { Button } from '@atoms/Button/Button';
import { Colors, Spacing, FontSize, BorderRadius } from '@styles/colors';
import { formatRelativeDate } from '@helpers/format/format.helper';
import type { Notification } from '@models/Common.model';

const typeIcons: Record<Notification['type'], Parameters<typeof Icon>[0]['name']> = {
  deal_update: 'pipeline',
  contact_assigned: 'user',
  activity_due: 'calendar',
  mention: 'mail',
  system: 'bell',
};

export function NotificationsPage() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.items);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('notifications')} {unreadCount > 0 && <Badge count={unreadCount} />}
        </Typography.Title>
        {unreadCount > 0 && (
          <Button type="link" onClick={() => dispatch(allNotificationsRead())}>
            {t('markAllAsRead')}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty description={t('noData')} />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => dispatch(notificationRead(item.id))}
              style={{
                cursor: 'pointer',
                background: item.isRead ? 'transparent' : Colors.primaryBg,
                padding: `${Spacing.sm} ${Spacing.md}`,
                borderRadius: BorderRadius.md,
                marginBottom: Spacing.xxs,
              }}
            >
              <List.Item.Meta
                avatar={<Icon name={typeIcons[item.type]} fontSize={FontSize.lg} />}
                title={item.title}
                description={
                  <>
                    <Typography.Text type="secondary">{item.message}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: FontSize.xs }}>
                      {formatRelativeDate(item.createdAt)}
                    </Typography.Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
