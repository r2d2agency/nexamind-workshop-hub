import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Mail, Image, BarChart3, Save, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      let dataToSave: Record<string, string> = {};
      
      if (section === 'smtp') {
        dataToSave = {
          smtp_host: settings.smtp_host || '',
          smtp_port: settings.smtp_port || '587',
          smtp_user: settings.smtp_user || '',
          smtp_from_email: settings.smtp_from_email || '',
          smtp_from_name: settings.smtp_from_name || '',
          notify_new_lead: settings.notify_new_lead || 'false',
          notify_email: settings.notify_email || '',
        };
        // Only include password if it was changed
        if (settings.smtp_pass && settings.smtp_pass !== '********') {
          dataToSave.smtp_pass = settings.smtp_pass;
        }
      } else if (section === 'pixels') {
        dataToSave = {
          meta_pixel_id: settings.meta_pixel_id || '',
          google_analytics_id: settings.google_analytics_id || '',
        };
      } else if (section === 'logos') {
        dataToSave = {
          logo_admin: settings.logo_admin || '',
          logo_login: settings.logo_login || '',
          favicon: settings.favicon || '',
        };
      }

      await api.admin.updateSettings(dataToSave);
      toast.success("Configurações salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTesting(true);
    try {
      const result = await api.admin.testSmtp({
        host: settings.smtp_host,
        port: settings.smtp_port,
        user: settings.smtp_user,
        pass: settings.smtp_pass !== '********' ? settings.smtp_pass : undefined,
        fromEmail: settings.smtp_from_email,
        fromName: settings.smtp_from_name,
      });
      
      if (result.success) {
        toast.success("Conexão SMTP OK!");
      } else {
        toast.error(result.message || "Falha na conexão");
      }
    } catch (error) {
      toast.error("Erro ao testar conexão SMTP");
    } finally {
      setIsTesting(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Configurações
      </h2>

      <Tabs defaultValue="smtp" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            E-mail (SMTP)
          </TabsTrigger>
          <TabsTrigger value="pixels" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Pixels
          </TabsTrigger>
          <TabsTrigger value="logos" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Logos
          </TabsTrigger>
        </TabsList>

        {/* SMTP Settings */}
        <TabsContent value="smtp" className="card-premium mt-4 space-y-6">
          <div>
            <h3 className="font-medium mb-4">Configurações do Servidor SMTP</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp_host">Host SMTP</Label>
                <Input
                  id="smtp_host"
                  value={settings.smtp_host || ''}
                  onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_port">Porta</Label>
                <Input
                  id="smtp_port"
                  value={settings.smtp_port || '587'}
                  onChange={(e) => updateSetting('smtp_port', e.target.value)}
                  placeholder="587"
                />
              </div>
              <div>
                <Label htmlFor="smtp_user">Usuário</Label>
                <Input
                  id="smtp_user"
                  value={settings.smtp_user || ''}
                  onChange={(e) => updateSetting('smtp_user', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_pass">Senha</Label>
                <Input
                  id="smtp_pass"
                  type="password"
                  value={settings.smtp_pass || ''}
                  onChange={(e) => updateSetting('smtp_pass', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="smtp_from_email">Email de Envio</Label>
                <Input
                  id="smtp_from_email"
                  value={settings.smtp_from_email || ''}
                  onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                  placeholder="noreply@suaempresa.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp_from_name">Nome de Envio</Label>
                <Input
                  id="smtp_from_name"
                  value={settings.smtp_from_name || 'Nexamind'}
                  onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                  placeholder="Nexamind"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Notificações</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificar novos leads por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um email quando um novo lead for capturado
                  </p>
                </div>
                <Switch
                  checked={settings.notify_new_lead === 'true'}
                  onCheckedChange={(checked) => updateSetting('notify_new_lead', checked ? 'true' : 'false')}
                />
              </div>
              <div>
                <Label htmlFor="notify_email">Email para notificações</Label>
                <Input
                  id="notify_email"
                  value={settings.notify_email || ''}
                  onChange={(e) => updateSetting('notify_email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={handleTestSmtp} disabled={isTesting}>
              <TestTube className="w-4 h-4 mr-2" />
              {isTesting ? "Testando..." : "Testar Conexão"}
            </Button>
            <Button onClick={() => handleSave('smtp')} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </TabsContent>

        {/* Pixels Settings */}
        <TabsContent value="pixels" className="card-premium mt-4 space-y-6">
          <div>
            <h3 className="font-medium mb-4">Meta Pixel (Facebook)</h3>
            <div>
              <Label htmlFor="meta_pixel_id">Pixel ID</Label>
              <Input
                id="meta_pixel_id"
                value={settings.meta_pixel_id || ''}
                onChange={(e) => updateSetting('meta_pixel_id', e.target.value)}
                placeholder="123456789012345"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Encontre seu Pixel ID no Gerenciador de Eventos do Meta Business Suite
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Google Analytics</h3>
            <div>
              <Label htmlFor="google_analytics_id">Measurement ID (GA4)</Label>
              <Input
                id="google_analytics_id"
                value={settings.google_analytics_id || ''}
                onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Encontre seu ID nas configurações da propriedade no Google Analytics
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={() => handleSave('pixels')} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </TabsContent>

        {/* Logos Settings */}
        <TabsContent value="logos" className="card-premium mt-4 space-y-6">
          <div>
            <h3 className="font-medium mb-4">Logos e Imagens</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo_admin">Logo do Painel Admin (URL)</Label>
                <Input
                  id="logo_admin"
                  value={settings.logo_admin || ''}
                  onChange={(e) => updateSetting('logo_admin', e.target.value)}
                  placeholder="https://..."
                />
                {settings.logo_admin && (
                  <img src={settings.logo_admin} alt="Logo Admin" className="h-12 mt-2 bg-white p-2 rounded" />
                )}
              </div>

              <div>
                <Label htmlFor="logo_login">Logo da Página de Login (URL)</Label>
                <Input
                  id="logo_login"
                  value={settings.logo_login || ''}
                  onChange={(e) => updateSetting('logo_login', e.target.value)}
                  placeholder="https://..."
                />
                {settings.logo_login && (
                  <img src={settings.logo_login} alt="Logo Login" className="h-12 mt-2 bg-white p-2 rounded" />
                )}
              </div>

              <div>
                <Label htmlFor="favicon">Favicon (URL)</Label>
                <Input
                  id="favicon"
                  value={settings.favicon || ''}
                  onChange={(e) => updateSetting('favicon', e.target.value)}
                  placeholder="https://..."
                />
                {settings.favicon && (
                  <img src={settings.favicon} alt="Favicon" className="h-8 mt-2" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={() => handleSave('logos')} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
