import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { query } from '../db';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Stripe webhook (needs raw body)
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update payment status
        await query(
          `UPDATE payments 
           SET status = 'paid', 
               stripe_payment_id = $1,
               updated_at = NOW()
           WHERE stripe_customer_id = $2`,
          [session.payment_intent, session.customer]
        );

        // Update lead status
        if (session.metadata?.lead_id) {
          await query(
            `UPDATE leads SET status = 'converted', updated_at = NOW() WHERE id = $1`,
            [session.metadata.lead_id]
          );
        }

        // Increment event capacity
        if (session.metadata?.event_id) {
          await query(
            `UPDATE events SET current_capacity = current_capacity + 1 WHERE id = $1`,
            [session.metadata.event_id]
          );
        }

        console.log('✅ Payment completed:', session.id);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        await query(
          `UPDATE payments SET status = 'failed', updated_at = NOW() WHERE stripe_payment_id = $1`,
          [session.id]
        );
        
        console.log('❌ Checkout expired:', session.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        await query(
          `UPDATE payments SET status = 'refunded', updated_at = NOW() 
           WHERE stripe_payment_id = $1`,
          [charge.payment_intent]
        );
        
        console.log('🔄 Payment refunded:', charge.id);
        break;
      }
    }

    res.json({ received: true });
  }
);

export { router as webhookRoutes };
