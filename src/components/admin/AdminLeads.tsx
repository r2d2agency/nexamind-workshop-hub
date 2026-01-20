import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2, 
  MessageSquare,
  Download,
  Calendar,
  MapPin,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: string;
  source: string;
  event_id: string;
  event_location: string;
  event_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface Event {
  id: string;
  name: string;
  location: string;
  slug: string;
}

export const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [eventId, setEventId] = useState("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadLeads();
  }, [page, status, eventId, source]);

  const loadEvents = async () => {
    try {
      const data = await api.admin.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (status) params.status = status;
      if (eventId) params.eventId = eventId;
      if (search) params.search = search;
      if (source) params.source = source;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await api.admin.getLeads(params);
      setLeads(data.leads);
      setTotal(data.total);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadLeads();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setEventId("");
    setSource("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await api.admin.updateLead(leadId, { status: newStatus });
      toast.success("Status atualizado!");
      loadLeads();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Tem certeza que deseja remover este lead?")) return;
    
    try {
      await api.admin.deleteLead(leadId);
      toast.success("Lead removido!");
      loadLeads();
    } catch (error) {
      toast.error("Erro ao remover lead");
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Fetch all leads for export (no pagination)
      const params: Record<string, any> = { limit: 10000 };
      if (status) params.status = status;
      if (eventId) params.eventId = eventId;
      if (search) params.search = search;
      if (source) params.source = source;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const data = await api.admin.getLeads(params);
      
      // Prepare data for Excel
      const excelData = data.leads.map((lead: Lead) => ({
        "Nome": lead.name,
        "Email": lead.email,
        "Telefone": lead.phone || "",
        "Empresa": lead.company || "",
        "Cargo": lead.position || "",
        "Status": getStatusLabel(lead.status),
        "Origem": getSourceLabel(lead.source),
        "Evento": lead.event_location || lead.event_name || "",
        "Observações": lead.notes || "",
        "Data de Cadastro": formatDate(lead.created_at),
        "Última Atualização": formatDate(lead.updated_at),
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");

      // Auto-size columns
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.max(key.length, ...excelData.map((row: any) => String(row[key] || "").length))
      }));
      ws['!cols'] = colWidths;

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `leads_${date}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);
      toast.success(`Exportado ${excelData.length} leads!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "Novo",
      contacted: "Contatado",
      converted: "Convertido",
      lost: "Perdido",
    };
    return labels[status] || status;
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      landing_page: "Landing Page",
      popup: "Popup",
      ebook: "E-book",
      exit_intent: "Exit Intent",
      manual: "Manual",
    };
    return labels[source] || source;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      new: { label: "Novo", className: "bg-blue-500/20 text-blue-400" },
      contacted: { label: "Contatado", className: "bg-yellow-500/20 text-yellow-400" },
      converted: { label: "Convertido", className: "bg-green-500/20 text-green-400" },
      lost: { label: "Perdido", className: "bg-red-500/20 text-red-400" },
    };

    const variant = variants[status] || { label: status, className: "bg-gray-500/20 text-gray-400" };
    
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      landing_page: { label: "Landing Page", className: "bg-primary/20 text-primary" },
      popup: { label: "Popup", className: "bg-purple-500/20 text-purple-400" },
      ebook: { label: "E-book", className: "bg-orange-500/20 text-orange-400" },
      exit_intent: { label: "Exit Intent", className: "bg-pink-500/20 text-pink-400" },
      manual: { label: "Manual", className: "bg-gray-500/20 text-gray-400" },
    };

    const variant = variants[source] || { label: source, className: "bg-gray-500/20 text-gray-400" };
    
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Leads
        </h2>
        <Button 
          onClick={handleExportExcel} 
          disabled={isExporting || leads.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exportando..." : "Exportar Excel"}
        </Button>
      </div>

      {/* Filters */}
      <div className="card-premium space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          Filtros
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>

          {/* Status */}
          <Select value={status || "all"} onValueChange={(val) => setStatus(val === "all" ? "" : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="new">Novos</SelectItem>
              <SelectItem value="contacted">Contatados</SelectItem>
              <SelectItem value="converted">Convertidos</SelectItem>
              <SelectItem value="lost">Perdidos</SelectItem>
            </SelectContent>
          </Select>

          {/* Event */}
          <Select value={eventId || "all"} onValueChange={(val) => setEventId(val === "all" ? "" : val)}>
            <SelectTrigger>
              <MapPin className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Eventos</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.location || event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Source */}
          <Select value={source || "all"} onValueChange={(val) => setSource(val === "all" ? "" : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Origens</SelectItem>
              <SelectItem value="landing_page">Landing Page</SelectItem>
              <SelectItem value="popup">Popup</SelectItem>
              <SelectItem value="ebook">E-book</SelectItem>
              <SelectItem value="exit_intent">Exit Intent</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date From */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data inicial</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data final</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2 col-span-2">
            <Button onClick={handleSearch} className="flex-1 sm:flex-none">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-premium overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-sm">{lead.email}</TableCell>
                  <TableCell className="text-sm">{lead.phone || "-"}</TableCell>
                  <TableCell className="text-sm">{lead.company || "-"}</TableCell>
                  <TableCell className="text-sm">{lead.event_location || "-"}</TableCell>
                  <TableCell>{getSourceBadge(lead.source)}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {formatDate(lead.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, "contacted")}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Marcar como Contatado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, "converted")}>
                          <Eye className="w-4 h-4 mr-2" />
                          Marcar como Convertido
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, "lost")}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Marcar como Perdido
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(lead.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium">{total}</span> leads
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Página {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={leads.length < 20}
              onClick={() => setPage(p => p + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
