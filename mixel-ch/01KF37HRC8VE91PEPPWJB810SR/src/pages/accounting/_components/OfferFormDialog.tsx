import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

type OfferFormData = {
  clientId: string;
  title: string;
  issueDate: string;
  validUntil: string;
  vatRate: number;
  notes: string;
  items: LineItem[];
};

const EMPTY_ITEM: LineItem = { description: "", quantity: 1, unit: "Stk", unitPrice: 0 };

const todayISO = () => new Date().toISOString().split("T")[0];
const in30Days = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, we're editing; otherwise creating */
  editData?: {
    offerId: Id<"offers">;
    clientId: Id<"clients">;
    title: string;
    issueDate: string;
    validUntil: string;
    vatRate: number;
    notes?: string;
    items: LineItem[];
  } | null;
};

export default function OfferFormDialog({ open, onOpenChange, editData }: Props) {
  const clients = useQuery(api.accounting.clients.list);
  const createOffer = useMutation(api.accounting.offers.create);
  const updateOffer = useMutation(api.accounting.offers.update);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<OfferFormData>({
    clientId: "",
    title: "",
    issueDate: todayISO(),
    validUntil: in30Days(),
    vatRate: 8.1,
    notes: "",
    items: [{ ...EMPTY_ITEM }],
  });

  // Reset form when dialog opens or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          clientId: editData.clientId,
          title: editData.title,
          issueDate: editData.issueDate,
          validUntil: editData.validUntil,
          vatRate: editData.vatRate,
          notes: editData.notes ?? "",
          items: editData.items.length > 0 ? editData.items : [{ ...EMPTY_ITEM }],
        });
      } else {
        setForm({
          clientId: "",
          title: "",
          issueDate: todayISO(),
          validUntil: in30Days(),
          vatRate: 8.1,
          notes: "",
          items: [{ ...EMPTY_ITEM }],
        });
      }
    }
  }, [open, editData]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const subtotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatAmount = subtotal * (form.vatRate / 100);
  const total = subtotal + vatAmount;

  const formatCHF = (n: number) =>
    new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(n);

  const handleSubmit = async () => {
    if (!form.clientId) {
      toast.error("Bitte wählen Sie einen Kunden.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Bitte geben Sie einen Titel ein.");
      return;
    }
    if (form.items.some((i) => !i.description.trim())) {
      toast.error("Alle Positionen müssen eine Beschreibung haben.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        clientId: form.clientId as Id<"clients">,
        title: form.title,
        issueDate: form.issueDate,
        validUntil: form.validUntil,
        vatRate: form.vatRate,
        notes: form.notes || undefined,
        items: form.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit: i.unit,
          unitPrice: Number(i.unitPrice),
        })),
      };

      if (editData) {
        await updateOffer({ offerId: editData.offerId, ...payload });
        toast.success("Offerte aktualisiert.");
      } else {
        await createOffer(payload);
        toast.success("Offerte erstellt.");
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Fehler beim Speichern.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Offerte bearbeiten" : "Neue Offerte"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Header fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kunde *</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input
                placeholder="z.B. Netzwerk-Modernisierung"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gültig bis</Label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>MwSt-Satz (%)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={form.vatRate}
                onChange={(e) => setForm((p) => ({ ...p, vatRate: Number(e.target.value) }))}
              />
            </div>
          </div>

          <Separator />

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Positionen</Label>
              <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" /> Position
              </Button>
            </div>

            {form.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end rounded-lg border p-3 bg-muted/30">
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <Label className="text-xs">Beschreibung</Label>
                  <Input
                    placeholder="Leistungsbeschreibung"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Menge</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Einheit</Label>
                  <Select value={item.unit} onValueChange={(v) => updateItem(index, "unit", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stk">Stk</SelectItem>
                      <SelectItem value="Std">Std</SelectItem>
                      <SelectItem value="Psch">Psch</SelectItem>
                      <SelectItem value="Mt">Mt</SelectItem>
                      <SelectItem value="Liz">Liz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Preis (CHF)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.05"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-1 sm:col-span-1 flex items-end justify-center">
                  <p className="text-sm font-medium whitespace-nowrap hidden sm:block">
                    {formatCHF(item.quantity * item.unitPrice)}
                  </p>
                </div>
                <div className="col-span-1 flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={form.items.length <= 1}
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex gap-8">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium w-28 text-right">{formatCHF(subtotal)}</span>
            </div>
            <div className="flex gap-8">
              <span className="text-muted-foreground">MwSt ({form.vatRate}%):</span>
              <span className="font-medium w-28 text-right">{formatCHF(vatAmount)}</span>
            </div>
            <div className="flex gap-8 text-base font-bold">
              <span>Total:</span>
              <span className="w-28 text-right">{formatCHF(total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Bemerkungen</Label>
            <Textarea
              placeholder="Optionale Bemerkungen..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Speichern..." : editData ? "Aktualisieren" : "Offerte erstellen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
