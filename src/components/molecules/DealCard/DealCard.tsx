import { Typography } from 'antd';
import styled from 'styled-components';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '@styles/colors';
import { StatusTag } from '@atoms/StatusTag/StatusTag';
import { Icon } from '@atoms/Icon/Icon';
import type { Deal } from '@models/Deal.model';
import { formatCurrency } from '@helpers/format/format.helper';

const Card = styled.div`
  padding: ${Spacing.sm};
  border: 1px solid ${Colors.borderSecondary};
  border-radius: ${BorderRadius.md};
  background: ${Colors.bgContainer};
  cursor: grab;
  transition: box-shadow 0.2s, transform 0.1s;

  &:hover {
    box-shadow: ${Shadow.md};
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
    transform: translateY(0);
  }
`;

const ValueRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${Spacing.xs};
`;

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  return (
    <Card onClick={() => onClick(deal)}>
      <Typography.Text strong ellipsis style={{ display: 'block', marginBottom: Spacing.xxs }}>
        {deal.title}
      </Typography.Text>
      <StatusTag type="dealPriority" value={deal.priority} label={deal.priority} />
      <ValueRow>
        <Typography.Text style={{ fontSize: FontSize.sm, fontWeight: 600 }}>
          <Icon name="dollar" fontSize={FontSize.xs} /> {formatCurrency(deal.value, deal.currency)}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: FontSize.xs }}>
          {deal.probability}%
        </Typography.Text>
      </ValueRow>
    </Card>
  );
}
