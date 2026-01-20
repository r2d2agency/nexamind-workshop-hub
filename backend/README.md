# Nexamind Backend API

Backend Node.js/Express para o sistema de Workshop da Nexamind.

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta Stripe

## 🚀 Setup no EasyPanel

### 1. Criar banco PostgreSQL no EasyPanel

1. No EasyPanel, vá em "Create Service" → "Database" → "PostgreSQL"
2. Defina nome: `nexamind-db`
3. Copie a connection string gerada

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure as variáveis:

```env
DATABASE_URL=postgresql://user:password@nexamind-db:5432/postgres
JWT_SECRET=gere_uma_chave_segura_aqui
STRIPE_SECRET_KEY=sk_live_sua_chave
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook
FRONTEND_URL=https://seu-dominio.com
```

### 3. Deploy no EasyPanel

1. Crie um novo serviço "App" no EasyPanel
2. Conecte ao repositório Git ou faça upload dos arquivos
3. Configure o build:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Configure as variáveis de ambiente
5. Deploy!

### 4. Rodar migrations

Após o deploy, execute:

```bash
npm run migrate
```

Isso criará as tabelas e o usuário admin padrão.

## 📚 Endpoints da API

### Públicos

- `POST /api/leads` - Cadastrar lead
- `POST /api/payments/create-checkout` - Criar sessão de pagamento
- `GET /api/payments/status/:sessionId` - Status do pagamento
- `POST /api/webhook/stripe` - Webhook do Stripe

### Autenticados (Admin)

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `GET /api/admin/dashboard` - Estatísticas
- `GET /api/admin/leads` - Listar leads
- `PATCH /api/admin/leads/:id` - Atualizar lead
- `DELETE /api/admin/leads/:id` - Remover lead
- `GET /api/admin/payments` - Listar pagamentos
- `GET /api/admin/events` - Listar eventos
- `PATCH /api/admin/events/:id` - Atualizar evento

## 🔐 Configurar Stripe Webhook

1. No [Dashboard Stripe](https://dashboard.stripe.com/webhooks), crie um webhook
2. URL: `https://seu-backend.com/api/webhook/stripe`
3. Eventos para escutar:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
4. Copie o "Signing secret" para `STRIPE_WEBHOOK_SECRET`

## 👤 Login Admin Padrão

Após rodar as migrations:

- Email: `admin@nexamind.com.br`
- Senha: `admin123`

**⚠️ IMPORTANTE:** Troque a senha imediatamente após o primeiro login!
