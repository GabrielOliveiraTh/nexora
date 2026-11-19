import { ContactsContainer } from '@containers/Contacts/ContactsContainer';
import { ContactDrawer } from '@containers/Contacts/ContactDrawer';
import { useAppSelector } from '@hooks/useAppStore';

export function ContactsPage() {
  const drawerOpen = useAppSelector((state) => state.ui.contactDrawerOpen);
  const drawerMode = useAppSelector((state) => state.ui.contactDrawerMode);
  const drawerEntityId = useAppSelector((state) => state.ui.contactDrawerEntityId);

  return (
    <>
      <ContactsContainer />
      <ContactDrawer open={drawerOpen} mode={drawerMode} entityId={drawerEntityId} />
    </>
  );
}
