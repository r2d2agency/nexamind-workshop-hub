import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { sendLeadNotification } from '../services/email';

const router = Router();

const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  position: z.string().max(255).optional(),
  eventSlug: z.string().max(100).optional(),
  source: z.string().max(100).optional()
});

// Create lead (public endpoint for landing page)
router.post('/', async (req, res) => {
  try {
    const data = leadSchema.parse(req.body);

    // Get event ID from slug if provided
    let eventId = null;
    if (data.eventSlug) {
      const eventResult = await query(
        'SELECT id FROM events WHERE slug = $1',
        [data.eventSlug]
      );
      if (eventResult.rows[0]) {
        eventId = eventResult.rows[0].id;
      }
    }

    // Check if email already exists
    const existing = await query(
      'SELECT id FROM leads WHERE email = $1',
      [data.email]
    );

    if (existing.rows.length > 0) {
      // Update existing lead
      const result = await query(
        `UPDATE leads SET 
          name = $1, 
          phone = COALESCE($2, phone),
          company = COALESCE($3, company),
          position = COALESCE($4, position),
          event_id = COALESCE($5, event_id),
          source = COALESCE($6, source),
          updated_at = NOW()
        WHERE email = $7
        RETURNING id, name, email`,
        [data.name, data.phone, data.company, data.position, eventId, data.source, data.email]
      );
      
      return res.json({ 
        message: 'Lead atualizado com sucesso',
        lead: result.rows[0]
      });
    }

    // Create new lead
    const result = await query(
      `INSERT INTO leads (name, email, phone, company, position, event_id, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email`,
      [data.name, data.email, data.phone, data.company, data.position, eventId, data.source || 'landing_page']
    );

    // Send notification email (async, don't wait)
    sendLeadNotification({
      name: data.name,
      email: data.email,
      phone: data.phone,
      source: data.source || 'landing_page'
    }).catch(console.error);

    res.status(201).json({
      message: 'Lead criado com sucesso',
      lead: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Get event data by slug (public)
router.get('/event/:slug', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, slug, name, location, address, date, time_start, time_end, 
              price_cents, original_price_cents, current_batch, batch_end_date,
              max_capacity, current_capacity, cta_text, cta_link, hero_title, hero_subtitle
       FROM events WHERE slug = $1 AND is_active = true`,
      [req.params.slug]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
});

// Get active popup for event (public)
router.get('/popup/:eventSlug', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.id, p.title, p.subtitle, p.ebook_url, p.trigger_type
       FROM popups p
       JOIN events e ON p.event_id = e.id
       WHERE e.slug = $1 AND p.is_active = true
       LIMIT 1`,
      [req.params.eventSlug]
    );

    if (!result.rows[0]) {
      // Check for global popup (no event_id)
      const globalResult = await query(
        `SELECT id, title, subtitle, ebook_url, trigger_type
         FROM popups 
         WHERE event_id IS NULL AND is_active = true
         LIMIT 1`
      );
      
      if (!globalResult.rows[0]) {
        return res.status(404).json({ error: 'Nenhum popup ativo' });
      }
      
      return res.json(globalResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
});

export { router as leadsRoutes };
