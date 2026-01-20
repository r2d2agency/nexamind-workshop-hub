import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

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
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` WHERE status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      const searchCondition = status ? ' AND' : ' WHERE';
      whereClause += `${searchCondition} (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM leads${whereClause}`,
      params
    );

    const result = await query(
      `SELECT * FROM leads${whereClause} 
       ORDER BY created_at DESC 
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

// ========== PAYMENTS ==========

// Get all payments
router.get('/payments', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let whereClause = status ? ` WHERE p.status = $1` : '';
    const params = status ? [status] : [];

    const countResult = await query(
      `SELECT COUNT(*) FROM payments p${whereClause}`,
      params
    );

    const result = await query(
      `SELECT p.*, l.name as lead_name, l.email as lead_email
       FROM payments p
       LEFT JOIN leads l ON p.lead_id = l.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      payments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
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

// Update event
router.patch('/events/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      name: z.string().max(255).optional(),
      location: z.string().max(255).optional(),
      address: z.string().optional(),
      date: z.string().optional(),
      timeStart: z.string().optional(),
      timeEnd: z.string().optional(),
      priceCents: z.number().positive().optional(),
      originalPriceCents: z.number().positive().optional(),
      maxCapacity: z.number().positive().optional(),
      isActive: z.boolean().optional()
    });

    const data = schema.parse(req.body);

    const fieldMap: Record<string, string> = {
      name: 'name',
      location: 'location',
      address: 'address',
      date: 'date',
      timeStart: 'time_start',
      timeEnd: 'time_end',
      priceCents: 'price_cents',
      originalPriceCents: 'original_price_cents',
      maxCapacity: 'max_capacity',
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

// ========== DASHBOARD ==========

// Get dashboard stats
router.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const [leadsStats, paymentsStats, recentLeads, recentPayments] = await Promise.all([
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
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'paid') as paid,
          SUM(amount) FILTER (WHERE status = 'paid') as revenue,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_week
        FROM payments
      `),
      query(`
        SELECT id, name, email, status, created_at 
        FROM leads 
        ORDER BY created_at DESC 
        LIMIT 5
      `),
      query(`
        SELECT p.id, p.amount, p.status, p.created_at, l.name, l.email
        FROM payments p
        LEFT JOIN leads l ON p.lead_id = l.id
        ORDER BY p.created_at DESC 
        LIMIT 5
      `)
    ]);

    res.json({
      leads: leadsStats.rows[0],
      payments: {
        ...paymentsStats.rows[0],
        revenue: parseInt(paymentsStats.rows[0].revenue || '0')
      },
      recentLeads: recentLeads.rows,
      recentPayments: recentPayments.rows
    });
  } catch (error) {
    throw error;
  }
});

export { router as adminRoutes };
