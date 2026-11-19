import { useParams } from '@tanstack/react-router';
import { Typography, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@hooks/useAppStore';
import { openDealDrawer } from '@redux/ui/slice';
import { DealDrawer } from '@containers/Deals/DealDrawer';
import { selectDealsList } from '@redux/deals/slice';
import { DealPipeline } from '@organisms/DealPipeline/DealPipeline';

export function PipelinePage() {
  const { pipelineId } = useParams({ strict: false });
  const { t } = useTranslation('pipeline');
  const deals = useAppSelector(selectDealsList);
  const dispatch = useAppDispatch();
  const { dealDrawerOpen, dealDrawerMode, dealDrawerEntityId } = useAppSelector((state) => state.ui);

  const pipelineDeals = deals.filter((d) => d.pipelineId === pipelineId);

  return (
    <div>
      <Typography.Title level={3}>{t('pipeline.title')}: {pipelineId}</Typography.Title>
      {pipelineDeals.length === 0 ? (
        <Empty description={t('pipeline.emptyStage')} />
      ) : (
        <DealPipeline
          deals={pipelineDeals}
          onDealClick={(deal) => dispatch(openDealDrawer({ mode: 'view', entityId: deal.id }))}
        />
      )}
      <DealDrawer open={dealDrawerOpen} mode={dealDrawerMode} entityId={dealDrawerEntityId} />
    </div>
  );
}
