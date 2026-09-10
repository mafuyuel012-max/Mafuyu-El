import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase, logActivity } from './db.js';
import { User, Role } from '../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sdn53_bengkulu_super_secret_jwt_key_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sesi login tidak ditemukan atau kedaluwarsa.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = getDatabase();
    const user = db.users.find((u) => u.id === decoded.id);

    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Akun tidak aktif atau tidak ditemukan.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token autentikasi tidak valid.' });
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Autentikasi diperlukan.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Akses ditolak. Anda memerlukan hak akses: ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Nama pengguna dan kata sandi wajib diisi.' });
    return;
  }

  const db = getDatabase();
  const normalizedUser = username.trim().toLowerCase();
  const user = db.users.find((u) => {
    const uname = u.username.toLowerCase();
    const uemail = u.email.toLowerCase();
    return (
      uname === normalizedUser ||
      uemail === normalizedUser ||
      (normalizedUser === 'superadmin' && uname === 'admin') ||
      (normalizedUser === 'editor' && uname === 'guru_editor')
    );
  });

  if (!user) {
    res.status(401).json({ error: 'Nama pengguna atau kata sandi salah.' });
    return;
  }

  if (!user.is_active) {
    res.status(403).json({ error: 'Akun Anda dinonaktifkan oleh administrator.' });
    return;
  }

  const cred = db.user_credentials.find((c) => c.user_id === user.id);
  if (!cred) {
    res.status(401).json({ error: 'Kredensial pengguna tidak valid.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, cred.password_hash);
  if (!isMatch) {
    res.status(401).json({ error: 'Nama pengguna atau kata sandi salah.' });
    return;
  }

  // Update last login
  user.last_login = new Date().toISOString();
  saveDatabase(db);

  const token = generateToken(user);
  logActivity(user.id, user.name, 'LOGIN', `Login sukses sebagai ${user.role}`, req.ip || '127.0.0.1');

  res.json({
    message: 'Login berhasil.',
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
}
