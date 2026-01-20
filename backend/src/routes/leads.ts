import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';

const router = Router();

const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  position: z.string().max(255).optional(),
  eventLocation: z.string().max(100).optional(),
  source: z.string().max(100).optional()
});

// Create lead (public endpoint for landing page)
router.post('/', async (req, res) => {
  try {
    const data = leadSchema.parse(req.body);

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
          event_location = COALESCE($5, event_location),
          updated_at = NOW()
        WHERE email = $6
        RETURNING id, name, email`,
        [data.name, data.phone, data.company, data.position, data.eventLocation, data.email]
      );
      
      return res.json({ 
        message: 'Lead atualizado com sucesso',
        lead: result.rows[0]
      });
    }

    // Create new lead
    const result = await query(
      `INSERT INTO leads (name, email, phone, company, position, event_location, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email`,
      [data.name, data.email, data.phone, data.company, data.position, data.eventLocation, data.source || 'landing_page']
    );

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

export { router as leadsRoutes };
