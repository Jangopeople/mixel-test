import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { Mail, ShieldCheck, ShieldX, User, UserCog } from "lucide-react";
import { toast } from "sonner";

const PORTAL_CONFIG = [
  { key: "accounting", label: "Accounting", domain: "acc.mixel.ch" },
  { key: "ticketsystem", label: "Ticketsystem", domain: "ism.mixel.ch" },
  { key: "marketing", label: "Marketing", domain: "marketing.mixel.ch" },
  { key: "mixekai", label: "MixeKAI", domain: "ai.mixel.ch" },
  { key: "kyc", label: "KYC", domain: "kyc.mixel.ch" },
] as const;

type PortalKey = (typeof PORTAL_CONFIG)[number]["key"];

export default function UsersPage() {
  const users = useQuery(api.users.listAll);
  const setPortalAccess = useMutation(api.users.setPortalAccess);

  const hasPortalAccess = (
    user: NonNullable<typeof users>[number],
    portal: PortalKey,
  ) => {
    if (portal === "accounting") {
      return (
        user.portalAccess?.accounting === true || user.accountingAccess === true
      );
    }
    return user.portalAccess?.[portal] === true;
  };

  const handleToggle = async (
    userId: string,
    portal: PortalKey,
    currentAccess: boolean,
    label: string,
  ) => {
    try {
      await setPortalAccess({
        userId: userId as Parameters<typeof setPortalAccess>[0]["userId"],
        portal: portal as Parameters<typeof setPortalAccess>[0]["portal"],
        hasAccess: !currentAccess,
      });
      toast.success(
        !currentAccess
          ? `${label}: Zugang gewährt.`
          : `${label}: Zugang entzogen.`,
      );
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Fehler beim Aktualisieren.");
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
        <p className="text-sm text-muted-foreground">
          Verwalten Sie den Zugang zu Accounting, Ticketsystem, Marketing, MixeKAI
          und KYC.
        </p>
      </div>

      {users === undefined ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserCog />
            </EmptyMedia>
            <EmptyTitle>Keine Benutzer</EmptyTitle>
            <EmptyDescription>
              Noch keine Benutzer registriert.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {users.map((u) => (
            <Card key={u._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">
                        {u.name || "Unbenannt"}
                      </h3>
                      {u.email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          {u.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PORTAL_CONFIG.map((portal) => {
                    const isEnabled = hasPortalAccess(u, portal.key);
                    return (
                      <Badge
                        key={portal.key}
                        variant={isEnabled ? "default" : "secondary"}
                        className={isEnabled ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {isEnabled ? (
                          <ShieldCheck className="mr-1 h-3 w-3" />
                        ) : (
                          <ShieldX className="mr-1 h-3 w-3" />
                        )}
                        {portal.label}
                      </Badge>
                    );
                  })}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PORTAL_CONFIG.map((portal) => {
                    const isEnabled = hasPortalAccess(u, portal.key);
                    return (
                      <Button
                        key={portal.key}
                        variant={isEnabled ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          handleToggle(u._id, portal.key, isEnabled, portal.label)
                        }
                      >
                        {isEnabled ? "Entziehen" : "Gewähren"} {portal.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
