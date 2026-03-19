import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Plus, Search, FileText, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import OfferFormDialog from "../_components/OfferFormDialog.tsx";

type OfferStatus = Doc<"offers">["status"];

const STATUS_CONFIG: Record<OfferStatus, { label: string; className: string }> = {
  draft: { label: "Entwurf", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  sent: { label: "Gesendet", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  accepted: { label: "Angenommen", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  rejected: { label: "Abgelehnt", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  expired: { label: "Abgelaufen", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
};

const formatCHF = (n: number) =>
  new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("de-CH");
};

export default function OffersPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lng = i18n.language;
  const offers = useQuery(api.accounting.offers.list);
  const removeOffer = useMutation(api.accounting.offers.remove);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState<(Doc<"offers"> & { clientName: string }) | null>(null);

  const filtered = offers?.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.offerNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.clientName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingOffer) return;
    try {
      await removeOffer({ offerId: deletingOffer._id });
      toast.success("Offerte gelöscht.");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Fehler beim Löschen.");
      }
    }
    setDeletingOffer(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Offerten</h1>
          <p className="text-sm text-muted-foreground">Erstellen und verwalten Sie Ihre Offerten</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Neue Offerte
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Offerten suchen..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {offers === undefined ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filtered && filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileText /></EmptyMedia>
            <EmptyTitle>{search ? "Keine Treffer" : "Noch keine Offerten"}</EmptyTitle>
            <EmptyDescription>
              {search ? "Versuchen Sie eine andere Suche." : "Erstellen Sie Ihre erste Offerte."}
            </EmptyDescription>
          </EmptyHeader>
          {!search && (
            <EmptyContent>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Neue Offerte
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filtered?.map((offer) => {
            const statusCfg = STATUS_CONFIG[offer.status];
            return (
              <Card key={offer._id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div
                    className="flex items-start gap-4 min-w-0 cursor-pointer flex-1"
                    onClick={() => navigate(`/${lng}/accounting/offers/${offer._id}`)}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{offer.title}</h3>
                        <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {offer.offerNumber} &middot; {offer.clientName}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span>Datum: {formatDate(offer.issueDate)}</span>
                        <span>Gültig bis: {formatDate(offer.validUntil)}</span>
                        <span className="font-semibold text-foreground">{formatCHF(offer.total)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/${lng}/accounting/offers/${offer._id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {offer.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingOffer(offer)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <OfferFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editData={null}
      />

      <AlertDialog open={!!deletingOffer} onOpenChange={(open) => !open && setDeletingOffer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Offerte löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie &quot;{deletingOffer?.title}&quot; ({deletingOffer?.offerNumber}) wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
