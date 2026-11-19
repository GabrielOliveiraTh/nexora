import { useMemo } from 'react';
import { Typography, Empty } from 'antd';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, BorderRadius } from '@styles/colors';
import { DealCard } from '@molecules/DealCard/DealCard';
import { DealStage, type Deal } from '@models/Deal.model';
import { formatCurrency } from '@helpers/format/format.helper';
import { useAppSelector } from '@hooks/useAppStore';

const PipelineContainer = styled.div`
  display: flex;
  gap: ${Spacing.md};
  overflow-x: auto;
  padding-bottom: ${Spacing.md};
  min-height: 50rem;
`;

const StageColumn = styled.div`
  min-width: 28rem;
  max-width: 28rem;
  background: ${Colors.bgLayout};
  border-radius: ${BorderRadius.lg};
  display: flex;
  flex-direction: column;
`;

const StageHeader = styled.div<{ $color: string }>`
  padding: ${Spacing.sm} ${Spacing.md};
  border-bottom: 3px solid ${(props) => props.$color};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StageBody = styled.div`
  flex: 1;
  padding: ${Spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${Spacing.xs};
  overflow-y: auto;
`;

const stageOrder: DealStage[] = [
  DealStage.Prospecting,
  DealStage.Qualification,
  DealStage.Proposal,
  DealStage.Negotiation,
  DealStage.ClosedWon,
  DealStage.ClosedLost,
];

const stageColors: Record<DealStage, string> = {
  [DealStage.Prospecting]: Colors.stageProspecting,
  [DealStage.Qualification]: Colors.stageQualification,
  [DealStage.Proposal]: Colors.stageProposal,
  [DealStage.Negotiation]: Colors.stageNegotiation,
  [DealStage.ClosedWon]: Colors.stageClosedWon,
  [DealStage.ClosedLost]: Colors.stageClosedLost,
};

interface DealPipelineProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export function DealPipeline({ deals, onDealClick }: DealPipelineProps) {
  const { t } = useTranslation(['deals', 'pipeline']);
  const currency = useAppSelector((state) => state.preferences.currency);

  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      [DealStage.Prospecting]: [],
      [DealStage.Qualification]: [],
      [DealStage.Proposal]: [],
      [DealStage.Negotiation]: [],
      [DealStage.ClosedWon]: [],
      [DealStage.ClosedLost]: [],
    };
    for (const deal of deals) {
      grouped[deal.stage].push(deal);
    }
    return grouped;
  }, [deals]);

  const stageValues = useMemo(() => {
    const values: Record<DealStage, number> = {} as Record<DealStage, number>;
    for (const stage of stageOrder) {
      values[stage] = dealsByStage[stage].reduce((sum, d) => sum + d.value, 0);
    }
    return values;
  }, [dealsByStage]);

  return (
    <PipelineContainer>
      {stageOrder.map((stage) => (
        <StageColumn key={stage}>
          <StageHeader $color={stageColors[stage]}>
            <div>
              <Typography.Text strong>{t(`deals:stage.${stage}`)}</Typography.Text>
              <br />
              <Typography.Text type="secondary" style={{ fontSize: FontSize.xs }}>
                {t('deals:dealsCount', { count: dealsByStage[stage].length })}
              </Typography.Text>
            </div>
            <Typography.Text style={{ fontSize: FontSize.xs, fontWeight: 600 }}>
              {formatCurrency(stageValues[stage], currency)}
            </Typography.Text>
          </StageHeader>
          <StageBody>
            {dealsByStage[stage].length === 0 ? (
              <Empty description={t('pipeline:pipeline.emptyStage')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              dealsByStage[stage].map((deal) => (
                <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
              ))
            )}
          </StageBody>
        </StageColumn>
      ))}
    </PipelineContainer>
  );
}
