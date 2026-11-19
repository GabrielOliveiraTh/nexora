import { Layout, Menu, Badge, Dropdown, type SiderProps } from 'antd';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSize, Shadow, BorderRadius } from '@styles/colors';
import { Icon } from '@atoms/Icon/Icon';
import { Avatar } from '@atoms/Avatar/Avatar';
import { Logo as BrandLogo } from '@atoms/Logo/Logo';
import { useAuth } from '@context/AuthContext/AuthContext';
import { useAppDispatch, useAppSelector } from '@hooks/useAppStore';
import { useSocket } from '@hooks/useSocket';
import { notificationReceived } from '@redux/notifications/slice';
import type { Notification } from '@models/Common.model';

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

// `theme` is reserved by styled-components (it never reaches antd), so the
// Sider theme is fixed here instead of being passed through styled().
function LightSider(props: SiderProps) {
  return <Layout.Sider {...props} theme="light" />;
}

const StyledSider = styled(LightSider)`
  border-right: 1px solid ${Colors.borderSecondary};
  box-shadow: ${Shadow.sm};

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }

  .ant-menu-item {
    border-radius: ${BorderRadius.md};
    margin: ${Spacing.xxs} ${Spacing.xs};
    height: 4rem;
    line-height: 4rem;
  }

  .ant-menu-item-selected {
    font-weight: 500;
  }
`;

const LogoBar = styled.div`
  padding: ${Spacing.md} ${Spacing.md};
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${Colors.borderSecondary};
`;

const UserSection = styled.button`
  all: unset;
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  padding: ${Spacing.md};
  border-top: 1px solid ${Colors.borderSecondary};
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: ${Spacing.sm};

  &:hover,
  &:focus-visible {
    background: ${Colors.fillTertiary};
  }
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: ${FontSize.sm};
  color: ${Colors.textPrimary};
  line-height: 1.4;
`;

const UserRole = styled.div`
  font-size: ${FontSize.xs};
  color: ${Colors.textSecondary};
  text-transform: capitalize;
`;

const ContentArea = styled(Layout.Content)`
  padding: ${Spacing.lg};
  background: ${Colors.bgLayout};
  min-height: 280px;
`;

export function AppLayout() {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'contacts', 'deals', 'dashboard', 'settings', 'auth']);
  const { user, logout } = useAuth();
  const routerState = useRouterState();
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const dispatch = useAppDispatch();

  // Server-pushed notifications (only when VITE_BACKEND_ENABLED=true).
  useSocket<Notification>('notifications', 'notification:new', (notification) => {
    dispatch(notificationReceived(notification));
  });

  const currentPath = routerState.location.pathname;
  // Sub-routes (e.g. /pipeline/:id) highlight their parent menu entry.
  const selectedKey = currentPath.startsWith('/pipeline/') ? '/deals' : currentPath;

  const handleLogout = () => {
    // logout() clears sessionStorage and the Redux auth slice.
    logout();
    void navigate({ to: '/login' });
  };

  const menuItems = [
    { key: '/', label: t('dashboard:title'), icon: <Icon name="home" /> },
    { key: '/contacts', label: t('contacts:title'), icon: <Icon name="user" /> },
    { key: '/deals', label: t('deals:title'), icon: <Icon name="pipeline" /> },
    {
      key: '/notifications',
      label: (
        <Badge count={unreadCount} size="small" offset={[8, 0]}>
          {t('common:notifications')}
        </Badge>
      ),
      icon: <Icon name="bell" />,
    },
    { key: '/settings', label: t('settings:title'), icon: <Icon name="settings" /> },
  ];

  return (
    <StyledLayout>
      <StyledSider width={240}>
        <LogoBar>
          <BrandLogo size={30} />
        </LogoBar>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate({ to: key })}
          style={{ borderRight: 'none', flex: 1, padding: `${Spacing.xs} 0` }}
        />
        {user && (
          <Dropdown
            trigger={['click']}
            placement="topLeft"
            menu={{
              items: [
                {
                  key: 'logout',
                  label: t('auth:logout'),
                  icon: <Icon name="logout" />,
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <UserSection type="button" aria-haspopup="menu">
              <Avatar name={user.name} src={user.avatar} size={36} />
              <div>
                <UserName>{user.name}</UserName>
                <UserRole>{user.role}</UserRole>
              </div>
            </UserSection>
          </Dropdown>
        )}
      </StyledSider>
      <Layout>
        <ContentArea>
          <Outlet />
        </ContentArea>
      </Layout>
    </StyledLayout>
  );
}
