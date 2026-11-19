import { Typography, Space } from 'antd';
import styled from 'styled-components';
import { Colors, Spacing, FontSize } from '@styles/colors';
import { Icon, type IconName } from '@atoms/Icon/Icon';
import { Avatar } from '@atoms/Avatar/Avatar';
import type { Activity } from '@models/Activity.model';
import { ActivityType } from '@models/Activity.model';
import { formatRelativeDate } from '@helpers/format/format.helper';

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${Spacing.sm};
  padding: ${Spacing.sm} 0;
  border-bottom: 1px solid ${Colors.borderSecondary};

  &:last-child {
    border-bottom: none;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const activityTypeIcons: Record<ActivityType, IconName> = {
  [ActivityType.Call]: 'phone',
  [ActivityType.Email]: 'mail',
  [ActivityType.Meeting]: 'team',
  [ActivityType.Note]: 'edit',
  [ActivityType.Task]: 'check',
};

interface ActivityItemProps {
  activity: Activity;
  ownerName: string;
}

export function ActivityItem({ activity, ownerName }: ActivityItemProps) {
  return (
    <Item>
      <Avatar name={ownerName} size={28} />
      <Content>
        <Space size={8}>
          <Icon name={activityTypeIcons[activity.type]} fontSize={FontSize.xs} color="textSecondary" />
          <Typography.Text strong style={{ fontSize: FontSize.sm }}>
            {activity.subject}
          </Typography.Text>
        </Space>
        {activity.description && (
          <Typography.Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={{ margin: `${Spacing.xxs} 0 0`, fontSize: FontSize.xs }}
          >
            {activity.description}
          </Typography.Paragraph>
        )}
        <Typography.Text type="secondary" style={{ fontSize: FontSize.xs }}>
          {formatRelativeDate(activity.createdAt)}
        </Typography.Text>
      </Content>
    </Item>
  );
}
