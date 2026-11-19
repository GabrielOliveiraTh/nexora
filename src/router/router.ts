import {
  createRouter,
  createRootRouteWithContext,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { parseSearch, stringifySearch } from '@router/search/serializer';
import { PendingComponent, RouteErrorComponent } from '@router/guards';
import { DashboardPage } from '@pages/Dashboard/DashboardPage';
import { ContactsPage } from '@pages/Contacts/ContactsPage';
import { DealsPage } from '@pages/Deals/DealsPage';
import { PipelinePage } from '@pages/Pipeline/PipelinePage';
import { SettingsPage } from '@pages/Settings/SettingsPage';
import { NotificationsPage } from '@pages/Notifications/NotificationsPage';
import { LoginPage } from '@pages/Login/LoginPage';
import { contactsSearchSchema, dealsSearchSchema, dashboardSearchSchema } from '@router/search/schemas';
import { AppLayout } from '@pages/Layout/AppLayout';

interface RouterContext {
  isAuthenticated: boolean;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  errorComponent: RouteErrorComponent,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
  validateSearch: (search) => dashboardSearchSchema.parse(search),
});

const contactsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/contacts',
  component: ContactsPage,
  validateSearch: (search) => contactsSearchSchema.parse(search),
});

const dealsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/deals',
  component: DealsPage,
  validateSearch: (search) => dealsSearchSchema.parse(search),
});

const pipelineRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/pipeline/$pipelineId',
  component: PipelinePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/settings',
  component: SettingsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const guestRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'guest',
  component: Outlet,
});

const loginRoute = createRoute({
  getParentRoute: () => guestRoute,
  path: '/login',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  authenticatedRoute.addChildren([
    dashboardRoute,
    contactsRoute,
    dealsRoute,
    pipelineRoute,
    settingsRoute,
    notificationsRoute,
  ]),
  guestRoute.addChildren([loginRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: PendingComponent,
  defaultPendingMs: 200,
  defaultErrorComponent: RouteErrorComponent,
  parseSearch: parseSearch as never,
  stringifySearch: stringifySearch as never,
  context: {
    isAuthenticated: false,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
