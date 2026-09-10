import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';
import {
  getDatabase,
  saveDatabase,
  logActivity,
} from './db.js';
import {
  authenticate,
  requireRole,
  handleLogin,
  AuthRequest,
} from './auth.js';
import {
  upload,
  getCategoryFromExtAndMime,
  UPLOAD_DIR,
} from './upload.js';
import {
  Post,
  Category,
  MediaItem,
  Announcement,
  GraduationAnnouncement,
  GraduationStudent,
  DownloadItem,
  GalleryItem,
  MenuItem,
  User,
} from '../src/types.js';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  testSupabaseConnection,
  syncLocalToSupabase,
} from './supabase.js';

export const router = express.Router();

// Helper to create slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------
router.post('/auth/login', handleLogin);

router.get('/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

router.post('/auth/change-password', authenticate, (req: AuthRequest, res: Response) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 6) {
    res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter.' });
    return;
  }

  const db = getDatabase();
  const cred = db.user_credentials.find((c) => c.user_id === req.user!.id);
  if (!cred || !bcrypt.compareSync(current_password, cred.password_hash)) {
    res.status(400).json({ error: 'Kata sandi lama tidak sesuai.' });
    return;
  }

  cred.password_hash = bcrypt.hashSync(new_password, 10);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'GANTI_PASSWORD', 'Pengguna mengubah kata sandi', req.ip);
  res.json({ message: 'Kata sandi berhasil diperbarui.' });
});

// ----------------------------------------------------
// SUPABASE CLOUD DATABASE ROUTES
// ----------------------------------------------------
router.get('/supabase/status', async (req: Request, res: Response) => {
  const isConfigured = isSupabaseConfigured();
  if (!isConfigured) {
    res.json({
      isConfigured: false,
      connected: false,
      message: 'Supabase belum dikonfigurasi. Menggunakan penyimpanan lokal (db.json).',
      url: null,
    });
    return;
  }

  const check = await testSupabaseConnection();
  res.json({
    isConfigured: true,
    connected: check.connected,
    message: check.message,
    url: check.url,
  });
});

router.post('/supabase/test', authenticate, requireRole('superadmin', 'admin'), async (req: AuthRequest, res: Response) => {
  const result = await testSupabaseConnection();
  res.json(result);
});

router.post('/supabase/sync', authenticate, requireRole('superadmin', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await syncLocalToSupabase();
    logActivity(
      req.user!.id,
      req.user!.name,
      'SYNC_SUPABASE',
      'Migrasi dan sinkronisasi data lokal ke Supabase Cloud',
      req.ip
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal melakukan sinkronisasi data ke Supabase.' });
  }
});

router.get('/supabase/schema', (req: Request, res: Response) => {
  try {
    const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      res.json({ sql });
    } else {
      res.status(404).json({ error: 'Berkas skema supabase-schema.sql tidak ditemukan.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// SETTINGS ROUTES
// ----------------------------------------------------
router.get('/settings', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.settings);
});

router.put('/settings', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  db.settings = {
    ...db.settings,
    ...req.body,
  };
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'UPDATE_SETTINGS', 'Memperbarui pengaturan website/tampilan sekolah', req.ip);
  res.json({ message: 'Pengaturan website berhasil diperbarui.', settings: db.settings });
});

// ----------------------------------------------------
// POSTS (BERITA) ROUTES
// ----------------------------------------------------
router.get('/posts', (req: Request, res: Response) => {
  const db = getDatabase();
  const { category, search, status, featured, page = '1', limit = '10', isAdmin } = req.query;

  let posts = [...db.posts];

  // If not admin, only show published posts
  if (isAdmin !== 'true') {
    posts = posts.filter((p) => p.status === 'published');
  } else if (status) {
    posts = posts.filter((p) => p.status === status);
  }

  if (category) {
    posts = posts.filter((p) => p.category_id === category || slugify(p.category_name || '') === category);
  }

  if (featured === 'true') {
    posts = posts.filter((p) => p.is_featured);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }

  // Sort by published_at or created_at desc
  posts.sort((a, b) => {
    const dateA = new Date(a.published_at || a.created_at).getTime();
    const dateB = new Date(b.published_at || b.created_at).getTime();
    return dateB - dateA;
  });

  // Attach category names & media objects
  const enrichedPosts = posts.map((post) => {
    const cat = db.categories.find((c) => c.id === post.category_id);
    const attached = (post.media_ids || [])
      .map((mid) => db.media.find((m) => m.id === mid))
      .filter((m): m is MediaItem => Boolean(m));

    return {
      ...post,
      category_name: cat?.name || 'Umum',
      attached_media: attached,
    };
  });

  const p = parseInt(page as string, 10) || 1;
  const l = parseInt(limit as string, 10) || 10;
  const total = enrichedPosts.length;
  const paginated = enrichedPosts.slice((p - 1) * l, p * l);

  res.json({
    data: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      total_pages: Math.ceil(total / l),
    },
  });
});

router.get('/posts/:slug', (req: Request, res: Response) => {
  const db = getDatabase();
  const { slug } = req.params;
  const post = db.posts.find((p) => p.slug === slug || p.id === slug);

  if (!post) {
    res.status(404).json({ error: 'Berita tidak ditemukan.' });
    return;
  }

  // Increment view counter if public request
  post.views = (post.views || 0) + 1;
  saveDatabase(db);

  const cat = db.categories.find((c) => c.id === post.category_id);
  const attached = (post.media_ids || [])
    .map((mid) => db.media.find((m) => m.id === mid))
    .filter((m): m is MediaItem => Boolean(m));

  // Related posts from same category
  const related = db.posts
    .filter((p) => p.id !== post.id && p.status === 'published' && p.category_id === post.category_id)
    .slice(0, 3);

  res.json({
    ...post,
    category_name: cat?.name || 'Umum',
    attached_media: attached,
    related_posts: related,
  });
});

router.post('/posts', authenticate, requireRole('superadmin', 'admin', 'editor'), (req: AuthRequest, res: Response) => {
  const {
    title,
    category_id,
    summary,
    content,
    cover_image,
    media_ids,
    status = 'draft',
    is_featured = false,
    seo_title,
    seo_description,
  } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Judul dan konten berita wajib diisi.' });
    return;
  }

  const db = getDatabase();
  let baseSlug = slugify(title);
  let finalSlug = baseSlug;
  let counter = 1;
  while (db.posts.some((p) => p.slug === finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    slug: finalSlug,
    category_id: category_id || db.categories[0]?.id || 'cat-1',
    summary: summary || title.substring(0, 160),
    content,
    cover_image: cover_image || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80',
    media_ids: Array.isArray(media_ids) ? media_ids : [],
    author_id: req.user!.id,
    author_name: req.user!.name,
    status,
    is_featured: Boolean(is_featured),
    seo_title: seo_title || title,
    seo_description: seo_description || summary,
    views: 0,
    published_at: status === 'published' ? new Date().toISOString() : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.posts.unshift(newPost);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'BUAT_BERITA', `Membuat berita: "${title}" [${status}]`, req.ip);

  res.status(201).json({ message: 'Berita berhasil disimpan.', post: newPost });
});

router.put('/posts/:id', authenticate, requireRole('superadmin', 'admin', 'editor'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const postIndex = db.posts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    res.status(404).json({ error: 'Berita tidak ditemukan.' });
    return;
  }

  const existing = db.posts[postIndex];
  const {
    title,
    category_id,
    summary,
    content,
    cover_image,
    media_ids,
    status,
    is_featured,
    seo_title,
    seo_description,
    slug,
  } = req.body;

  let updatedSlug = existing.slug;
  if (slug && slug !== existing.slug) {
    let clean = slugify(slug);
    let counter = 1;
    while (db.posts.some((p) => p.id !== id && p.slug === clean)) {
      clean = `${slugify(slug)}-${counter}`;
      counter++;
    }
    updatedSlug = clean;
  }

  // Handle published_at when transitioning to published
  let publishedAt = existing.published_at;
  if (status === 'published' && (!existing.published_at || existing.status !== 'published')) {
    publishedAt = new Date().toISOString();
  }

  const updatedPost: Post = {
    ...existing,
    title: title ?? existing.title,
    slug: updatedSlug,
    category_id: category_id ?? existing.category_id,
    summary: summary ?? existing.summary,
    content: content ?? existing.content,
    cover_image: cover_image ?? existing.cover_image,
    media_ids: Array.isArray(media_ids) ? media_ids : existing.media_ids,
    status: status ?? existing.status,
    is_featured: is_featured !== undefined ? Boolean(is_featured) : existing.is_featured,
    seo_title: seo_title ?? existing.seo_title,
    seo_description: seo_description ?? existing.seo_description,
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };

  db.posts[postIndex] = updatedPost;
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'EDIT_BERITA', `Memperbarui berita: "${updatedPost.title}"`, req.ip);

  res.json({ message: 'Berita berhasil diperbarui.', post: updatedPost });
});

router.delete('/posts/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const post = db.posts.find((p) => p.id === id);

  if (!post) {
    res.status(404).json({ error: 'Berita tidak ditemukan.' });
    return;
  }

  db.posts = db.posts.filter((p) => p.id !== id);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'HAPUS_BERITA', `Menghapus berita: "${post.title}"`, req.ip);

  res.json({ message: 'Berita berhasil dihapus.' });
});

router.post('/posts/:id/duplicate', authenticate, requireRole('superadmin', 'admin', 'editor'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const post = db.posts.find((p) => p.id === id);

  if (!post) {
    res.status(404).json({ error: 'Berita tidak ditemukan.' });
    return;
  }

  const newTitle = `${post.title} (Salinan)`;
  let baseSlug = slugify(newTitle);
  let finalSlug = baseSlug;
  let counter = 1;
  while (db.posts.some((p) => p.slug === finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const duplicated: Post = {
    ...post,
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: newTitle,
    slug: finalSlug,
    status: 'draft',
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: undefined,
  };

  db.posts.unshift(duplicated);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'DUPLIKAT_BERITA', `Menduplikasi berita: "${post.title}"`, req.ip);

  res.status(201).json({ message: 'Berita berhasil diduplikasi sebagai draf.', post: duplicated });
});

// ----------------------------------------------------
// CATEGORIES ROUTES
// ----------------------------------------------------
router.get('/categories', (req: Request, res: Response) => {
  const db = getDatabase();
  const categoriesWithCount = db.categories.map((cat) => ({
    ...cat,
    count: db.posts.filter((p) => p.category_id === cat.id && p.status === 'published').length,
  }));
  res.json(categoriesWithCount);
});

router.post('/categories', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Nama kategori wajib diisi.' });
    return;
  }

  const db = getDatabase();
  const slug = slugify(name);
  if (db.categories.some((c) => c.slug === slug)) {
    res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada.' });
    return;
  }

  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    description,
  };

  db.categories.push(newCat);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'BUAT_KATEGORI', `Menambah kategori: "${name}"`, req.ip);
  res.status(201).json({ message: 'Kategori berhasil ditambahkan.', category: newCat });
});

router.put('/categories/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const db = getDatabase();
  const cat = db.categories.find((c) => c.id === id);

  if (!cat) {
    res.status(404).json({ error: 'Kategori tidak ditemukan.' });
    return;
  }

  cat.name = name || cat.name;
  cat.slug = slugify(name || cat.name);
  cat.description = description !== undefined ? description : cat.description;
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'EDIT_KATEGORI', `Memperbarui kategori: "${cat.name}"`, req.ip);
  res.json({ message: 'Kategori berhasil diperbarui.', category: cat });
});

router.delete('/categories/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const count = db.posts.filter((p) => p.category_id === id).length;
  if (count > 0) {
    res.status(400).json({
      error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${count} berita. Pindahkan berita ke kategori lain terlebih dahulu.`,
    });
    return;
  }

  db.categories = db.categories.filter((c) => c.id !== id);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'HAPUS_KATEGORI', `Menghapus kategori ID ${id}`, req.ip);
  res.json({ message: 'Kategori berhasil dihapus.' });
});

// ----------------------------------------------------
// UNIVERSAL MEDIA LIBRARY ROUTES
// ----------------------------------------------------
router.get('/media', (req: Request, res: Response) => {
  const db = getDatabase();
  const { category, search, status, page = '1', limit = '24' } = req.query;

  let items = [...db.media];

  if (category && category !== 'all' && category !== 'semua') {
    items = items.filter((m) => m.category === category);
  }

  if (status) {
    items = items.filter((m) => m.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(
      (m) =>
        m.filename.toLowerCase().includes(q) ||
        m.original_name.toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const p = parseInt(page as string, 10) || 1;
  const l = parseInt(limit as string, 10) || 24;
  const total = items.length;
  const paginated = items.slice((p - 1) * l, p * l);

  res.json({
    data: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      total_pages: Math.ceil(total / l),
    },
  });
});

router.post(
  '/media/upload',
  authenticate,
  requireRole('superadmin', 'admin', 'editor'),
  upload.array('files', 20),
  (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
      return;
    }

    const db = getDatabase();
    const createdMedia: MediaItem[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const category = getCategoryFromExtAndMime(ext, file.mimetype);

      const mediaItem: MediaItem = {
        id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        extension: ext,
        size: file.size,
        path: `uploads/${file.filename}`,
        url: `/uploads/${file.filename}`,
        category,
        status: (req.body.status as any) || 'public',
        uploaded_by: req.user!.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.media.unshift(mediaItem);
      createdMedia.push(mediaItem);
    }

    saveDatabase(db);
    logActivity(
      req.user!.id,
      req.user!.name,
      'UPLOAD_MEDIA',
      `Mengunggah ${files.length} berkas ke Universal Media Library`,
      req.ip
    );

    res.status(201).json({
      message: `Berhasil mengunggah ${files.length} file.`,
      media: createdMedia,
    });
  }
);

router.put('/media/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { original_name, status } = req.body;
  const db = getDatabase();
  const media = db.media.find((m) => m.id === id);

  if (!media) {
    res.status(404).json({ error: 'Media tidak ditemukan.' });
    return;
  }

  if (original_name) media.original_name = original_name;
  if (status) media.status = status;
  media.updated_at = new Date().toISOString();

  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'UPDATE_MEDIA', `Memperbarui metadata media: ${media.original_name}`, req.ip);
  res.json({ message: 'Media berhasil diperbarui.', media });
});

// Delete media with "Used-in" integrity verification
router.delete('/media/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { force } = req.query;
  const db = getDatabase();
  const media = db.media.find((m) => m.id === id);

  if (!media) {
    res.status(404).json({ error: 'Media tidak ditemukan.' });
    return;
  }

  // Check usage in posts, gallery, downloads, settings
  const usedInPosts = db.posts.filter((p) => p.cover_image === media.url || (p.media_ids && p.media_ids.includes(id)));
  const usedInGallery = db.gallery.filter((g) => g.media_id === id || g.media_url === media.url);
  const usedInDownloads = db.downloads.filter((d) => d.media_id === id || d.file_url === media.url);
  const usedInSettings = db.settings.logo === media.url || db.settings.hero_image === media.url || db.settings.kepala_sekolah_foto === media.url;

  const totalUsages = usedInPosts.length + usedInGallery.length + usedInDownloads.length + (usedInSettings ? 1 : 0);

  if (totalUsages > 0 && force !== 'true') {
    res.status(409).json({
      error: 'File ini sedang digunakan oleh beberapa konten.',
      warning: true,
      usage: {
        posts: usedInPosts.map((p) => ({ id: p.id, title: p.title })),
        gallery: usedInGallery.map((g) => ({ id: g.id, title: g.title })),
        downloads: usedInDownloads.map((d) => ({ id: d.id, title: d.title })),
        settings: usedInSettings,
      },
    });
    return;
  }

  // Delete actual file if in uploads folder
  const filePath = path.join(process.cwd(), media.path);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error removing file from disk:', err);
    }
  }

  db.media = db.media.filter((m) => m.id !== id);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'HAPUS_MEDIA', `Menghapus media: ${media.original_name}`, req.ip);

  res.json({ message: 'Media berhasil dihapus dari sistem.' });
});

// Orphan media check
router.get('/media/check/orphans', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const orphans = db.media.filter((m) => {
    const inPosts = db.posts.some((p) => p.cover_image === m.url || (p.media_ids && p.media_ids.includes(m.id)));
    const inGallery = db.gallery.some((g) => g.media_id === m.id || g.media_url === m.url);
    const inDownloads = db.downloads.some((d) => d.media_id === m.id || d.file_url === m.url);
    const inSettings = db.settings.logo === m.url || db.settings.hero_image === m.url || db.settings.kepala_sekolah_foto === m.url;
    return !inPosts && !inGallery && !inDownloads && !inSettings;
  });

  res.json({
    total_orphans: orphans.length,
    orphans,
  });
});

// ----------------------------------------------------
// ANNOUNCEMENTS (PENGUMUMAN) ROUTES
// ----------------------------------------------------
router.get('/announcements', (req: Request, res: Response) => {
  const db = getDatabase();
  const { status, isAdmin } = req.query;

  let list = [...db.announcements];
  if (isAdmin !== 'true') {
    list = list.filter((a) => a.status === 'published');
  } else if (status) {
    list = list.filter((a) => a.status === status);
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

router.post('/announcements', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { title, content, priority = 'normal', status = 'published', attachment_url, attachment_name } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Judul dan isi pengumuman wajib diisi.' });
    return;
  }

  const db = getDatabase();
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    status,
    priority,
    attachment_url,
    attachment_name,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.announcements.unshift(newAnn);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'BUAT_PENGUMUMAN', `Membuat pengumuman: "${title}" [${priority}]`, req.ip);

  res.status(201).json({ message: 'Pengumuman berhasil dibuat.', announcement: newAnn });
});

router.put('/announcements/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const item = db.announcements.find((a) => a.id === id);

  if (!item) {
    res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
    return;
  }

  Object.assign(item, req.body, { updated_at: new Date().toISOString() });
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'EDIT_PENGUMUMAN', `Memperbarui pengumuman: "${item.title}"`, req.ip);

  res.json({ message: 'Pengumuman berhasil diperbarui.', announcement: item });
});

router.delete('/announcements/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const item = db.announcements.find((a) => a.id === id);

  if (!item) {
    res.status(404).json({ error: 'Pengumuman tidak ditemukan.' });
    return;
  }

  db.announcements = db.announcements.filter((a) => a.id !== id);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'HAPUS_PENGUMUMAN', `Menghapus pengumuman: "${item.title}"`, req.ip);

  res.json({ message: 'Pengumuman berhasil dihapus.' });
});

// ----------------------------------------------------
// GRADUATION SYSTEM (KELULUSAN) ROUTES
// ----------------------------------------------------
// Public: Get current active graduation announcement & scheduled release check
router.get('/graduation/status', (req: Request, res: Response) => {
  const db = getDatabase();
  const activeAnn = db.graduation_announcements.find((g) => g.is_active);

  if (!activeAnn) {
    res.json({ is_active: false, message: 'Belum ada pengumuman kelulusan aktif saat ini.' });
    return;
  }

  // Calculate WIB publication schedule
  // Format: YYYY-MM-DD and HH:mm
  const publishDateTimeStr = `${activeAnn.publish_date}T${activeAnn.publish_time || '00:00'}:00+07:00`;
  const publishTimeEpoch = new Date(publishDateTimeStr).getTime();
  const nowEpoch = Date.now();
  const isReleased = nowEpoch >= publishTimeEpoch;

  res.json({
    is_active: true,
    is_released: isReleased,
    announcement: {
      id: activeAnn.id,
      title: activeAnn.title,
      academic_year: activeAnn.academic_year,
      publish_date: activeAnn.publish_date,
      publish_time: activeAnn.publish_time,
      content: activeAnn.content,
      document_url: isReleased ? activeAnn.document_url : undefined,
      document_name: isReleased ? activeAnn.document_name : undefined,
    },
  });
});

// Public: Check individual graduation result by NISN & optional verification
// PRIVACY CRITICAL: Never expose entire student list!
router.post('/graduation/check', (req: Request, res: Response) => {
  const { nisn, birth_date, exam_number } = req.body;

  if (!nisn) {
    res.status(400).json({ error: 'NISN wajib dimasukkan.' });
    return;
  }

  const cleanNisn = nisn.toString().trim();
  const db = getDatabase();

  const activeAnn = db.graduation_announcements.find((g) => g.is_active);
  if (!activeAnn) {
    res.status(400).json({ error: 'Tidak ada pengumuman kelulusan aktif saat ini.' });
    return;
  }

  // Check schedule WIB
  const publishDateTimeStr = `${activeAnn.publish_date}T${activeAnn.publish_time || '00:00'}:00+07:00`;
  const publishTimeEpoch = new Date(publishDateTimeStr).getTime();
  if (Date.now() < publishTimeEpoch) {
    res.status(403).json({
      error: `Pengumuman kelulusan belum dibuka. Jadwal rilis resmi: ${activeAnn.publish_date} pukul ${activeAnn.publish_time} WIB.`,
    });
    return;
  }

  // Look up student by NISN
  const student = db.graduation_students.find(
    (s) => s.announcement_id === activeAnn.id && s.nisn === cleanNisn
  );

  if (!student) {
    res.status(404).json({
      error: 'Data siswa dengan NISN tersebut tidak ditemukan. Mohon periksa kembali nomor NISN Anda atau hubungi pihak sekolah.',
    });
    return;
  }

  // Optional secondary verification check if provided
  if (birth_date && student.birth_date && student.birth_date !== birth_date) {
    res.status(400).json({ error: 'Verifikasi tanggal lahir tidak cocok.' });
    return;
  }

  // Return strictly individual student info
  res.json({
    found: true,
    student: {
      nisn: student.nisn,
      name: student.name,
      student_class: student.student_class,
      academic_year: student.academic_year,
      status: student.status,
      notes: student.notes,
      exam_number: student.exam_number,
      school_name: db.settings.school_name,
      kepala_sekolah: db.settings.kepala_sekolah_nama,
      release_date: activeAnn.publish_date,
    },
  });
});

// Admin: Graduation Announcements CRUD
router.get('/graduation/announcements', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  res.json(db.graduation_announcements);
});

router.post('/graduation/announcements', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { title, academic_year, publish_date, publish_time, content, document_url, document_name, is_active } = req.body;

  if (!title || !academic_year || !publish_date) {
    res.status(400).json({ error: 'Judul, tahun pelajaran, dan tanggal rilis wajib diisi.' });
    return;
  }

  const db = getDatabase();

  // If set to active, deactivate other announcements
  if (is_active) {
    db.graduation_announcements.forEach((a) => (a.is_active = false));
  }

  const newAnn: GraduationAnnouncement = {
    id: `grad-ann-${Date.now()}`,
    title,
    academic_year,
    publish_date,
    publish_time: publish_time || '10:00',
    content: content || '',
    document_url,
    document_name,
    is_active: Boolean(is_active),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.graduation_announcements.unshift(newAnn);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'BUAT_PENGUMUMAN_KELULUSAN', `Membuat pengumuman kelulusan: ${title}`, req.ip);

  res.status(201).json({ message: 'Pengumuman kelulusan berhasil disimpan.', announcement: newAnn });
});

router.put('/graduation/announcements/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const ann = db.graduation_announcements.find((a) => a.id === id);

  if (!ann) {
    res.status(404).json({ error: 'Pengumuman kelulusan tidak ditemukan.' });
    return;
  }

  if (req.body.is_active) {
    db.graduation_announcements.forEach((a) => (a.is_active = false));
  }

  Object.assign(ann, req.body, { updated_at: new Date().toISOString() });
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'EDIT_PENGUMUMAN_KELULUSAN', `Memperbarui pengumuman kelulusan: ${ann.title}`, req.ip);

  res.json({ message: 'Pengumuman kelulusan berhasil diperbarui.', announcement: ann });
});

// Admin: Graduation Students CRUD
router.get('/graduation/students', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const { announcement_id, search, status, page = '1', limit = '50' } = req.query;

  let list = [...db.graduation_students];

  if (announcement_id) {
    list = list.filter((s) => s.announcement_id === announcement_id);
  }

  if (status) {
    list = list.filter((s) => s.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.student_class.toLowerCase().includes(q)
    );
  }

  const p = parseInt(page as string, 10) || 1;
  const l = parseInt(limit as string, 10) || 50;
  const total = list.length;
  const paginated = list.slice((p - 1) * l, p * l);

  res.json({
    data: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      total_pages: Math.ceil(total / l),
    },
    summary: {
      total_all: db.graduation_students.length,
      graduated: db.graduation_students.filter((s) => s.status === 'LULUS').length,
      not_graduated: db.graduation_students.filter((s) => s.status === 'TIDAK_LULUS').length,
      pending: db.graduation_students.filter((s) => s.status === 'BELUM_DITENTUKAN').length,
    },
  });
});

router.post('/graduation/students', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { announcement_id, nisn, name, student_class, academic_year, status, birth_date, exam_number, notes } = req.body;

  if (!nisn || !name || !student_class) {
    res.status(400).json({ error: 'NISN, Nama Siswa, dan Kelas wajib diisi.' });
    return;
  }

  const db = getDatabase();
  if (db.graduation_students.some((s) => s.nisn === nisn && s.announcement_id === announcement_id)) {
    res.status(400).json({ error: 'Siswa dengan NISN ini sudah terdaftar pada pengumuman yang dipilih.' });
    return;
  }

  const newStu: GraduationStudent = {
    id: `grad-stu-${Date.now()}`,
    announcement_id: announcement_id || db.graduation_announcements[0]?.id || 'grad-ann-1',
    nisn: nisn.trim(),
    name: name.trim().toUpperCase(),
    student_class: student_class.trim(),
    academic_year: academic_year || '2025/2026',
    status: status || 'LULUS',
    birth_date,
    exam_number,
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.graduation_students.push(newStu);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'TAMBAH_SISWA_KELULUSAN', `Menambah data siswa: ${name} (${nisn})`, req.ip);

  res.status(201).json({ message: 'Data peserta didik berhasil disimpan.', student: newStu });
});

router.put('/graduation/students/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const stu = db.graduation_students.find((s) => s.id === id);

  if (!stu) {
    res.status(404).json({ error: 'Data siswa tidak ditemukan.' });
    return;
  }

  Object.assign(stu, req.body, { updated_at: new Date().toISOString() });
  saveDatabase(db);
  res.json({ message: 'Data siswa berhasil diperbarui.', student: stu });
});

router.delete('/graduation/students/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  db.graduation_students = db.graduation_students.filter((s) => s.id !== id);
  saveDatabase(db);
  res.json({ message: 'Data siswa berhasil dihapus.' });
});

// Admin: Import Excel/CSV Validation & Preview
router.post(
  '/graduation/import',
  authenticate,
  requireRole('superadmin', 'admin'),
  upload.single('file'),
  (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'File Excel/CSV belum dipilih.' });
      return;
    }

    const { announcement_id, academic_year } = req.body;
    const db = getDatabase();
    const filePath = req.file.path;

    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = xlsx.utils.sheet_to_json(sheet);

      if (!rows || rows.length === 0) {
        res.status(400).json({ error: 'File Excel/CSV kosong atau format tidak sesuai.' });
        return;
      }

      const validRows: any[] = [];
      const errorRows: any[] = [];
      const seenNisns = new Set<string>();

      rows.forEach((row, idx) => {
        const rowNum = idx + 2; // header is row 1
        const nisn = (row['NISN'] || row['nisn'] || row['Nisn'] || '').toString().trim();
        const name = (row['Nama'] || row['NAMA'] || row['nama'] || row['Nama Siswa'] || '').toString().trim();
        const studentClass = (row['Kelas'] || row['KELAS'] || row['kelas'] || 'VI').toString().trim();
        let status = (row['Status'] || row['STATUS'] || row['status'] || 'LULUS').toString().trim().toUpperCase();

        if (status !== 'LULUS' && status !== 'TIDAK_LULUS' && status !== 'BELUM_DITENTUKAN') {
          if (status.includes('TIDAK')) status = 'TIDAK_LULUS';
          else if (status.includes('BELUM')) status = 'BELUM_DITENTUKAN';
          else status = 'LULUS';
        }

        const birthDate = row['Tanggal Lahir'] || row['TANGGAL LAHIR'] || row['birth_date'] || '';
        const examNumber = row['No Ujian'] || row['NO UJIAN'] || row['exam_number'] || '';
        const notes = row['Keterangan'] || row['Catatan'] || '';

        if (!nisn) {
          errorRows.push({ row: rowNum, data: row, reason: 'NISN tidak boleh kosong' });
          return;
        }

        if (!name) {
          errorRows.push({ row: rowNum, data: row, reason: 'Nama siswa tidak boleh kosong' });
          return;
        }

        if (seenNisns.has(nisn)) {
          errorRows.push({ row: rowNum, data: row, reason: `Duplikasi NISN dalam file: ${nisn}` });
          return;
        }

        seenNisns.add(nisn);

        validRows.push({
          nisn,
          name: name.toUpperCase(),
          student_class: studentClass,
          academic_year: academic_year || '2025/2026',
          status,
          birth_date: birthDate,
          exam_number: examNumber,
          notes,
          announcement_id: announcement_id || db.graduation_announcements[0]?.id || 'grad-ann-1',
        });
      });

      // Cleanup uploaded temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        total_rows: rows.length,
        valid_count: validRows.length,
        error_count: errorRows.length,
        preview_valid: validRows.slice(0, 10),
        errors: errorRows,
        valid_rows: validRows, // Sent back so admin can confirm before commit
      });
    } catch (err: any) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: `Gagal membaca file Excel/CSV: ${err.message}` });
    }
  }
);

// Commit validated import rows
router.post('/graduation/import/confirm', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { students, mode = 'append' } = req.body; // mode: 'append' or 'replace'

  if (!Array.isArray(students) || students.length === 0) {
    res.status(400).json({ error: 'Tidak ada data siswa untuk diimpor.' });
    return;
  }

  const db = getDatabase();

  if (mode === 'replace') {
    const annId = students[0].announcement_id;
    db.graduation_students = db.graduation_students.filter((s) => s.announcement_id !== annId);
  }

  let addedCount = 0;
  let updatedCount = 0;

  for (const s of students) {
    const existingIndex = db.graduation_students.findIndex(
      (item) => item.nisn === s.nisn && item.announcement_id === s.announcement_id
    );

    if (existingIndex >= 0) {
      db.graduation_students[existingIndex] = {
        ...db.graduation_students[existingIndex],
        ...s,
        updated_at: new Date().toISOString(),
      };
      updatedCount++;
    } else {
      db.graduation_students.push({
        id: `grad-stu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        announcement_id: s.announcement_id,
        nisn: s.nisn,
        name: s.name,
        student_class: s.student_class,
        academic_year: s.academic_year,
        status: s.status,
        birth_date: s.birth_date,
        exam_number: s.exam_number,
        notes: s.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      addedCount++;
    }
  }

  saveDatabase(db);
  logActivity(
    req.user!.id,
    req.user!.name,
    'IMPORT_KELULUSAN',
    `Berhasil mengimpor data kelulusan: ${addedCount} baru, ${updatedCount} diperbarui`,
    req.ip
  );

  res.json({
    message: `Impor data kelulusan berhasil! ${addedCount} data ditambahkan, ${updatedCount} data diperbarui.`,
    added_count: addedCount,
    updated_count: updatedCount,
  });
});

// Download sample Excel template
router.get('/graduation/template', (req: Request, res: Response) => {
  const sampleData = [
    {
      NISN: '0123456789',
      Nama: 'ADITYA PRATAMA',
      Kelas: 'VI-A',
      'Tahun Pelajaran': '2025/2026',
      Status: 'LULUS',
      'Tanggal Lahir': '2014-03-15',
      'No Ujian': '053-01-001-2026',
      Keterangan: 'Lulus dengan predikat Baik',
    },
    {
      NISN: '0123456790',
      Nama: 'AULIA RAHMADANI',
      Kelas: 'VI-A',
      'Tahun Pelajaran': '2025/2026',
      Status: 'LULUS',
      'Tanggal Lahir': '2014-05-20',
      'No Ujian': '053-01-002-2026',
      Keterangan: 'Peringkat 1 Umum',
    },
  ];

  const ws = xlsx.utils.json_to_sheet(sampleData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Template_Kelulusan');

  const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="Template_Data_Kelulusan_SDN53.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

// ----------------------------------------------------
// GALLERY (GALERI) ROUTES
// ----------------------------------------------------
router.get('/gallery', (req: Request, res: Response) => {
  const db = getDatabase();
  const { type, album, year, isAdmin } = req.query;

  let list = [...db.gallery];
  if (isAdmin !== 'true') {
    list = list.filter((g) => g.is_public);
  }

  if (type) list = list.filter((g) => g.type === type);
  if (album) list = list.filter((g) => g.album === album);
  if (year) list = list.filter((g) => g.year === year);

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

router.post('/gallery', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { title, description, media_id, media_url, type = 'photo', video_url, album = 'Umum', year = '2026', is_public = true } = req.body;

  if (!title || (!media_url && !video_url)) {
    res.status(400).json({ error: 'Judul dan media wajib diisi.' });
    return;
  }

  const db = getDatabase();
  const newItem: GalleryItem = {
    id: `gal-${Date.now()}`,
    title,
    description,
    media_id,
    media_url: media_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
    type,
    video_url,
    album,
    year,
    is_public: Boolean(is_public),
    created_at: new Date().toISOString(),
  };

  db.gallery.unshift(newItem);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'TAMBAH_GALERI', `Menambah item galeri: "${title}"`, req.ip);

  res.status(201).json({ message: 'Galeri berhasil ditambahkan.', item: newItem });
});

router.put('/gallery/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const item = db.gallery.find((g) => g.id === id);

  if (!item) {
    res.status(404).json({ error: 'Item galeri tidak ditemukan.' });
    return;
  }

  Object.assign(item, req.body);
  saveDatabase(db);
  res.json({ message: 'Item galeri berhasil diperbarui.', item });
});

router.delete('/gallery/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  db.gallery = db.gallery.filter((g) => g.id !== id);
  saveDatabase(db);
  res.json({ message: 'Item galeri berhasil dihapus.' });
});

// ----------------------------------------------------
// DOWNLOAD CENTER ROUTES
// ----------------------------------------------------
router.get('/downloads', (req: Request, res: Response) => {
  const db = getDatabase();
  const { category, search, isAdmin } = req.query;

  let list = [...db.downloads];
  if (isAdmin !== 'true') {
    list = list.filter((d) => d.is_active);
  }

  if (category) list = list.filter((d) => d.category === category);
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter((d) => d.title.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q)));
  }

  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

router.get('/downloads/:id/track', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const item = db.downloads.find((d) => d.id === id);

  if (!item) {
    res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
    return;
  }

  item.download_count = (item.download_count || 0) + 1;
  saveDatabase(db);
  res.json({ success: true, count: item.download_count });
});

router.post('/downloads', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { title, description, category = 'Dokumen', media_id, file_url, file_name, file_size, file_ext, is_active = true } = req.body;

  if (!title || !file_url) {
    res.status(400).json({ error: 'Judul dan tautan file dokumen wajib diisi.' });
    return;
  }

  const db = getDatabase();
  const newItem: DownloadItem = {
    id: `dl-${Date.now()}`,
    title,
    description,
    category,
    media_id,
    file_url,
    file_name: file_name || 'Dokumen.pdf',
    file_size: file_size || 1024 * 1024,
    file_ext: file_ext || 'pdf',
    download_count: 0,
    is_active: Boolean(is_active),
    created_at: new Date().toISOString(),
  };

  db.downloads.unshift(newItem);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'TAMBAH_DOWNLOAD', `Menambah dokumen unduhan: "${title}"`, req.ip);

  res.status(201).json({ message: 'Dokumen berhasil ditambahkan ke Download Center.', item: newItem });
});

router.put('/downloads/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const item = db.downloads.find((d) => d.id === id);

  if (!item) {
    res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
    return;
  }

  Object.assign(item, req.body);
  saveDatabase(db);
  res.json({ message: 'Dokumen berhasil diperbarui.', item });
});

router.delete('/downloads/:id', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  db.downloads = db.downloads.filter((d) => d.id !== id);
  saveDatabase(db);
  res.json({ message: 'Dokumen berhasil dihapus.' });
});

// ----------------------------------------------------
// MENUS (NAVIGASI) ROUTES
// ----------------------------------------------------
router.get('/menus', (req: Request, res: Response) => {
  const db = getDatabase();
  const { isAdmin } = req.query;

  let menus = [...db.menus];
  if (isAdmin !== 'true') {
    menus = menus.filter((m) => m.is_active);
  }
  menus.sort((a, b) => a.order - b.order);
  res.json(menus);
});

router.put('/menus', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const { menus } = req.body;
  if (!Array.isArray(menus)) {
    res.status(400).json({ error: 'Data menu tidak valid.' });
    return;
  }

  const db = getDatabase();
  db.menus = menus;
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'UPDATE_MENU', 'Memperbarui susunan dan status menu navigasi', req.ip);
  res.json({ message: 'Susunan menu berhasil diperbarui.', menus: db.menus });
});

// ----------------------------------------------------
// USER MANAGEMENT (PENGGUNA) ROUTES (SUPER ADMIN)
// ----------------------------------------------------
router.get('/users', authenticate, requireRole('superadmin'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  res.json(db.users);
});

router.post('/users', authenticate, requireRole('superadmin'), (req: AuthRequest, res: Response) => {
  const { username, name, email, role = 'editor', password } = req.body;

  if (!username || !name || !email || !password) {
    res.status(400).json({ error: 'Nama pengguna, nama lengkap, email, dan kata sandi wajib diisi.' });
    return;
  }

  const db = getDatabase();
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    res.status(400).json({ error: 'Nama pengguna sudah digunakan.' });
    return;
  }

  const newUserId = `user-${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    username: username.toLowerCase().trim(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.user_credentials.push({
    user_id: newUserId,
    password_hash: bcrypt.hashSync(password, 10),
  });

  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'TAMBAH_PENGGUNA', `Menambah pengguna baru: ${username} (${role})`, req.ip);

  res.status(201).json({ message: 'Pengguna berhasil dibuat.', user: newUser });
});

router.put('/users/:id', authenticate, requireRole('superadmin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const user = db.users.find((u) => u.id === id);

  if (!user) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  const { name, email, role, is_active } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (is_active !== undefined) user.is_active = Boolean(is_active);

  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'EDIT_PENGGUNA', `Memperbarui data pengguna: ${user.username}`, req.ip);

  res.json({ message: 'Data pengguna berhasil diperbarui.', user });
});

router.put('/users/:id/reset-password', authenticate, requireRole('superadmin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter.' });
    return;
  }

  const db = getDatabase();
  const cred = db.user_credentials.find((c) => c.user_id === id);
  if (!cred) {
    res.status(404).json({ error: 'Kredensial pengguna tidak ditemukan.' });
    return;
  }

  cred.password_hash = bcrypt.hashSync(new_password, 10);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'RESET_PASSWORD', `Reset kata sandi pengguna ID: ${id}`, req.ip);

  res.json({ message: 'Kata sandi pengguna berhasil direset.' });
});

router.delete('/users/:id', authenticate, requireRole('superadmin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id === id) {
    res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri.' });
    return;
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  db.users = db.users.filter((u) => u.id !== id);
  db.user_credentials = db.user_credentials.filter((c) => c.user_id !== id);
  saveDatabase(db);
  logActivity(req.user!.id, req.user!.name, 'HAPUS_PENGGUNA', `Menghapus akun pengguna: ${user.username}`, req.ip);

  res.json({ message: 'Pengguna berhasil dihapus.' });
});

// ----------------------------------------------------
// ACTIVITY LOGS
// ----------------------------------------------------
router.get('/activity-logs', authenticate, requireRole('superadmin', 'admin'), (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const { page = '1', limit = '30' } = req.query;

  const p = parseInt(page as string, 10) || 1;
  const l = parseInt(limit as string, 10) || 30;
  const total = db.activity_logs.length;
  const paginated = db.activity_logs.slice((p - 1) * l, p * l);

  res.json({
    data: paginated,
    pagination: {
      page: p,
      limit: l,
      total,
      total_pages: Math.ceil(total / l),
    },
  });
});

// ----------------------------------------------------
// GLOBAL SEARCH
// ----------------------------------------------------
router.get('/search', (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || (q as string).trim() === '') {
    res.json({ posts: [], announcements: [], downloads: [], gallery: [] });
    return;
  }

  const query = (q as string).toLowerCase().trim();
  const db = getDatabase();

  const posts = db.posts
    .filter(
      (p) =>
        p.status === 'published' &&
        (p.title.toLowerCase().includes(query) ||
          p.summary.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query))
    )
    .slice(0, 8);

  const announcements = db.announcements
    .filter(
      (a) =>
        a.status === 'published' &&
        (a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query))
    )
    .slice(0, 5);

  const downloads = db.downloads
    .filter(
      (d) =>
        d.is_active &&
        (d.title.toLowerCase().includes(query) ||
          (d.description && d.description.toLowerCase().includes(query)))
    )
    .slice(0, 5);

  const gallery = db.gallery
    .filter(
      (g) =>
        g.is_public &&
        (g.title.toLowerCase().includes(query) ||
          (g.description && g.description.toLowerCase().includes(query)) ||
          g.album.toLowerCase().includes(query))
    )
    .slice(0, 6);

  res.json({
    query,
    results: {
      posts,
      announcements,
      downloads,
      gallery,
    },
    total: posts.length + announcements.length + downloads.length + gallery.length,
  });
});

// ----------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const activeGradAnn = db.graduation_announcements.find((g) => g.is_active);

  const stats = {
    total_news: db.posts.length,
    total_posts: db.posts.length,
    published_news: db.posts.filter((p) => p.status === 'published').length,
    draft_news: db.posts.filter((p) => p.status === 'draft').length,
    total_categories: db.categories.length,
    total_media: db.media.length,
    total_images: db.media.filter((m) => m.category === 'image').length,
    total_videos: db.media.filter((m) => m.category === 'video').length,
    total_documents: db.media.filter((m) => m.category === 'document').length,
    active_announcements: db.announcements.filter((a) => a.status === 'published').length,
    total_announcements: db.announcements.length,
    total_students: db.graduation_students.length,
    total_users: db.users.length,
    graduation_stats: {
      total_students: db.graduation_students.length,
      graduated: db.graduation_students.filter((s) => s.status === 'LULUS').length,
      not_graduated: db.graduation_students.filter((s) => s.status === 'TIDAK_LULUS').length,
      pending: db.graduation_students.filter((s) => s.status === 'BELUM_DITENTUKAN').length,
      is_active: Boolean(activeGradAnn),
      academic_year: activeGradAnn?.academic_year || '2025/2026',
    },
    recent_activities: db.activity_logs.slice(0, 10),
  };

  res.json(stats);
});
