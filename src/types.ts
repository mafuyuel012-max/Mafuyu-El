export type Role = 'superadmin' | 'admin' | 'editor';
export type UserRole = Role;

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export type MediaCategory = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
export type MediaStatus = 'public' | 'private';

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  extension: string;
  size: number;
  path: string;
  url: string;
  category: MediaCategory;
  status: MediaStatus;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  category_name?: string;
  summary: string;
  content: string;
  cover_image: string;
  media_ids?: string[];
  attached_media?: MediaItem[];
  author_id: string;
  author_name: string;
  status: PostStatus;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  views: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export type PriorityType = 'normal' | 'penting';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  priority: PriorityType;
  publish_date?: string;
  publish_time?: string;
  attachment_url?: string;
  attachment_name?: string;
  published_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GraduationAnnouncement {
  id: string;
  title: string;
  academic_year: string;
  publish_date: string; // YYYY-MM-DD
  publish_time: string; // HH:mm (WIB)
  end_date?: string;
  content: string;
  document_url?: string;
  document_name?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GraduationStatus = 'LULUS' | 'TIDAK_LULUS' | 'BELUM_DITENTUKAN';

export interface GraduationStudent {
  id: string;
  announcement_id: string;
  nisn: string;
  name: string;
  student_class: string;
  academic_year: string;
  status: GraduationStatus;
  birth_date?: string; // YYYY-MM-DD for verification
  exam_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DownloadItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  media_id?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_ext: string;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  media_id?: string;
  media_url: string;
  type: 'photo' | 'video';
  video_url?: string; // for youtube/embed or direct video
  album: string;
  year: string;
  is_public: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  order: number;
  is_active: boolean;
  target: '_self' | '_blank';
}

export interface WebsiteSettings {
  school_name: string;
  school_short_name: string;
  tagline: string;
  description: string;
  npsn: string;
  akreditasi: string;
  logo: string;
  favicon: string;
  background_type: 'none' | 'image' | 'color' | 'gradient' | 'pattern';
  background_value: string;
  background_opacity: number;
  background_pattern?: string;
  background_repeat?: 'cover' | 'repeat' | 'contain';
  background_attachment?: 'scroll' | 'fixed';
  background_overlay_color?: string;
  background_blur?: number;
  primary_color: string;
  secondary_color: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  maps_url: string;
  copyright: string;
  // School profile content
  kepala_sekolah_nama: string;
  kepala_sekolah_nip?: string;
  kepala_sekolah_sambutan: string;
  kepala_sekolah_foto: string;
  sejarah: string;
  visi: string;
  misi: string[];
  tujuan: string[];
  struktur_organisasi: string;
  sarana_prasarana: string[];
  program_unggulan: string[];
  ekstrakurikuler: string[];
  // Banner / Hero
  hero_title: string;
  hero_subtitle: string;
  hero_button_text: string;
  hero_button_link: string;
  hero_image: string;
}

export interface DashboardStats {
  total_news: number;
  total_posts?: number;
  published_news: number;
  draft_news: number;
  total_categories?: number;
  total_media: number;
  total_images: number;
  total_videos: number;
  total_documents: number;
  active_announcements: number;
  total_announcements?: number;
  total_users?: number;
  total_students?: number;
  graduation_stats: {
    total_students: number;
    graduated: number;
    not_graduated: number;
    pending: number;
    is_active: boolean;
    academic_year: string;
  };
  recent_activities: ActivityLog[];
}
