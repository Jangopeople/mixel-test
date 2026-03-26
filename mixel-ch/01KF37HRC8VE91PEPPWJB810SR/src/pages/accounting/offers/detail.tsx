import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id, Doc } from "@/convex/_generated/dataModel.d.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  ArrowLeft,
  Pencil,
  Building2,
  Calendar,
  Hash,
} from "lucide-react";
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

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("de-CH");

export default function OfferDetailPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lng = i18n.language;

  const offer = useQuery(
    api.accounting.offers.getById,
    offerId ? { offerId: offerId as Id<"offers"> } : "skip",
  );
  const updateStatus = useMutation(api.accounting.offers.updateStatus);
  const [editOpen, setEditOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!offerId) return;
    try {
      await updateStatus({
        offerId: offerId as Id<"offers">,
        status: newStatus as OfferStatus,
      });
      toast.success("Status aktualisiert.");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Fehler beim Aktualisieren.");
      }
    }
  };

  if (offer === undefined) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground">Offerte nicht gefunden.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(`/${lng}/accounting/offers`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[offer.status];

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/${lng}/accounting/offers`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{offer.title}</h1>
              <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{offer.offerNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {offer.status === "draft" && (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
            </Button>
          )}
          <Select value={offer.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Entwurf</SelectItem>
              <SelectItem value="sent">Gesendet</SelectItem>
              <SelectItem value="accepted">Angenommen</SelectItem>
              <SelectItem value="rejected">Abgelehnt</SelectItem>
              <SelectItem value="expired">Abgelaufen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Kunde</p>
              <p className="font-medium">{offer.clientName}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Datum</p>
              <p className="font-medium">{formatDate(offer.issueDate)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Gültig bis</p>
              <p className="font-medium">{formatDate(offer.validUntil)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line items table */}
      <Card>
        <CardHeader>
          <CardTitle>Positionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Pos.</th>
                  <th className="pb-2 pr-4 font-medium">Beschreibung</th>
                  <th className="pb-2 pr-4 font-medium text-right">Menge</th>
                  <th className="pb-2 pr-4 font-medium">Einheit</th>
                  <th className="pb-2 pr-4 font-medium text-right">Preis</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {offer.items.map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{item.position}</td>
                    <td className="py-3 pr-4">{item.description}</td>
                    <td className="py-3 pr-4 text-right">{item.quantity}</td>
                    <td className="py-3 pr-4">{item.unit}</td>
                    <td className="py-3 pr-4 text-right">{formatCHF(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium">{formatCHF(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex gap-8">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium w-28 text-right">{formatCHF(offer.subtotal)}</span>
            </div>
            <div className="flex gap-8">
              <span className="text-muted-foreground">MwSt ({offer.vatRate}%):</span>
              <span className="font-medium w-28 text-right">{formatCHF(offer.vatAmount)}</span>
            </div>
            <div className="flex gap-8 text-base font-bold mt-1">
              <span>Total:</span>
              <span className="w-28 text-right">{formatCHF(offer.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {offer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Bemerkungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{offer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit dialog */}
      <OfferFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editData={
          offer.status === "draft"
            ? {
                offerId: offer._id,
                clientId: offer.clientId,
                title: offer.title,
                issueDate: offer.issueDate,
                validUntil: offer.validUntil,
                vatRate: offer.vatRate,
                notes: offer.notes,
                items: offer.items.map((i) => ({
                  description: i.description,
                  quantity: i.quantity,
                  unit: i.unit,
                  unitPrice: i.unitPrice,
                })),
              }
            : null
        }
      />
    </div>
  );
}
