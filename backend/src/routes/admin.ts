import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { testSmtpConnection } from '../services/email';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|ico|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Tipo de arquivo não permitido'));
  }
});

// All admin routes require authentication
router.use(authenticateToken);
router.use(requireAdmin);

// ========== LEADS ==========

// Get all leads with pagination
router.get('/leads', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const eventId = req.query.eventId as string;
    const source = req.query.source as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    const addCondition = (condition: string) => {
      whereClause += whereClause ? ' AND ' + condition : ' WHERE ' + condition;
    };

    if (status) {
      addCondition(`l.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (eventId) {
      addCondition(`l.event_id = $${paramIndex}`);
      params.push(eventId);
      paramIndex++;
    }

    if (source) {
      addCondition(`l.source = $${paramIndex}`);
      params.push(source);
      paramIndex++;
    }

    if (dateFrom) {
      addCondition(`l.created_at >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      addCondition(`l.created_at <= $${paramIndex}::date + interval '1 day'`);
      params.push(dateTo);
      paramIndex++;
    }

    if (search) {
      addCondition(`(l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM leads l${whereClause}`,
      params
    );

    const result = await query(
      `SELECT l.*, e.location as event_location, e.name as event_name
       FROM leads l
       LEFT JOIN events e ON l.event_id = e.id
       ${whereClause}
       ORDER BY l.created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      leads: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (error) {
    throw error;
  }
});

// Update lead status
router.patch('/leads/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      status: z.enum(['new', 'contacted', 'converted', 'lost']).optional(),
      notes: z.string().max(2000).optional()
    });

    const data = schema.parse(req.body);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.status) {
      updates.push(`status = $${paramIndex}`);
      params.push(data.status);
      paramIndex++;
    }

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      params.push(data.notes);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await query(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Delete lead
router.delete('/leads/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'DELETE FROM leads WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    res.json({ message: 'Lead removido com sucesso' });
  } catch (error) {
    throw error;
  }
});

// ========== EVENTS ==========

// Get all events
router.get('/events', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM events ORDER BY date ASC'
    );
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
});

// Get single event
router.get('/events/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT * FROM events WHERE id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
});

// Create event
router.post('/events', async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      slug: z.string().min(2).max(100),
      name: z.string().max(255),
      location: z.string().max(255),
      address: z.string().optional(),
      date: z.string(),
      timeStart: z.string(),
      timeEnd: z.string(),
      priceCents: z.number().positive().optional(),
      originalPriceCents: z.number().positive().optional(),
      maxCapacity: z.number().positive().optional(),
      ctaLink: z.string().optional(),
      heroTitle: z.string().optional(),
      heroSubtitle: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const result = await query(
      `INSERT INTO events (slug, name, location, address, date, time_start, time_end, price_cents, original_price_cents, max_capacity, cta_link, hero_title, hero_subtitle)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        data.slug,
        data.name,
        data.location,
        data.address,
        data.date,
        data.timeStart,
        data.timeEnd,
        data.priceCents || 49700,
        data.originalPriceCents || 99700,
        data.maxCapacity || 100,
        data.ctaLink,
        data.heroTitle,
        data.heroSubtitle,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Update event
router.patch('/events/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      slug: z.string().max(100).optional(),
      name: z.string().max(255).optional(),
      location: z.string().max(255).optional(),
      address: z.string().optional(),
      date: z.string().optional(),
      timeStart: z.string().optional(),
      timeEnd: z.string().optional(),
      currentBatch: z.number().positive().optional(),
      priceCents: z.number().positive().optional(),
      originalPriceCents: z.number().positive().optional(),
      batchEndDate: z.string().optional(),
      maxCapacity: z.number().positive().optional(),
      ctaText: z.string().optional(),
      ctaLink: z.string().optional(),
      heroTitle: z.string().optional(),
      heroSubtitle: z.string().optional(),
      isActive: z.boolean().optional()
    });

    const data = schema.parse(req.body);

    const fieldMap: Record<string, string> = {
      slug: 'slug',
      name: 'name',
      location: 'location',
      address: 'address',
      date: 'date',
      timeStart: 'time_start',
      timeEnd: 'time_end',
      currentBatch: 'current_batch',
      priceCents: 'price_cents',
      originalPriceCents: 'original_price_cents',
      batchEndDate: 'batch_end_date',
      maxCapacity: 'max_capacity',
      ctaText: 'cta_text',
      ctaLink: 'cta_link',
      heroTitle: 'hero_title',
      heroSubtitle: 'hero_subtitle',
      isActive: 'is_active'
    };

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        updates.push(`${dbField} = $${paramIndex}`);
        params.push((data as any)[key]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Clone event
router.post('/events/:id/clone', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { slug, location, date } = req.body;

    if (!slug || !location) {
      return res.status(400).json({ error: 'Slug e location são obrigatórios' });
    }

    // Get original event
    const original = await query('SELECT * FROM events WHERE id = $1', [id]);
    if (!original.rows[0]) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    const event = original.rows[0];

    // Create clone
    const result = await query(
      `INSERT INTO events (slug, name, location, address, date, time_start, time_end, price_cents, original_price_cents, max_capacity, cta_link, hero_title, hero_subtitle, cta_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        slug,
        event.name,
        location,
        'A definir',
        date || event.date,
        event.time_start,
        event.time_end,
        event.price_cents,
        event.original_price_cents,
        event.max_capacity,
        event.cta_link,
        event.hero_title,
        event.hero_subtitle,
        event.cta_text,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    throw error;
  }
});

// Delete event
router.delete('/events/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    throw error;
  }
});

// ========== POPUPS ==========

// Get all popups
router.get('/popups', async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT p.*, e.location as event_location 
      FROM popups p
      LEFT JOIN events e ON p.event_id = e.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
});

// Create popup
router.post('/popups', async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      eventId: z.string().uuid().optional(),
      name: z.string().max(255),
      title: z.string().max(255),
      subtitle: z.string().optional(),
      imageUrl: z.string().optional(),
      ebookUrl: z.string().optional(),
      triggerType: z.enum(['exit_intent', 'time_delay', 'scroll']).optional(),
      triggerDelay: z.number().positive().optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const result = await query(
      `INSERT INTO popups (event_id, name, title, subtitle, image_url, ebook_url, trigger_type, trigger_delay, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.eventId || null,
        data.name,
        data.title,
        data.subtitle,
        data.imageUrl,
        data.ebookUrl,
        data.triggerType || 'exit_intent',
        data.triggerDelay || 5,
        data.isActive !== false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Update popup
router.patch('/popups/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      eventId: z.string().uuid().optional(),
      name: z.string().max(255).optional(),
      title: z.string().max(255).optional(),
      subtitle: z.string().optional(),
      imageUrl: z.string().optional(),
      ebookUrl: z.string().optional(),
      triggerType: z.string().optional(),
      triggerDelay: z.number().positive().optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const fieldMap: Record<string, string> = {
      eventId: 'event_id',
      name: 'name',
      title: 'title',
      subtitle: 'subtitle',
      imageUrl: 'image_url',
      ebookUrl: 'ebook_url',
      triggerType: 'trigger_type',
      triggerDelay: 'trigger_delay',
      isActive: 'is_active'
    };

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        updates.push(`${dbField} = $${paramIndex}`);
        params.push((data as any)[key]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await query(
      `UPDATE popups SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Popup não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Delete popup
router.delete('/popups/:id', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'DELETE FROM popups WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Popup não encontrado' });
    }

    res.json({ message: 'Popup removido com sucesso' });
  } catch (error) {
    throw error;
  }
});

// ========== SETTINGS ==========

// Get all settings
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      // Don't expose SMTP password
      if (row.key === 'smtp_pass' && row.value) {
        settings[row.key] = '********';
      } else {
        settings[row.key] = row.value;
      }
    }
    res.json(settings);
  } catch (error) {
    throw error;
  }
});

// Update settings
router.patch('/settings', async (req: AuthRequest, res) => {
  try {
    const allowedKeys = [
      'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email', 'smtp_from_name',
      'logo_admin', 'logo_login', 'favicon',
      'notify_new_lead', 'notify_email',
      'meta_pixel_id', 'google_analytics_id',
      'custom_head_scripts', 'custom_body_scripts'
    ];

    const updates = req.body as Record<string, string>;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedKeys.includes(key)) {
        await query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
          [key, value]
        );
      }
    }

    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (error) {
    throw error;
  }
});

// ========== USERS ==========

// Get all admin users
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, created_at FROM admin_users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    throw error;
  }
});

// Create admin user
router.post('/users', async (req: AuthRequest, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const schema = z.object({
      email: z.string().email(),
      name: z.string().max(255),
      password: z.string().min(6),
      role: z.enum(['admin', 'super_admin']).optional()
    });

    const data = schema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await query(
      `INSERT INTO admin_users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at`,
      [data.email, passwordHash, data.name, data.role || 'admin']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if ((error as any).code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    throw error;
  }
});

// Update admin user
router.patch('/users/:id', async (req: AuthRequest, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { id } = req.params;
    const schema = z.object({
      email: z.string().email().optional(),
      name: z.string().max(255).optional(),
      password: z.string().min(6).optional(),
      role: z.enum(['admin', 'super_admin']).optional()
    });

    const data = schema.parse(req.body);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.email) {
      updates.push(`email = $${paramIndex}`);
      params.push(data.email);
      paramIndex++;
    }
    if (data.name) {
      updates.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      updates.push(`password_hash = $${paramIndex}`);
      params.push(passwordHash);
      paramIndex++;
    }
    if (data.role) {
      updates.push(`role = $${paramIndex}`);
      params.push(data.role);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await query(
      `UPDATE admin_users SET ${updates.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, email, name, role, created_at`,
      params
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Delete admin user
router.delete('/users/:id', async (req: AuthRequest, res) => {
  try {
    // Prevent deleting yourself
    if (req.user!.id === req.params.id) {
      return res.status(400).json({ error: 'Você não pode remover sua própria conta' });
    }

    const result = await query(
      'DELETE FROM admin_users WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    throw error;
  }
});

// Test SMTP connection
router.post('/settings/test-smtp', async (req: AuthRequest, res) => {
  try {
    const { host, port, user, pass, fromEmail, fromName } = req.body;

    const success = await testSmtpConnection({
      host,
      port: parseInt(port) || 587,
      user,
      pass,
      fromEmail: fromEmail || user,
      fromName: fromName || 'Nexamind',
    });

    if (success) {
      res.json({ success: true, message: 'Conexão SMTP bem sucedida!' });
    } else {
      res.status(400).json({ success: false, message: 'Falha na conexão SMTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao testar conexão' });
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
  } catch (error) {
    throw error;
  }
});

// ========== DASHBOARD ==========

// Get dashboard stats
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const [leadsStats, eventsStats, recentLeads] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'new') as new,
          COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
          COUNT(*) FILTER (WHERE status = 'converted') as converted,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_week
        FROM leads
      `),
      query(`
        SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active
        FROM events
      `),
      query(`
        SELECT l.id, l.name, l.email, l.status, l.source, l.created_at, e.location as event_location
        FROM leads l
        LEFT JOIN events e ON l.event_id = e.id
        ORDER BY l.created_at DESC 
        LIMIT 10
      `)
    ]);

    res.json({
      leads: leadsStats.rows[0],
      events: eventsStats.rows[0],
      recentLeads: recentLeads.rows,
    });
  } catch (error) {
    throw error;
  }
});

export { router as adminRoutes };
