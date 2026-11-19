import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from '@tanstack/react-router';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { store } from '@redux/store';
import { router } from '@router/router';
import { AuthProvider, useAuth } from '@context/AuthContext/AuthContext';
import { WebSocketProvider } from '@context/WebSocketContext/WebSocketContext';
import { SimultaneousEditingProvider } from '@context/SimultaneousEditingContext/SimultaneousEditingContext';
import { AsyncCacheProvider } from '@context/AsyncCacheContext/AsyncCacheContext';
import { useAppSelector } from '@hooks/useAppStore';
import { ThemeTokenStyles } from '@styles/ThemeTokenStyles';
import { Colors } from '@styles/colors';
import '@config/i18n/config';

function InnerApp() {
  const { isAuthenticated } = useAuth();
  const previousAuth = useRef(isAuthenticated);

  // Re-run route guards (beforeLoad) whenever the auth state flips, so a
  // logout immediately kicks the user out of protected routes.
  useEffect(() => {
    if (previousAuth.current !== isAuthenticated) {
      previousAuth.current = isAuthenticated;
      void router.invalidate();
    }
  }, [isAuthenticated]);

  return (
    <RouterProvider router={router} context={{ isAuthenticated }} />
  );
}

function ThemedApp() {
  const currentTheme = useAppSelector((state) => state.preferences.theme);

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
          // Solid selected item: the default (primary text on a tinted primary
          // background) is unreadable in dark mode (contrast ~2.5:1).
          Menu: {
            itemSelectedBg: Colors.primaryActive,
            itemSelectedColor: '#ffffff',
          },
        },
      }}
    >
      <ThemeTokenStyles />
      <AntApp>
        <AuthProvider>
          <AsyncCacheProvider>
            <WebSocketProvider>
              <SimultaneousEditingProvider>
                <InnerApp />
              </SimultaneousEditingProvider>
            </WebSocketProvider>
          </AsyncCacheProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
}
