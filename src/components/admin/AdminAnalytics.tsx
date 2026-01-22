import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Monitor, Smartphone, Tablet, TrendingUp, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OverviewStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  uniqueToday: number;
}

interface DayData {
  date: string;
  views: string;
}

interface EventData {
  slug: string;
  name: string;
  location: string;
  total_views: string;
  today: string;
  last_7_days: string;
}

interface DeviceData {
  device_type: string;
  count: string;
}

interface ReferrerData {
  source: string;
  count: string;
}

const COLORS = ['hsl(40, 80%, 55%)', 'hsl(200, 80%, 55%)', 'hsl(150, 60%, 45%)'];

export const AdminAnalytics = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [referrerData, setReferrerData] = useState<ReferrerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartDays, setChartDays] = useState("30");

  useEffect(() => {
    loadAnalytics();
  }, [chartDays]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, dayRes, eventRes, deviceRes, referrerRes] = await Promise.all([
        apiFetch('/analytics/overview'),
        apiFetch(`/analytics/by-day?days=${chartDays}`),
        apiFetch('/analytics/by-event'),
        apiFetch('/analytics/by-device'),
        apiFetch('/analytics/referrers'),
      ]);

      setOverview(await overviewRes.json());
      setDayData(await dayRes.json());
      setEventData(await eventRes.json());
      setDeviceData(await deviceRes.json());
      setReferrerData(await referrerRes.json());
    } catch (error) {
      toast.error("Erro ao carregar analytics");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceLabel = (type: string) => {
    switch (type) {
      case 'mobile': return 'Mobile';
      case 'tablet': return 'Tablet';
      default: return 'Desktop';
    }
  };

  const chartData = dayData.map(d => ({
    date: formatDate(d.date),
    views: parseInt(d.views),
  }));

  const pieData = deviceData.map(d => ({
    name: getDeviceLabel(d.device_type),
    value: parseInt(d.count),
  }));

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics de Acessos</h2>
        <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-premium">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Hoje</p>
                <p className="text-xl font-bold">{overview.today.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="card-premium">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Últimos 7 dias</p>
                <p className="text-xl font-bold">{overview.last7Days.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="card-premium">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Últimos 30 dias</p>
                <p className="text-xl font-bold">{overview.last30Days.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="card-premium">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="text-xl font-bold">{overview.total.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 card-premium">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Acessos por Dia</h3>
            <Select value={chartDays} onValueChange={setChartDays}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-[250px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(40, 80%, 55%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(40, 80%, 55%)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart - Devices */}
        <div className="card-premium">
          <h3 className="font-semibold mb-4">Por Dispositivo</h3>
          <div className="h-[180px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {deviceData.map((d, i) => (
              <div key={d.device_type} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="flex items-center gap-1">
                  {getDeviceIcon(d.device_type)}
                  {parseInt(d.count).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Event */}
        <div className="card-premium">
          <h3 className="font-semibold mb-4">Por Evento</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Hoje</TableHead>
                <TableHead className="text-right">7 dias</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventData.map((event) => (
                <TableRow key={event.slug}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-xs text-muted-foreground">/{event.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{parseInt(event.today).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right">{parseInt(event.last_7_days).toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-medium">{parseInt(event.total_views).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
              {eventData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Top Referrers */}
        <div className="card-premium">
          <h3 className="font-semibold mb-4">Origem do Tráfego</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Acessos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrerData.map((ref) => (
                <TableRow key={ref.source}>
                  <TableCell className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    {ref.source}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {parseInt(ref.count).toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
              {referrerData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
};
