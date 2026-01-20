# Nexamind Backend API

Backend Node.js/Express para o sistema de Workshop da Nexamind.

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+

## 🚀 Setup no EasyPanel

### 1. Variáveis de ambiente

```env
DATABASE_URL=postgresql://user:password@db:5432/nexamind
JWT_SECRET=sua_chave_segura_aqui
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://seu-frontend.com
```

### 2. Rodar migrations

```bash
npm run migrate
```

## 📚 Endpoints da API

### Públicos

- `POST /api/leads` - Cadastrar lead
- `GET /api/leads/event/:slug` - Dados do evento por slug
- `GET /api/leads/popup/:eventSlug` - Popup ativo do evento
- `GET /api/health` - Health check

### Autenticados (Admin)

#### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado

#### Dashboard
- `GET /api/admin/dashboard` - Estatísticas

#### Leads
- `GET /api/admin/leads` - Listar leads (paginado)
- `PATCH /api/admin/leads/:id` - Atualizar lead
- `DELETE /api/admin/leads/:id` - Remover lead

#### Eventos
- `GET /api/admin/events` - Listar eventos
- `GET /api/admin/events/:id` - Detalhes do evento
- `POST /api/admin/events` - Criar evento
- `PATCH /api/admin/events/:id` - Atualizar evento
- `POST /api/admin/events/:id/clone` - Clonar evento
- `DELETE /api/admin/events/:id` - Remover evento

#### Popups (E-book)
- `GET /api/admin/popups` - Listar popups
- `POST /api/admin/popups` - Criar popup
- `PATCH /api/admin/popups/:id` - Atualizar popup
- `DELETE /api/admin/popups/:id` - Remover popup

#### Configurações
- `GET /api/admin/settings` - Listar configurações
- `PATCH /api/admin/settings` - Atualizar configurações
- `POST /api/admin/settings/test-smtp` - Testar conexão SMTP

#### Upload
- `POST /api/admin/upload` - Upload de arquivo (logo, favicon, e-book)

## ⚙️ Configurações disponíveis

| Chave | Descrição |
|-------|-----------|
| `smtp_host` | Servidor SMTP |
| `smtp_port` | Porta SMTP (587 ou 465) |
| `smtp_user` | Usuário SMTP |
| `smtp_pass` | Senha SMTP |
| `smtp_from_email` | Email de origem |
| `smtp_from_name` | Nome de origem |
| `logo_admin` | URL do logo do admin |
| `logo_login` | URL do logo da tela de login |
| `favicon` | URL do favicon |
| `notify_new_lead` | Notificar novos leads (true/false) |
| `notify_email` | Email para notificações |

## 👤 Login Admin Padrão

- **Email:** `admin@nexamind.com.br`
- **Senha:** `admin123`

⚠️ Troque a senha após o primeiro login!

## 🔄 Atualizando

Após atualizar o código, rode as migrations novamente:

```bash
npm run migrate
```

As migrations são idempotentes (podem ser rodadas múltiplas vezes).
