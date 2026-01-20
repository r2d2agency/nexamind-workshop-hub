import { pool } from './index';
import dotenv from 'dotenv';

dotenv.config();

const migrations = `
-- Enum for lead status
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'lost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum for lead source
DO $$ BEGIN
  CREATE TYPE lead_source AS ENUM ('landing_page', 'popup_ebook', 'checkout', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  position VARCHAR(255),
  source VARCHAR(100) DEFAULT 'landing_page',
  status lead_status DEFAULT 'new',
  notes TEXT,
  event_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events/Landing Pages table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  address TEXT,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  
  -- Pricing (lotes)
  current_batch INTEGER DEFAULT 1,
  price_cents INTEGER NOT NULL DEFAULT 49700,
  original_price_cents INTEGER DEFAULT 99700,
  batch_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Capacity
  max_capacity INTEGER DEFAULT 100,
  current_capacity INTEGER DEFAULT 0,
  
  -- Customization
  hero_title TEXT,
  hero_subtitle TEXT,
  cta_text VARCHAR(255) DEFAULT 'GARANTIR MINHA VAGA',
  cta_link TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (SMTP, logos, etc)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Popup/E-book configurations
CREATE TABLE IF NOT EXISTS popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  ebook_url TEXT,
  ebook_filename VARCHAR(255),
  trigger_type VARCHAR(50) DEFAULT 'exit_intent',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_event ON leads(event_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_popups_event ON popups(event_id);

-- Insert/Update admin user (password: 123456 - CHANGE THIS!)
-- Hash gerado com: bcrypt.hashSync('123456', 10)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES ('tnicodemos@gmail.com', '$2a$10$8K1p/a0dL1L5JYDZoxnAZeRRfqGRGtU0a0u0A6iXBZOvCwEI5hD8K', 'Admin', 'super_admin')
ON CONFLICT (email) DO UPDATE SET password_hash = '$2a$10$8K1p/a0dL1L5JYDZoxnAZeRRfqGRGtU0a0u0A6iXBZOvCwEI5hD8K';

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('smtp_host', ''),
  ('smtp_port', '587'),
  ('smtp_user', ''),
  ('smtp_pass', ''),
  ('smtp_from_email', ''),
  ('smtp_from_name', 'Nexamind'),
  ('logo_admin', ''),
  ('logo_login', ''),
  ('favicon', ''),
  ('notify_new_lead', 'true'),
  ('notify_email', '')
ON CONFLICT (key) DO NOTHING;

-- Insert default events
INSERT INTO events (slug, name, location, address, date, time_start, time_end, price_cents, original_price_cents, max_capacity, cta_link)
VALUES 
  ('tangara', 'Workshop Negócios Lucrativos', 'Tangará da Serra', 'Hotel Ibis - Tangará da Serra, MT', '2026-03-12', '18:00', '22:00', 49700, 99700, 100, 'https://tinyurl.com/workshopnexaminddho'),
  ('campo-novo', 'Workshop Negócios Lucrativos', 'Campo Novo dos Parecis', 'A definir', '2026-03-13', '18:00', '22:00', 49700, 99700, 80, 'https://tinyurl.com/workshopnexaminddho')
ON CONFLICT (slug) DO NOTHING;

-- Insert default email template
INSERT INTO email_templates (name, subject, body) VALUES
  ('new_lead', 'Novo lead capturado: {{name}}', '<h2>Novo Lead!</h2><p><strong>Nome:</strong> {{name}}</p><p><strong>Email:</strong> {{email}}</p><p><strong>Telefone:</strong> {{phone}}</p><p><strong>Origem:</strong> {{source}}</p>'),
  ('welcome', 'Bem-vindo ao Workshop!', '<h2>Olá {{name}}!</h2><p>Obrigado pelo seu interesse no Workshop Negócios Lucrativos.</p><p>Em breve entraremos em contato com mais informações.</p>')
ON CONFLICT (name) DO NOTHING;
`;

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    await pool.query(migrations);
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
