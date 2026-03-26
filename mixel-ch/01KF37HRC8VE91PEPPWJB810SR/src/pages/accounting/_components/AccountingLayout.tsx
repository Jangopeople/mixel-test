import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import { cn } from "@/lib/utils.ts";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  ArrowLeft,
  Clock,
  UserCog,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", icon: LayoutDashboard, path: "" },
  { key: "clients", icon: Users, path: "/clients" },
  { key: "offers", icon: FileText, path: "/offers" },
  { key: "invoices", icon: Receipt, path: "/invoices" },
] as const;

function PendingApproval({ lng }: { lng: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="p-4 rounded-full bg-amber-100">
        <Clock className="h-12 w-12 text-amber-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Zugang ausstehend</h1>
        <p className="text-muted-foreground max-w-md">
          Ihre Registrierung wurde empfangen. Ein Administrator muss Ihren Zugang zum Buchhaltungsbereich noch freischalten.
        </p>
        <p className="text-sm text-muted-foreground">
          Bitte kontaktieren Sie den Administrator, falls Sie dringend Zugang benötigen.
        </p>
      </div>
      <Button onClick={() => navigate(`/${lng}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Zurück zur Website
      </Button>
    </div>
  );
}

function AccessLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

function AccountingInner() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const lng = i18n.language;
  const basePath = `/${lng}/accounting`;

  const accessCheck = useQuery(api.users.checkAccountingAccess);

  if (accessCheck === undefined) {
    return <AccessLoading />;
  }

  if (!accessCheck.hasAccess) {
    return <PendingApproval lng={lng} />;
  }

  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    clients: "Kunden",
    offers: "Offerten",
    invoices: "Rechnungen",
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Buchhaltung</h2>
          <p className="text-xs text-muted-foreground">Mixel IT</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const fullPath = `${basePath}${item.path}`;
            const isActive =
              item.path === ""
                ? location.pathname === basePath || location.pathname === `${basePath}/`
                : location.pathname.startsWith(fullPath);
            const Icon = item.icon;

            return (
              <Link
                key={item.key}
                to={fullPath}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {labels[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1">
          {/* Admin-only: User management */}
          {accessCheck.isAdmin && (
            <Link
              to={`${basePath}/users`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                location.pathname.startsWith(`${basePath}/users`)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <UserCog className="h-4 w-4" />
              Benutzerverwaltung
            </Link>
          )}
          <Link
            to={`/${lng}`}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function AccountingLayout() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Mixel Accounting"
        description="Restricted accounting workspace for approved Mixel users."
        noIndex
      />
      <AuthLoading>
        <AccessLoading />
      </AuthLoading>

      <Unauthenticated>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Mixel IT - Buchhaltung</h1>
          <p className="text-muted-foreground max-w-md text-center">
            Dieser Bereich wird manuell freigeschaltet. Fordern Sie den Zugang per E-Mail an.
          </p>
          <SignInButton label="Zugang per E-Mail anfordern" />
        </div>
      </Unauthenticated>

      <Authenticated>
        <AccountingInner />
      </Authenticated>
    </div>
  );
}
