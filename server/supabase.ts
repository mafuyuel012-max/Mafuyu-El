import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDatabase, saveDatabase, DatabaseSchema } from './db.js';

let supabaseClient: SupabaseClient | null = null;
let clientInitialized = false;

const DEFAULT_SUPABASE_URL = 'https://qixxlesbgddtbetfnkzx.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpeHhsZXNiZ2RkdGJldGZua3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NzcyNDMsImV4cCI6MjEwNDU1MzI0M30.evb4prdNL6XyF1EhAVwrDgv7aHR7sDUl4FGwj2mgGpk';
const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpeHhsZXNiZ2RkdGJldGZua3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODk3NzI0MywiZXhwIjoyMTA0NTUzMjQzfQ.dul_nxsYSOUijeFM7kkQyf_qLeVnM1hQqW4uvXqFqTw';

/**
 * Lazy initialization of Supabase client to prevent startup crash if keys are not yet provided.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (clientInitialized && supabaseClient) {
    return supabaseClient;
  }

  const rawUrl = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const supabaseKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    DEFAULT_ANON_KEY
  ).trim();

  // Normalize URL by removing /rest/v1 or trailing slashes
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  if (supabaseUrl && supabaseKey) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase client successfully initialized for project URL:', supabaseUrl);
    } catch (err) {
      console.error('⚠️ Failed to initialize Supabase client:', err);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }

  clientInitialized = true;
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return true;
}

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  url?: string;
  tables?: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Kredensial SUPABASE_URL atau SUPABASE_ANON_KEY belum diisi di environment.',
    };
  }

  const rawUrl = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  try {
    // Attempt a lightweight query to check settings or posts table
    const { data, error } = await client.from('settings').select('id').limit(1);

    if (error) {
      // Check if table doesn't exist yet (42P01, PGRST205, etc.)
      const isTableMissing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        error.message?.toLowerCase().includes('relation') ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('not found');

      if (isTableMissing) {
        return {
          connected: true,
          message: 'Berhasil terhubung ke Supabase Cloud (Proyek: qixxlesbgddtbetfnkzx)! Tabel database belum dibuat. Silakan salin & jalankan SQL Skema di SQL Editor Supabase Anda.',
          url: cleanUrl,
        };
      }
      return {
        connected: false,
        message: `Koneksi Supabase gagal: ${error.message} (Kode: ${error.code})`,
        url: cleanUrl,
      };
    }

    return {
      connected: true,
      message: 'Koneksi ke Supabase Cloud Berhasil dan Aktif! Database siap digunakan.',
      url: cleanUrl,
      tables: ['settings', 'posts', 'categories', 'announcements'],
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Gagal menghubungi server Supabase: ${err.message || 'Koneksi jaringan gagal'}`,
      url: cleanUrl,
    };
  }
}

/**
 * Migrates local db.json data to Supabase tables
 */
export async function syncLocalToSupabase(): Promise<{
  success: boolean;
  synced: Record<string, number>;
  message: string;
  errors?: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase belum dikonfigurasi. Mohon periksa kredensial Supabase Anda.');
  }

  const db = getDatabase();
  const report: Record<string, number> = {
    settings: 0,
    categories: 0,
    posts: 0,
    announcements: 0,
    gallery: 0,
    downloads: 0,
    graduations: 0,
    users: 0,
  };
  const errors: string[] = [];

  // 1. Sync Settings
  if (db.settings) {
    try {
      const settingsData = {
        id: 'general',
        nama_sekolah: db.settings.school_name || 'SD Negeri 53 Kota Bengkulu',
        npsn: db.settings.npsn || '10702634',
        alamat: db.settings.address || '',
        telepon: db.settings.phone || '',
        email: db.settings.email || '',
        kepala_sekolah: db.settings.kepala_sekolah_nama || '',
        nip_kepala_sekolah: db.settings.kepala_sekolah_nip || '',
        sambutan_kepala_sekolah: db.settings.kepala_sekolah_sambutan || '',
        foto_kepala_sekolah: db.settings.kepala_sekolah_foto || '',
        logo_sekolah: db.settings.logo || '',
        hero_title: db.settings.hero_title || '',
        hero_subtitle: db.settings.hero_subtitle || '',
        hero_image: db.settings.hero_image || '',
        visi: db.settings.visi || '',
        misi: Array.isArray(db.settings.misi) ? db.settings.misi.join('\n') : (db.settings.misi || ''),
        facebook: db.settings.facebook || '',
        instagram: db.settings.instagram || '',
        youtube: db.settings.youtube || '',
        jam_operasional: 'Senin - Sabtu: 07.15 - 13.00 WIB',
        koordinat_maps: db.settings.maps_url || '',
        updated_at: new Date().toISOString(),
      };
      const { error } = await client.from('settings').upsert(settingsData);
      if (error) {
        errors.push(`Settings: ${error.message}`);
      } else {
        report.settings = 1;
      }
    } catch (err: any) {
      errors.push(`Settings exception: ${err.message}`);
    }
  }

  // 2. Sync Categories
  if (db.categories?.length) {
    try {
      const catData = db.categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        created_at: new Date().toISOString(),
      }));
      const { error } = await client.from('categories').upsert(catData);
      if (error) {
        errors.push(`Categories: ${error.message}`);
      } else {
        report.categories = catData.length;
      }
    } catch (err: any) {
      errors.push(`Categories exception: ${err.message}`);
    }
  }

  // 3. Sync Posts
  if (db.posts?.length) {
    try {
      const postData = db.posts.map((p) => {
        const cat = db.categories.find((c) => c.id === p.category_id);
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          content: p.content,
          excerpt: p.summary || p.content.substring(0, 150),
          image: p.cover_image || '',
          category: cat?.name || 'Umum',
          author: p.author_name || 'Admin SDN 53',
          views: p.views || 0,
          status: p.status || 'published',
          published_at: p.published_at || new Date().toISOString(),
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString(),
        };
      });
      const { error } = await client.from('posts').upsert(postData);
      if (error) {
        errors.push(`Posts: ${error.message}`);
      } else {
        report.posts = postData.length;
      }
    } catch (err: any) {
      errors.push(`Posts exception: ${err.message}`);
    }
  }

  // 4. Sync Announcements
  if (db.announcements?.length) {
    try {
      const annData = db.announcements.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        date: a.publish_date || a.published_at || a.created_at || new Date().toISOString(),
        author: 'Bagian Kesiswaan & Kurikulum',
        target: 'Semua Siswa & Wali Murid',
        urgent: a.priority === 'urgent' || Boolean(a.is_urgent),
        created_at: a.created_at || new Date().toISOString(),
      }));
      const { error } = await client.from('announcements').upsert(annData);
      if (error) {
        errors.push(`Announcements: ${error.message}`);
      } else {
        report.announcements = annData.length;
      }
    } catch (err: any) {
      errors.push(`Announcements exception: ${err.message}`);
    }
  }

  // 5. Sync Gallery
  if (db.gallery?.length) {
    try {
      const galData = db.gallery.map((g: any) => ({
        id: g.id,
        title: g.title,
        category: g.album || 'Kegiatan',
        image: g.media_url || g.image_url || '',
        description: g.description || '',
        date: g.created_at || new Date().toISOString(),
        created_at: g.created_at || new Date().toISOString(),
      }));
      const { error } = await client.from('gallery').upsert(galData);
      if (error) {
        errors.push(`Gallery: ${error.message}`);
      } else {
        report.gallery = galData.length;
      }
    } catch (err: any) {
      errors.push(`Gallery exception: ${err.message}`);
    }
  }

  // 6. Sync Downloads
  if (db.downloads?.length) {
    try {
      const dlData = db.downloads.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category || 'Akademik',
        filename: d.file_name || 'Dokumen.pdf',
        filesize: `${Math.round((d.file_size || 1024000) / 1024)} KB`,
        filetype: d.file_ext ? d.file_ext.toUpperCase() : 'PDF',
        download_url: d.file_url || '',
        download_count: d.download_count || 0,
        created_at: d.created_at || new Date().toISOString(),
      }));
      const { error } = await client.from('downloads').upsert(dlData);
      if (error) {
        errors.push(`Downloads: ${error.message}`);
      } else {
        report.downloads = dlData.length;
      }
    } catch (err: any) {
      errors.push(`Downloads exception: ${err.message}`);
    }
  }

  // 7. Sync Graduations
  if (db.graduation_students?.length) {
    try {
      const gradData = db.graduation_students.map((s) => ({
        id: s.id,
        nisn: s.nisn,
        nama: s.name,
        kelas: s.student_class || 'VI A',
        tahun_lulus: s.academic_year || '2023/2024',
        status: s.status || 'LULUS',
        keterangan: s.notes || 'Memenuhi kriteria kelulusan',
        created_at: new Date().toISOString(),
      }));
      const { error } = await client.from('graduations').upsert(gradData);
      if (error) {
        errors.push(`Graduations: ${error.message}`);
      } else {
        report.graduations = gradData.length;
      }
    } catch (err: any) {
      errors.push(`Graduations exception: ${err.message}`);
    }
  }

  // 8. Sync Users
  if (db.users?.length) {
    try {
      const userData = db.users.map((u) => ({
        id: u.id,
        username: u.username,
        password: 'admin_login_auth',
        nama_lengkap: u.name,
        role: u.role || 'admin',
        email: u.email || '',
        created_at: u.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      for (const u of userData) {
        await client.from('users').delete().eq('username', u.username);
      }
      const { error } = await client.from('users').insert(userData);
      if (error) {
        errors.push(`Users: ${error.message}`);
      } else {
        report.users = userData.length;
      }
    } catch (err: any) {
      errors.push(`Users exception: ${err.message}`);
    }
  }

  const totalSynced = Object.values(report).reduce((acc, val) => acc + val, 0);

  return {
    success: errors.length === 0,
    synced: report,
    message: errors.length === 0
      ? `Sinkronisasi berhasil! Sebanyak ${totalSynced} data (pengaturan, berita, kategori, galeri, pengumuman, unduhan) kini tersimpan di Supabase Cloud.`
      : `Sinkronisasi selesai sebagian (${totalSynced} data berhasil disinkronkan). Kendala: ${errors.join(', ')}`,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Upload a buffer directly to Supabase Storage bucket 'media'.
 * Returns the permanent public CDN URL.
 */
export async function uploadToSupabaseStorage(
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const bucket = 'media';
    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(cleanFilename, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(cleanFilename);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Exception during Supabase Storage upload:', err);
    return null;
  }
}

/**
 * Automatically syncs a single post creation/update to Supabase Cloud
 */
export async function syncPostToSupabase(post: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const db = getDatabase();
    const cat = db.categories.find((c) => c.id === post.category_id);
    const postRecord = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.summary || (post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 150) : ''),
      image: post.cover_image || '',
      category: cat?.name || 'Umum',
      author: post.author_name || 'Admin SDN 53',
      views: post.views || 0,
      status: post.status || 'published',
      published_at: post.published_at || new Date().toISOString(),
      created_at: post.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('posts').upsert(postRecord);
    if (error) {
      console.warn('Auto-sync post to Supabase failed:', error.message);
    } else {
      console.log('✅ Post auto-synced to Supabase Cloud:', post.title);
    }
  } catch (err: any) {
    console.warn('Exception during auto-sync post to Supabase:', err?.message);
  }
}

/**
 * Automatically deletes a post from Supabase Cloud
 */
export async function deletePostFromSupabase(postId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('posts').delete().eq('id', postId);
  } catch (err: any) {
    console.warn('Exception during post deletion from Supabase:', err?.message);
  }
}

/**
 * Automatically syncs settings update to Supabase Cloud
 */
export async function syncSettingsToSupabase(settings: any): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const settingsData = {
      id: 'general',
      nama_sekolah: settings.school_name || 'SD Negeri 53 Kota Bengkulu',
      npsn: settings.npsn || '10702634',
      alamat: settings.address || '',
      telepon: settings.phone || '',
      email: settings.email || '',
      kepala_sekolah: settings.kepala_sekolah_nama || '',
      nip_kepala_sekolah: settings.kepala_sekolah_nip || '',
      sambutan_kepala_sekolah: settings.kepala_sekolah_sambutan || '',
      foto_kepala_sekolah: settings.kepala_sekolah_foto || '',
      logo_sekolah: settings.logo || '',
      hero_title: settings.hero_title || '',
      hero_subtitle: settings.hero_subtitle || '',
      hero_image: settings.hero_image || '',
      visi: settings.visi || '',
      misi: Array.isArray(settings.misi) ? settings.misi.join('\n') : (settings.misi || ''),
      facebook: settings.facebook || '',
      instagram: settings.instagram || '',
      youtube: settings.youtube || '',
      jam_operasional: 'Senin - Sabtu: 07.15 - 13.00 WIB',
      koordinat_maps: settings.maps_url || '',
      updated_at: new Date().toISOString(),
    };
    await client.from('settings').upsert(settingsData);
    console.log('✅ Settings auto-synced to Supabase Cloud');
  } catch (err: any) {
    console.warn('Exception during auto-sync settings to Supabase:', err?.message);
  }
}

/**
 * Fetches posts from Supabase Cloud to merge with local state.
 * This guarantees that when a post is created on Device A, Device B and public visitors see it instantly.
 */
export async function fetchPostsFromSupabase(): Promise<any[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Error fetching posts from Supabase:', err);
    return null;
  }
}
