import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ========== PUBLIC ROUTES ==========

// Record a page view (public endpoint)
router.post('/track', async (req, res) => {
  try {
    const schema = z.object({
      eventSlug: z.string().max(100).optional(),
      path: z.string().max(500),
      referrer: z.string().max(1000).optional(),
      userAgent: z.string().max(1000).optional(),
      screenWidth: z.number().optional(),
      screenHeight: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // Get event_id if slug provided
    let eventId: number | null = null;
    if (data.eventSlug) {
      const eventResult = await query(
        'SELECT id FROM events WHERE slug = $1',
        [data.eventSlug]
      );
      if (eventResult.rows[0]) {
        eventId = eventResult.rows[0].id;
      }
    }

    // Determine device type
    let deviceType = 'desktop';
    if (data.screenWidth) {
      if (data.screenWidth < 768) {
        deviceType = 'mobile';
      } else if (data.screenWidth < 1024) {
        deviceType = 'tablet';
      }
    }

    // Insert page view
    await query(
      `INSERT INTO page_views (event_id, path, referrer, user_agent, device_type, screen_width, screen_height)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [eventId, data.path, data.referrer, data.userAgent, deviceType, data.screenWidth, data.screenHeight]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    // Don't throw errors for tracking - just log and return success
    console.error('Analytics tracking error:', error);
    res.status(200).json({ success: true });
  }
});

// ========== ADMIN ROUTES ==========

// Get analytics overview
router.get('/overview', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Total views
    const totalResult = await query('SELECT COUNT(*) as total FROM page_views');
    
    // Views today
    const todayResult = await query(
      `SELECT COUNT(*) as total FROM page_views 
       WHERE created_at >= CURRENT_DATE`
    );
    
    // Views last 7 days
    const weekResult = await query(
      `SELECT COUNT(*) as total FROM page_views 
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    );
    
    // Views last 30 days
    const monthResult = await query(
      `SELECT COUNT(*) as total FROM page_views 
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`
    );

    // Unique visitors (approximation by user_agent + date)
    const uniqueTodayResult = await query(
      `SELECT COUNT(DISTINCT CONCAT(user_agent, DATE(created_at))) as total 
       FROM page_views WHERE created_at >= CURRENT_DATE`
    );

    res.json({
      total: parseInt(totalResult.rows[0].total),
      today: parseInt(todayResult.rows[0].total),
      last7Days: parseInt(weekResult.rows[0].total),
      last30Days: parseInt(monthResult.rows[0].total),
      uniqueToday: parseInt(uniqueTodayResult.rows[0].total),
    });
  } catch (error) {
    throw error;
  }
});

// Get views by day (for chart)
router.get('/by-day', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as views
       FROM page_views
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.json(result.rows);
  } catch (error) {
    throw error;
  }
});

// Get views by event
router.get('/by-event', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT 
         e.slug,
         e.name,
         e.location,
         COUNT(pv.id) as total_views,
         COUNT(CASE WHEN pv.created_at >= CURRENT_DATE THEN 1 END) as today,
         COUNT(CASE WHEN pv.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_7_days
       FROM events e
       LEFT JOIN page_views pv ON e.id = pv.event_id
       WHERE e.is_active = true
       GROUP BY e.id, e.slug, e.name, e.location
       ORDER BY total_views DESC`
    );

    res.json(result.rows);
  } catch (error) {
    throw error;
  }
});

// Get views by device
router.get('/by-device', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT device_type, COUNT(*) as count
       FROM page_views
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY device_type
       ORDER BY count DESC`
    );

    res.json(result.rows);
  } catch (error) {
    throw error;
  }
});

// Get top referrers
router.get('/referrers', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT 
         COALESCE(
           CASE 
             WHEN referrer IS NULL OR referrer = '' THEN 'Direto'
             ELSE SUBSTRING(referrer FROM 'https?://([^/]+)')
           END,
           'Direto'
         ) as source,
         COUNT(*) as count
       FROM page_views
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY source
       ORDER BY count DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (error) {
    throw error;
  }
});

export default router;
