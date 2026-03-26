import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { Spinner } from "@/components/ui/spinner.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

type ClientFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Doc<"clients"> | null;
};

export default function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const createClient = useMutation(api.accounting.clients.create);
  const updateClient = useMutation(api.accounting.clients.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    street: "",
    zip: "",
    city: "",
    country: "Schweiz",
    notes: "",
  });

  useEffect(() => {
    if (client) {
      setForm({
        companyName: client.companyName,
        contactPerson: client.contactPerson,
        email: client.email,
        phone: client.phone ?? "",
        street: client.street ?? "",
        zip: client.zip ?? "",
        city: client.city ?? "",
        country: client.country ?? "Schweiz",
        notes: client.notes ?? "",
      });
    } else {
      setForm({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        street: "",
        zip: "",
        city: "",
        country: "Schweiz",
        notes: "",
      });
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.contactPerson.trim() || !form.email.trim()) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        companyName: form.companyName.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        street: form.street.trim() || undefined,
        zip: form.zip.trim() || undefined,
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (client) {
        await updateClient({ clientId: client._id, ...data });
        toast.success("Kunde erfolgreich aktualisiert.");
      } else {
        await createClient(data);
        toast.success("Kunde erfolgreich erstellt.");
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Ein Fehler ist aufgetreten.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Kunde bearbeiten" : "Neuer Kunde"}</DialogTitle>
          <DialogDescription>
            {client ? "Kundendaten aktualisieren." : "Einen neuen Kunden erfassen."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="companyName">Firmenname *</Label>
              <Input
                id="companyName"
                placeholder="Beispiel AG"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Kontaktperson *</Label>
              <Input
                id="contactPerson"
                placeholder="Max Muster"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="info@beispiel.ch"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="044 123 45 67"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Strasse</Label>
              <Input
                id="street"
                placeholder="Musterstrasse 1"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">PLZ</Label>
              <Input
                id="zip"
                placeholder="8000"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ort</Label>
              <Input
                id="city"
                placeholder="Zürich"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                placeholder="Schweiz"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                placeholder="Zusätzliche Informationen..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {client ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
