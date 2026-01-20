import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Set timezone to Brazil (Brasília) for all connections
pool.on('connect', (client) => {
  client.query("SET timezone = 'America/Sao_Paulo'");
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
