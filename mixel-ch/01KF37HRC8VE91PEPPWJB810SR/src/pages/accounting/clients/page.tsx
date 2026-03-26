import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
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
import { Plus, Search, Users, Pencil, Trash2, Building2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import ClientFormDialog from "../_components/ClientFormDialog.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

export default function ClientsPage() {
  const clients = useQuery(api.accounting.clients.list);
  const removeClient = useMutation(api.accounting.clients.remove);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Doc<"clients"> | null>(null);
  const [deletingClient, setDeletingClient] = useState<Doc<"clients"> | null>(null);

  const filteredClients = clients?.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (!deletingClient) return;
    try {
      await removeClient({ clientId: deletingClient._id });
      toast.success("Kunde gelöscht.");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("Fehler beim Löschen.");
      }
    }
    setDeletingClient(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kunden</h1>
          <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Kundenstammdaten</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Neuer Kunde
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kunden suchen..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {clients === undefined ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filteredClients && filteredClients.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Users /></EmptyMedia>
            <EmptyTitle>{search ? "Keine Treffer" : "Noch keine Kunden"}</EmptyTitle>
            <EmptyDescription>
              {search ? "Versuchen Sie eine andere Suche." : "Erstellen Sie Ihren ersten Kunden, um Offerten und Rechnungen zu verwalten."}
            </EmptyDescription>
          </EmptyHeader>
          {!search && (
            <EmptyContent>
              <Button size="sm" onClick={() => { setEditingClient(null); setDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Neuer Kunde
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filteredClients?.map((client) => (
            <Card key={client._id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{client.companyName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{client.contactPerson}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>
                      {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                      {client.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.zip} {client.city}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditingClient(client); setDialogOpen(true); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingClient(client)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
      />

      <AlertDialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kunde löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie &quot;{deletingClient?.companyName}&quot; wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.
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
