import { DealsContainer } from '@containers/Deals/DealsContainer';
import { DealDrawer } from '@containers/Deals/DealDrawer';
import { useAppSelector } from '@hooks/useAppStore';

export function DealsPage() {
  const { dealDrawerOpen, dealDrawerMode, dealDrawerEntityId } = useAppSelector((state) => state.ui);

  return (
    <>
      <DealsContainer />
      <DealDrawer
        open={dealDrawerOpen}
        mode={dealDrawerMode}
        entityId={dealDrawerEntityId}
      />
    </>
  );
}
