import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  LogOut,
  Settings,
  Megaphone,
  UserCog,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import nexamindLogo from "@/assets/nexamind-logo.webp";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminEvents } from "@/components/admin/AdminEvents";
import { AdminPopups } from "@/components/admin/AdminPopups";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminLeads } from "@/components/admin/AdminLeads";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";

interface DashboardStats {
  leads: {
    total: string;
    new: string;
    contacted: string;
    converted: string;
    last_week: string;
  };
  payments?: {
    total: string;
    paid: string;
    revenue: number;
    last_week: string;
  };
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    created_at: string;
  }>;
  recentPayments?: Array<{
    id: string;
    amount: number;
    status: string;
    name: string;
    email: string;
    created_at: string;
  }>;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "leads" | "events" | "popups" | "users" | "settings">("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && activeTab === "dashboard") {
      loadDashboard();
    }
  }, [user, activeTab]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      new: { label: "Novo", className: "bg-blue-500/20 text-blue-400" },
      contacted: { label: "Contatado", className: "bg-yellow-500/20 text-yellow-400" },
      converted: { label: "Convertido", className: "bg-green-500/20 text-green-400" },
      lost: { label: "Perdido", className: "bg-red-500/20 text-red-400" },
      pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-400" },
      paid: { label: "Pago", className: "bg-green-500/20 text-green-400" },
      failed: { label: "Falhou", className: "bg-red-500/20 text-red-400" },
      refunded: { label: "Reembolsado", className: "bg-gray-500/20 text-gray-400" },
    };

    const variant = variants[status] || { label: status, className: "bg-gray-500/20 text-gray-400" };
    
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={nexamindLogo} alt="Nexamind" className="h-8" />
            <span className="text-muted-foreground">|</span>
            <span className="font-medium">Painel Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "leads", label: "Leads", icon: Users },
            { id: "events", label: "Landing Pages", icon: Calendar },
            { id: "popups", label: "Popups", icon: Megaphone },
            { id: "users", label: "Usuários", icon: UserCog },
            { id: "settings", label: "Configurações", icon: Settings },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-premium">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/20">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Leads</p>
                    <p className="text-2xl font-bold">{stats.leads.total}</p>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Novos (7 dias)</p>
                    <p className="text-2xl font-bold">{stats.leads.last_week}</p>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <CreditCard className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Pagamentos</p>
                    <p className="text-2xl font-bold">{stats.payments?.paid || "0"}</p>
                  </div>
                </div>
              </div>

              <div className="card-premium">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Receita</p>
                    <p className="text-2xl font-bold text-gradient-gold">
                      {formatCurrency(stats.payments?.revenue || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card-premium">
                <h3 className="font-semibold mb-4">Leads Recentes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="card-premium">
                <h3 className="font-semibold mb-4">Pagamentos Recentes</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats.recentPayments || []).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.name}</p>
                            <p className="text-xs text-muted-foreground">{payment.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && <AdminAnalytics />}

        {/* Leads Tab */}
        {activeTab === "leads" && <AdminLeads />}

        {/* Events Tab */}
        {activeTab === "events" && <AdminEvents />}

        {/* Popups Tab */}
        {activeTab === "popups" && <AdminPopups />}

        {/* Users Tab */}
        {activeTab === "users" && <AdminUsers />}

        {/* Settings Tab */}
        {activeTab === "settings" && <AdminSettings />}
      </div>
    </div>
  );
};

export default AdminDashboard;
