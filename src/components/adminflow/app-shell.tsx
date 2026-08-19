import { Link, useRouterState } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Contact2,
  FileText,
  Home,
  Inbox,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { Logo } from "./logo";
import { Pill } from "./ui";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { daysUntil, effectiveStatus, useStore } from "@/lib/adminflow/store";
import type { Role } from "@/lib/adminflow/types";
import { GlobalSearch } from "./global-search";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/visitors", label: "Visitors", icon: Users },
  { to: "/leave", label: "Leave requests", icon: Inbox },
  { to: "/supplies", label: "Office supplies", icon: Package },
  { to: "/contacts", label: "Directory", icon: Contact2 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/more", label: "Settings & audit", icon: Shield },
] as const;

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/meetings", label: "Calendar", icon: CalendarDays },
  { to: "/leave", label: "Requests", icon: Inbox },
  { to: "/more", label: "More", icon: LayoutGrid },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4.5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function useNotifications() {
  const { tasks, meetings, documents, leave, supplies, prefs } = useStore();
  return useMemo(() => {
    const items: { id: string; title: string; detail: string; tone: "danger" | "warning" | "info" }[] = [];
    if (prefs.overdueTasks) {
      tasks
        .filter((t) => effectiveStatus(t) === "Overdue")
        .forEach((t) =>
          items.push({ id: `t${t.id}`, title: "Overdue task", detail: t.title, tone: "danger" }),
        );
    }
    if (prefs.meetings) {
      meetings
        .filter((m) => daysUntil(m.date) >= 0 && daysUntil(m.date) <= 2)
        .forEach((m) =>
          items.push({
            id: `m${m.id}`,
            title: daysUntil(m.date) === 0 ? "Meeting today" : "Upcoming meeting",
            detail: `${m.title} · ${m.time}`,
            tone: "info",
          }),
        );
    }
    if (prefs.documents) {
      documents
        .filter((d) => daysUntil(d.expiry) <= 30)
        .forEach((d) =>
          items.push({
            id: `d${d.id}`,
            title: daysUntil(d.expiry) < 0 ? "Document expired" : "Document expiring",
            detail: d.name,
            tone: daysUntil(d.expiry) <= 7 ? "danger" : "warning",
          }),
        );
    }
    if (prefs.leave) {
      leave
        .filter((l) => l.status === "Pending")
        .forEach((l) =>
          items.push({
            id: `l${l.id}`,
            title: "Leave request pending",
            detail: `${l.employee} · ${l.type}`,
            tone: "warning",
          }),
        );
    }
    if (prefs.supplies) {
      supplies
        .filter((s) => s.quantity <= s.minimum)
        .forEach((s) =>
          items.push({ id: `s${s.id}`, title: "Low stock", detail: s.name, tone: "warning" }),
        );
    }
    return items;
  }, [tasks, meetings, documents, leave, supplies, prefs]);
}

function Topbar() {
  const { user, setRole } = useStore();
  const notifications = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur lg:px-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="border-b border-sidebar-border p-4">
            <Logo inverted />
          </div>
          <div className="p-3">
            <NavList />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:hidden">
        <Logo />
      </div>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="ml-auto hidden w-full max-w-md items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-ring/50 lg:flex"
      >
        <Search className="size-4" />
        Search tasks, people, documents…
        <kbd className="ml-auto rounded border px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1 lg:ml-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell />
              {notifications.length > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {notifications.length}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b p-3">
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {notifications.length} item{notifications.length === 1 ? "" : "s"} need attention
              </p>
            </div>
            <div className="max-h-80 divide-y overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-2 p-3">
                  <Pill tone={n.tone}>{n.title}</Pill>
                  <p className="text-sm">{n.detail}</p>
                </div>
              ))}
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">You are all caught up.</p>
              ) : null}
            </div>
            <div className="border-t p-2">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/more">Notification preferences</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-left transition-colors hover:bg-accent/10">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {user.initials}
              </span>
              <span className="hidden sm:block">
                <span className="block text-xs font-semibold leading-tight">{user.name}</span>
                <span className="block text-[10px] text-muted-foreground">{user.role}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Signed in as {user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch demo role
            </DropdownMenuLabel>
            {(["Administrator", "Manager", "Employee"] as Role[]).map((r) => (
              <DropdownMenuItem key={r} onSelect={() => setRole(r)}>
                <UserRound className="size-4" /> {r}
                {user.role === r ? <span className="ml-auto text-xs">Current</span> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/more">
                <Shield className="size-4" /> Security & audit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <LogOut className="size-4" /> Sign out (demo)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
      {MOBILE_NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground",
              active && "text-primary",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-4 lg:flex">
        <Logo inverted className="px-1 pb-5" />
        <NavList />
        <div className="mt-auto rounded-xl bg-sidebar-accent p-3 text-xs text-sidebar-foreground">
          <p className="font-semibold text-sidebar-accent-foreground">Role-based access</p>
          <p className="mt-1">Permissions are applied to every module and action.</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pt-6 pb-28 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
