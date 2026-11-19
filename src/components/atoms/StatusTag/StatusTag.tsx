import { Tag } from 'antd';
import styled from 'styled-components';
import { Colors, BorderRadius, FontSize } from '@styles/colors';
import { ContactStatus } from '@models/Contact.model';
import { DealStage, DealPriority } from '@models/Deal.model';
import { ActivityStatus } from '@models/Activity.model';

const StyledTag = styled(Tag)`
  border-radius: ${BorderRadius.sm};
  font-weight: 500;
  font-size: ${FontSize.xs};
  line-height: 2rem;
  padding: 0 0.8rem;
`;

const contactStatusConfig: Record<ContactStatus, { color: string; bg: string }> = {
  [ContactStatus.Lead]: { color: Colors.tagPrimaryText, bg: Colors.primaryBg },
  [ContactStatus.Qualified]: { color: Colors.tagPurpleText, bg: Colors.purpleBg },
  [ContactStatus.Customer]: { color: Colors.tagSuccessText, bg: Colors.successBg },
  [ContactStatus.Churned]: { color: Colors.tagErrorText, bg: Colors.errorBg },
};

const dealStageConfig: Record<DealStage, { color: string; bg: string }> = {
  [DealStage.Prospecting]: { color: Colors.tagPrimaryText, bg: Colors.primaryBg },
  [DealStage.Qualification]: { color: Colors.tagPurpleText, bg: Colors.purpleBg },
  [DealStage.Proposal]: { color: Colors.tagOrangeText, bg: Colors.orangeBg },
  [DealStage.Negotiation]: { color: Colors.tagWarningText, bg: Colors.warningBg },
  [DealStage.ClosedWon]: { color: Colors.tagSuccessText, bg: Colors.successBg },
  [DealStage.ClosedLost]: { color: Colors.tagErrorText, bg: Colors.errorBg },
};

const dealPriorityConfig: Record<DealPriority, { color: string; bg: string }> = {
  [DealPriority.Low]: { color: Colors.textSecondary, bg: Colors.fillSecondary },
  [DealPriority.Medium]: { color: Colors.tagPrimaryText, bg: Colors.primaryBg },
  [DealPriority.High]: { color: Colors.tagWarningText, bg: Colors.warningBg },
  [DealPriority.Critical]: { color: Colors.tagErrorText, bg: Colors.errorBg },
};

const activityStatusConfig: Record<ActivityStatus, { color: string; bg: string }> = {
  [ActivityStatus.Pending]: { color: Colors.tagWarningText, bg: Colors.warningBg },
  [ActivityStatus.Completed]: { color: Colors.tagSuccessText, bg: Colors.successBg },
  [ActivityStatus.Cancelled]: { color: Colors.tagErrorText, bg: Colors.errorBg },
};

type StatusTagVariant =
  | { type: 'contactStatus'; value: ContactStatus }
  | { type: 'dealStage'; value: DealStage }
  | { type: 'dealPriority'; value: DealPriority }
  | { type: 'activityStatus'; value: ActivityStatus };

export function StatusTag(props: StatusTagVariant & { label: string }) {
  let config: { color: string; bg: string };
  switch (props.type) {
    case 'contactStatus':
      config = contactStatusConfig[props.value];
      break;
    case 'dealStage':
      config = dealStageConfig[props.value];
      break;
    case 'dealPriority':
      config = dealPriorityConfig[props.value];
      break;
    case 'activityStatus':
      config = activityStatusConfig[props.value];
      break;
  }

  return (
    <StyledTag
      bordered={false}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {props.label}
    </StyledTag>
  );
}
