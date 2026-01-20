import { pool } from './index';
import dotenv from 'dotenv';

dotenv.config();

const migrations = `
-- Enum for payment status
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum for lead status
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'converted', 'lost');
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
  event_location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  stripe_payment_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'brl',
  status payment_status DEFAULT 'pending',
  event_location VARCHAR(100),
  payment_method VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (for workshop locations/dates)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  address TEXT,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  price_cents INTEGER NOT NULL,
  original_price_cents INTEGER,
  max_capacity INTEGER DEFAULT 100,
  current_capacity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_lead ON payments(lead_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES ('admin@nexamind.com.br', '$2a$10$rQnM5.qKvH5JqA5u5GVnXOKvKvKvKvKvKvKvKvKvKvKvKvKvKv', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default events
INSERT INTO events (name, location, address, date, time_start, time_end, price_cents, original_price_cents, max_capacity)
VALUES 
  ('Workshop Negócios Lucrativos', 'Tangará da Serra', 'Hotel Ibis - Tangará da Serra, MT', '2026-03-12', '18:00', '22:00', 49700, 99700, 100),
  ('Workshop Negócios Lucrativos', 'Campo Novo dos Parecis', 'A definir', '2026-03-13', '18:00', '22:00', 49700, 99700, 80)
ON CONFLICT DO NOTHING;
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
