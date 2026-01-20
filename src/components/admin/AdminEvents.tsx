import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Trash2, Edit, Copy, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface Event {
  id: string;
  slug: string;
  name: string;
  location: string;
  address: string;
  date: string;
  time_start: string;
  time_end: string;
  current_batch: number;
  price_cents: number;
  original_price_cents: number;
  batch_end_date: string;
  max_capacity: number;
  current_capacity: number;
  cta_text: string;
  cta_link: string;
  hero_title: string;
  hero_subtitle: string;
  is_active: boolean;
  created_at: string;
}

export const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [cloneData, setCloneData] = useState({ slug: "", location: "", date: "" });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getEvents();
      setEvents(data);
    } catch (error) {
      toast.error("Erro ao carregar eventos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (eventId: string, data: Partial<Event>) => {
    try {
      await api.admin.updateEvent(eventId, data);
      toast.success("Evento atualizado!");
      loadEvents();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar evento");
    }
  };

  const handleClone = async () => {
    if (!selectedEvent) return;
    
    try {
      await api.admin.cloneEvent(selectedEvent.id, cloneData);
      toast.success("Evento clonado com sucesso!");
      setCloneDialogOpen(false);
      setCloneData({ slug: "", location: "", date: "" });
      loadEvents();
    } catch (error: any) {
      toast.error(error.message || "Erro ao clonar evento");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este evento?")) return;
    
    try {
      await api.admin.deleteEvent(id);
      toast.success("Evento removido!");
      loadEvents();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover evento");
    }
  };

  const openEditSheet = (event: Event) => {
    setSelectedEvent(event);
    setEditSheetOpen(true);
  };

  const openCloneDialog = (event: Event) => {
    setSelectedEvent(event);
    setCloneData({ slug: "", location: "", date: event.date });
    setCloneDialogOpen(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getEventUrl = (slug: string) => {
    // Get frontend URL
    const frontendUrl = window.location.origin;
    return `${frontendUrl}/${slug}`;
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(getEventUrl(slug));
    toast.success("Link copiado!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Landing Pages / Eventos
        </h2>
      </div>

      <div className="card-premium overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    /{event.slug}
                  </code>
                </TableCell>
                <TableCell>{formatDate(event.date)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatCurrency(event.price_cents)}</p>
                    <p className="text-xs text-muted-foreground line-through">
                      {formatCurrency(event.original_price_cents)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={event.is_active ? "default" : "secondary"}>
                    {event.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyLink(event.slug)}
                      title="Copiar link"
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(getEventUrl(event.slug), "_blank")}
                      title="Abrir página"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditSheet(event)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openCloneDialog(event)}
                      title="Clonar"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(event.id)}
                      className="text-destructive"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {events.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum evento encontrado.
          </p>
        )}
      </div>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Editar Evento</SheetTitle>
          </SheetHeader>
          {selectedEvent && (
            <EventForm
              event={selectedEvent}
              onSave={async (data) => {
                await handleUpdateEvent(selectedEvent.id, data);
                setEditSheetOpen(false);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clonar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="clone-slug">Slug (URL)</Label>
              <Input
                id="clone-slug"
                placeholder="nova-cidade"
                value={cloneData.slug}
                onChange={(e) => setCloneData({ ...cloneData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL: {getEventUrl(cloneData.slug || "nova-cidade")}
              </p>
            </div>
            <div>
              <Label htmlFor="clone-location">Localização</Label>
              <Input
                id="clone-location"
                placeholder="Nome da cidade"
                value={cloneData.location}
                onChange={(e) => setCloneData({ ...cloneData, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="clone-date">Data do Evento</Label>
              <Input
                id="clone-date"
                type="date"
                value={cloneData.date}
                onChange={(e) => setCloneData({ ...cloneData, date: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleClone} disabled={!cloneData.slug || !cloneData.location}>
                <Copy className="w-4 h-4 mr-2" />
                Clonar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Event Form Component
const EventForm = ({
  event,
  onSave,
}: {
  event: Event;
  onSave: (data: Partial<Event>) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    name: event.name,
    location: event.location,
    address: event.address || "",
    date: event.date,
    timeStart: event.time_start,
    timeEnd: event.time_end,
    currentBatch: event.current_batch,
    priceCents: event.price_cents,
    originalPriceCents: event.original_price_cents,
    batchEndDate: event.batch_end_date || "",
    maxCapacity: event.max_capacity,
    ctaText: event.cta_text || "GARANTIR MINHA VAGA",
    ctaLink: event.cta_link || "",
    heroTitle: event.hero_title || "",
    heroSubtitle: event.hero_subtitle || "",
    isActive: event.is_active,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Nome do Evento</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <Label>Localização</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <Label>Data</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label>Endereço Completo</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div>
          <Label>Horário Início</Label>
          <Input
            type="time"
            value={formData.timeStart}
            onChange={(e) => setFormData({ ...formData, timeStart: e.target.value })}
          />
        </div>

        <div>
          <Label>Horário Fim</Label>
          <Input
            type="time"
            value={formData.timeEnd}
            onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Preços e Lotes</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Lote Atual</Label>
            <Input
              type="number"
              value={formData.currentBatch}
              onChange={(e) => setFormData({ ...formData, currentBatch: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>Fim do Lote (Contagem Regressiva)</Label>
            <Input
              type="datetime-local"
              value={formData.batchEndDate}
              onChange={(e) => setFormData({ ...formData, batchEndDate: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Data/hora para a contagem regressiva do lote
            </p>
          </div>
          <div>
            <Label>Preço (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.priceCents / 100}
              onChange={(e) => setFormData({ ...formData, priceCents: Math.round(parseFloat(e.target.value) * 100) })}
            />
          </div>
          <div>
            <Label>Preço Original (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.originalPriceCents / 100}
              onChange={(e) => setFormData({ ...formData, originalPriceCents: Math.round(parseFloat(e.target.value) * 100) })}
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Call to Action</h4>
        <div className="space-y-4">
          <div>
            <Label>Texto do Botão</Label>
            <Input
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            />
          </div>
          <div>
            <Label>Link do Checkout</Label>
            <Input
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Textos da Landing Page</h4>
        <div className="space-y-4">
          <div>
            <Label>Título Hero (opcional)</Label>
            <Textarea
              value={formData.heroTitle}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              placeholder="Deixe vazio para usar o padrão"
            />
          </div>
          <div>
            <Label>Subtítulo Hero (opcional)</Label>
            <Textarea
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              placeholder="Deixe vazio para usar o padrão"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label>Evento Ativo</Label>
        </div>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
};
