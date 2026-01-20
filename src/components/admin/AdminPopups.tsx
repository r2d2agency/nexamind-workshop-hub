import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Trash2, Edit, Upload, Image, FileText } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Popup {
  id: string;
  event_id: string | null;
  name: string;
  title: string;
  subtitle: string;
  image_url: string;
  ebook_url: string;
  trigger_type: string;
  trigger_delay: number;
  is_active: boolean;
  event_location?: string;
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  location: string;
}

export const AdminPopups = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const ebookInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    eventId: "",
    name: "",
    title: "",
    subtitle: "",
    imageUrl: "",
    ebookUrl: "",
    triggerType: "exit_intent",
    triggerDelay: 5,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [popupsData, eventsData] = await Promise.all([
        api.admin.getPopups(),
        api.admin.getEvents(),
      ]);
      setPopups(popupsData);
      setEvents(eventsData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        name: formData.name,
        title: formData.title,
        subtitle: formData.subtitle,
        imageUrl: formData.imageUrl,
        ebookUrl: formData.ebookUrl,
        triggerType: formData.triggerType,
        triggerDelay: formData.triggerDelay,
        isActive: formData.isActive,
        eventId: formData.eventId || undefined,
      };

      if (editingPopup) {
        await api.admin.updatePopup(editingPopup.id, data);
        toast.success("Popup atualizado!");
      } else {
        await api.admin.createPopup(data);
        toast.success("Popup criado!");
      }
      
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar popup");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este popup?")) return;
    
    try {
      await api.admin.deletePopup(id);
      toast.success("Popup removido!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover popup");
    }
  };

  const handleToggleActive = async (popup: Popup) => {
    try {
      await api.admin.updatePopup(popup.id, { isActive: !popup.is_active });
      toast.success(popup.is_active ? "Popup desativado!" : "Popup ativado!");
      loadData();
    } catch (error) {
      toast.error("Erro ao atualizar popup");
    }
  };

  const openEditDialog = (popup: Popup) => {
    setEditingPopup(popup);
    setFormData({
      eventId: popup.event_id || "",
      name: popup.name,
      title: popup.title,
      subtitle: popup.subtitle || "",
      imageUrl: popup.image_url || "",
      ebookUrl: popup.ebook_url || "",
      triggerType: popup.trigger_type,
      triggerDelay: popup.trigger_delay || 5,
      isActive: popup.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPopup(null);
    setFormData({
      eventId: "",
      name: "",
      title: "",
      subtitle: "",
      imageUrl: "",
      ebookUrl: "",
      triggerType: "exit_intent",
      triggerDelay: 5,
      isActive: true,
    });
  };

  const handleFileUpload = async (file: File, type: 'image' | 'ebook') => {
    setUploading(type);
    try {
      const result = await api.admin.uploadFile(file);
      if (type === 'image') {
        setFormData(prev => ({ ...prev, imageUrl: result.url }));
      } else {
        setFormData(prev => ({ ...prev, ebookUrl: result.url }));
      }
      toast.success(`${type === 'image' ? 'Imagem' : 'E-book'} enviado!`);
    } catch (error: any) {
      toast.error(error.message || `Erro ao enviar ${type}`);
    } finally {
      setUploading(null);
    }
  };

  const getTriggerLabel = (type: string) => {
    const labels: Record<string, string> = {
      exit_intent: "Saída da Página",
      time_delay: "Tempo",
      scroll: "Scroll",
    };
    return labels[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Popups de Captura
        </h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Popup
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPopup ? "Editar Popup" : "Novo Popup"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome (interno)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Popup E-book Janeiro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="event">Evento (opcional)</Label>
                <Select
                  value={formData.eventId || "all"}
                  onValueChange={(val) => setFormData({ ...formData, eventId: val === "all" ? "" : val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os eventos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os eventos</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Título do Popup</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Não vá embora!"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Baixe nosso e-book gratuito..."
                />
              </div>

              <div>
                <Label>Imagem do Popup</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="URL da imagem ou faça upload"
                    className="flex-1"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'image');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploading === 'image'}
                  >
                    {uploading === 'image' ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Image className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" className="mt-2 h-20 rounded object-cover" />
                )}
              </div>

              <div>
                <Label>Arquivo do E-book</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={formData.ebookUrl}
                    onChange={(e) => setFormData({ ...formData, ebookUrl: e.target.value })}
                    placeholder="URL do e-book ou faça upload"
                    className="flex-1"
                  />
                  <input
                    ref={ebookInputRef}
                    type="file"
                    accept=".pdf,.epub,.mobi"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'ebook');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => ebookInputRef.current?.click()}
                    disabled={uploading === 'ebook'}
                  >
                    {uploading === 'ebook' ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {formData.ebookUrl && (
                  <p className="mt-1 text-xs text-muted-foreground truncate">{formData.ebookUrl}</p>
                )}
              </div>

              <div>
                <Label htmlFor="trigger">Gatilho</Label>
                <Select
                  value={formData.triggerType}
                  onValueChange={(val) => setFormData({ ...formData, triggerType: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exit_intent">Saída da Página (Exit Intent)</SelectItem>
                    <SelectItem value="time_delay">Após Tempo</SelectItem>
                    <SelectItem value="scroll">Após Scroll</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.triggerType === "time_delay" && (
                <div>
                  <Label htmlFor="triggerDelay">Tempo (segundos)</Label>
                  <Input
                    id="triggerDelay"
                    type="number"
                    min="1"
                    value={formData.triggerDelay}
                    onChange={(e) => setFormData({ ...formData, triggerDelay: parseInt(e.target.value) || 5 })}
                    placeholder="5"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Popup Ativo</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPopup ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="card-premium">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Gatilho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {popups.map((popup) => (
              <TableRow key={popup.id}>
                <TableCell className="font-medium">{popup.name}</TableCell>
                <TableCell>{popup.title}</TableCell>
                <TableCell>
                  {popup.event_location || "Todos"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getTriggerLabel(popup.trigger_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={popup.is_active}
                    onCheckedChange={() => handleToggleActive(popup)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(popup)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(popup.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {popups.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-8">
            Nenhum popup encontrado.
          </p>
        )}
      </div>
    </motion.div>
  );
};
