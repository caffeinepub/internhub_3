import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import { AppShell } from "./components/AppShell";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AdminPage } from "./pages/AdminPage";
import { AlertsPage } from "./pages/AlertsPage";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedPage } from "./pages/SavedPage";
import { SignupPage } from "./pages/SignupPage";

// ── Protected Route Wrapper ───────────────────────────────────────
function ProtectedLayout() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <Navigate to="/login" />;
  }

  return (
    <AppShellWrapper>
      <Outlet />
    </AppShellWrapper>
  );
}

function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  return <AppShell currentPath={currentPath}>{children}</AppShell>;
}

// ── Auth redirect wrapper ──────────────────────────────────────────
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (identity) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

// ── Route Tree ────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "General Sans, system-ui, sans-serif",
            fontSize: "14px",
          },
        }}
      />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    const { identity, isInitializing } = useInternetIdentity();
    if (isInitializing) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      );
    }
    return <Navigate to={identity ? "/dashboard" : "/login"} />;
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <AuthRedirect>
      <LoginPage />
    </AuthRedirect>
  ),
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: () => (
    <AuthRedirect>
      <SignupPage />
    </AuthRedirect>
  ),
});

const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/dashboard",
  component: DashboardPage,
});

const savedRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/saved",
  component: SavedPage,
});

const alertsRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/alerts",
  component: AlertsPage,
});

const applicationsRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/applications",
  component: ApplicationsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/profile",
  component: ProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  protectedLayout.addChildren([
    dashboardRoute,
    savedRoute,
    alertsRoute,
    applicationsRoute,
    profileRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
