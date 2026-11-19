import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@hooks/useAppStore';
import { useSocket } from '@hooks/useSocket';
import { selectDealsList } from '@redux/deals/slice';
import { dealUpdatedViaSocket } from '@redux/deals/slice';
import { openDealDrawer } from '@redux/ui/slice';
import { DealPipeline } from '@organisms/DealPipeline/DealPipeline';
import { Button } from '@atoms/Button/Button';
import { Icon } from '@atoms/Icon/Icon';
import { GrantChildrenHOC } from '@HOC/GrantChildrenHOC';
import type { Deal } from '@models/Deal.model';

export function DealsContainer() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['deals', 'common']);
  const deals = useAppSelector(selectDealsList);

  useSocket<Deal>('deals', 'deal:updated', (deal) => {
    dispatch(dealUpdatedViaSocket(deal));
  });

  const handleDealClick = useCallback(
    (deal: Deal) => {
      dispatch(openDealDrawer({ mode: 'view', entityId: deal.id }));
    },
    [dispatch],
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.6rem' }}>
        <h2 style={{ margin: 0 }}>{t('deals:title')}</h2>
        <GrantChildrenHOC authorizationKey="deals.create">
          <Button
            type="primary"
            icon={<Icon name="plus" />}
            onClick={() => dispatch(openDealDrawer({ mode: 'create' }))}
          >
            {t('deals:addDeal')}
          </Button>
        </GrantChildrenHOC>
      </div>

      <DealPipeline deals={deals} onDealClick={handleDealClick} />
    </div>
  );
}
