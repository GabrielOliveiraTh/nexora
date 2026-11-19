import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Empty } from 'antd';
import styled from 'styled-components';
import { Colors, Spacing, BorderRadius } from '@styles/colors';
import { ActivityItem } from '@molecules/ActivityItem/ActivityItem';
import type { Activity } from '@models/Activity.model';

const FeedContainer = styled.div`
  background: ${Colors.bgContainer};
  border: 1px solid ${Colors.borderSecondary};
  border-radius: ${BorderRadius.lg};
  overflow: hidden;
`;

const FeedHeader = styled.div`
  padding: ${Spacing.sm} ${Spacing.md};
  border-bottom: 1px solid ${Colors.borderSecondary};
  font-weight: 600;
`;

interface ActivityFeedProps {
  activities: Activity[];
  getUserName: (userId: string) => string;
  maxHeight?: number;
}

export function ActivityFeed({ activities, getUserName, maxHeight = 500 }: ActivityFeedProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: activities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  if (activities.length === 0) {
    return (
      <FeedContainer>
        <FeedHeader>Activity Feed</FeedHeader>
        <Empty style={{ padding: Spacing.xl }} />
      </FeedContainer>
    );
  }

  return (
    <FeedContainer>
      <FeedHeader>Activity Feed</FeedHeader>
      <div ref={parentRef} style={{ height: maxHeight, overflow: 'auto', padding: `0 ${Spacing.md}` }}>
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const activity = activities[virtualRow.index];
            return (
              <div
                key={activity.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%',
                }}
              >
                <ActivityItem
                  activity={activity}
                  ownerName={getUserName(activity.ownerId)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </FeedContainer>
  );
}
