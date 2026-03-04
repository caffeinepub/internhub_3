import { Link, useRouter } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  CheckCircle2,
  LayoutDashboard,
  Menu,
  Shield,
  User,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    ocid: "nav.dashboard_link",
  },
  {
    label: "Saved",
    path: "/saved",
    icon: <Bookmark className="h-5 w-5" />,
    ocid: "nav.saved_link",
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: <Bell className="h-5 w-5" />,
    ocid: "nav.alerts_link",
  },
  {
    label: "Applications",
    path: "/applications",
    icon: <CheckCircle2 className="h-5 w-5" />,
    ocid: "nav.applications_link",
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <User className="h-5 w-5" />,
    ocid: "nav.profile_link",
  },
];

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={item.path}
      data-ocid={item.ocid}
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
        isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-sidebar-accent"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3 w-full">
        <span
          className={`transition-transform duration-150 ${isActive ? "text-sidebar-primary" : "group-hover:scale-110"}`}
        >
          {item.icon}
        </span>
        <span>{item.label}</span>
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
        )}
      </span>
    </Link>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  currentPath: string;
}

export function AppShell({ children, currentPath }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .isCallerAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, [actor, isFetching]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col sidebar-gradient border-r border-sidebar-border z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/20 border border-sidebar-primary/30">
            <Zap
              className="h-4.5 w-4.5 text-sidebar-primary"
              fill="currentColor"
            />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground tracking-tight">
            Intern<span className="text-sidebar-primary">Hub</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              isActive={
                currentPath === item.path ||
                currentPath.startsWith(`${item.path}/`)
              }
            />
          ))}
          {isAdmin && (
            <NavLink
              item={{
                label: "Admin",
                path: "/admin",
                icon: <Shield className="h-5 w-5" />,
                ocid: "sidebar.admin_link",
              }}
              isActive={
                currentPath === "/admin" || currentPath.startsWith("/admin/")
              }
            />
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border/50">
          <p className="text-xs text-sidebar-foreground/30 text-center">
            InternHub v1.0
          </p>
        </div>
      </aside>

      {/* ── Mobile Top Bar ───────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar/95 backdrop-blur-sm border-b border-sidebar-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <Zap className="h-4 w-4 text-sidebar-primary" fill="currentColor" />
          </div>
          <span className="font-display text-lg font-bold text-sidebar-foreground">
            Intern<span className="text-sidebar-primary">Hub</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 flex flex-col sidebar-gradient border-r border-sidebar-border z-50"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/20 border border-sidebar-primary/30">
                    <Zap
                      className="h-4.5 w-4.5 text-sidebar-primary"
                      fill="currentColor"
                    />
                  </div>
                  <span className="font-display text-xl font-bold text-sidebar-foreground">
                    Intern<span className="text-sidebar-primary">Hub</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    item={item}
                    isActive={currentPath === item.path}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
                {isAdmin && (
                  <NavLink
                    item={{
                      label: "Admin",
                      path: "/admin",
                      icon: <Shield className="h-5 w-5" />,
                      ocid: "sidebar.admin_link",
                    }}
                    isActive={currentPath === "/admin"}
                    onClick={() => setMobileOpen(false)}
                  />
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
