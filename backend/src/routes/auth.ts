import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await query(
      'SELECT id, email, password_hash, name, role FROM admin_users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, role FROM admin_users WHERE id = $1',
      [req.user!.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    throw error;
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6)
    });

    const { currentPassword, newPassword } = schema.parse(req.body);

    const result = await query(
      'SELECT password_hash FROM admin_users WHERE id = $1',
      [req.user!.id]
    );

    const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query(
      'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user!.id]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    throw error;
  }
});

// Reset password (temporary - remove in production)
router.post('/reset-admin', async (req, res) => {
  try {
    const { email, newPassword, secretKey } = req.body;
    
    // Simple protection - use env var in production
    if (secretKey !== 'nexamind2026reset') {
      return res.status(403).json({ error: 'Chave inválida' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const result = await query(
      'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id',
      [newHash, email]
    );

    if (result.rows.length === 0) {
      // Create user if not exists
      await query(
        'INSERT INTO admin_users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        [email, newHash, 'Admin', 'super_admin']
      );
    }

    res.json({ message: 'Senha resetada com sucesso' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
});

export { router as authRoutes };
