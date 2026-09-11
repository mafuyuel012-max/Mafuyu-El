import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { MediaCategory } from '../src/types.js';

let uploadPath = path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
} catch {
  // If filesystem is read-only (e.g. Vercel serverless), use /tmp/uploads
  uploadPath = path.join('/tmp', 'uploads');
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  } catch {
    // Ignore fallback errors
  }
}

export const UPLOAD_DIR = uploadPath;

// Map extensions to categories
export function getCategoryFromExtAndMime(ext: string, mime: string): MediaCategory {
  const cleanExt = ext.toLowerCase().replace('.', '');
  
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(cleanExt) || mime.startsWith('image/')) {
    return 'image';
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv'].includes(cleanExt) || mime.startsWith('video/')) {
    return 'video';
  }
  if (['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(cleanExt) || mime.startsWith('audio/')) {
    return 'audio';
  }
  if (
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'].includes(cleanExt) ||
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('sheet') ||
    mime.includes('presentation') ||
    mime.includes('text/')
  ) {
    return 'document';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(cleanExt) || mime.includes('zip') || mime.includes('compressed')) {
    return 'archive';
  }
  return 'other';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
  fileFilter: (req: Request, file, cb) => {
    // Disallow executable and dangerous files
    const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.phtml', '.jsp', '.asp', '.js', '.vbs', '.py'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (dangerousExts.includes(ext)) {
      return cb(new Error('Tipe file ini dilarang demi keamanan sistem.'));
    }

    cb(null, true);
  },
});
