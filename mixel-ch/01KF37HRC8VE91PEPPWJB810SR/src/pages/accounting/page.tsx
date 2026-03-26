import { LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";

export default function AccountingDashboard() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Übersicht Ihrer Buchhaltung</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offene Offerten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offene Rechnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bezahlt (Monat)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kunden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/${lng}/accounting/clients`)}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Kunden verwalten</h3>
              <p className="text-sm text-muted-foreground">Kundenstammdaten pflegen</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info("Coming soon in a future milestone!")}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Offerten & Rechnungen</h3>
              <p className="text-sm text-muted-foreground">Wird in Kürze verfügbar sein</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
