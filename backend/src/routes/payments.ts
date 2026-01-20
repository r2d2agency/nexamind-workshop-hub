import { Router } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { query } from '../db';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const checkoutSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  eventId: z.string().uuid()
});

// Create checkout session
router.post('/create-checkout', async (req, res) => {
  try {
    const data = checkoutSchema.parse(req.body);

    // Get event details
    const eventResult = await query(
      'SELECT id, name, location, date, price_cents FROM events WHERE id = $1 AND is_active = true',
      [data.eventId]
    );

    const event = eventResult.rows[0];
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Check capacity
    if (event.current_capacity >= event.max_capacity) {
      return res.status(400).json({ error: 'Evento esgotado' });
    }

    // Create or get lead
    let leadId: string;
    const existingLead = await query(
      'SELECT id FROM leads WHERE email = $1',
      [data.email]
    );

    if (existingLead.rows.length > 0) {
      leadId = existingLead.rows[0].id;
    } else {
      const newLead = await query(
        `INSERT INTO leads (name, email, phone, event_location, source)
         VALUES ($1, $2, $3, $4, 'checkout')
         RETURNING id`,
        [data.name, data.email, data.phone, event.location]
      );
      leadId = newLead.rows[0].id;
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: {
        lead_id: leadId,
        event_id: data.eventId
      }
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `${event.name} - ${event.location}`,
              description: `Data: ${new Date(event.date).toLocaleDateString('pt-BR')}`
            },
            unit_amount: event.price_cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
      metadata: {
        lead_id: leadId,
        event_id: data.eventId,
        event_location: event.location
      },
      payment_intent_data: {
        metadata: {
          lead_id: leadId,
          event_id: data.eventId
        }
      }
    });

    // Create pending payment record
    await query(
      `INSERT INTO payments (lead_id, stripe_customer_id, stripe_payment_id, amount, event_location, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [leadId, customer.id, session.id, event.price_cents, event.location]
    );

    res.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Stripe error:', error);
    throw error;
  }
});

// Get payment status
router.get('/status/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Erro ao buscar status do pagamento' });
  }
});

export { router as paymentsRoutes };
