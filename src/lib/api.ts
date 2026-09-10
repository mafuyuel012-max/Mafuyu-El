import {
  WebsiteSettings,
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
  ActivityLog,
  DashboardStats,
} from '../types';

const TOKEN_KEY = 'sdn53_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Terjadi kesalahan (Kode ${response.status})`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string; user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ user: User }>('/api/auth/me'),
  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Settings
  getSettings: () => request<WebsiteSettings>('/api/settings'),
  updateSettings: (settings: Partial<WebsiteSettings>) =>
    request<{ message: string; settings: WebsiteSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Posts / News
  getPosts: (params?: {
    category?: string;
    search?: string;
    status?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    isAdmin?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.featured) query.set('featured', 'true');
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.isAdmin) query.set('isAdmin', 'true');
    return request<{ data: Post[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>(
      `/api/posts?${query.toString()}`
    );
  },
  getPost: (slugOrId: string) => request<Post & { related_posts?: Post[] }>(`/api/posts/${slugOrId}`),
  createPost: (data: Partial<Post>) =>
    request<{ message: string; post: Post }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePost: (id: string, data: Partial<Post>) =>
    request<{ message: string; post: Post }>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePost: (id: string) => request<{ message: string }>(`/api/posts/${id}`, { method: 'DELETE' }),
  duplicatePost: (id: string) =>
    request<{ message: string; post: Post }>(`/api/posts/${id}/duplicate`, { method: 'POST' }),

  // Categories
  getCategories: () => request<Category[]>('/api/categories'),
  createCategory: (data: { name: string; slug?: string; description?: string }) =>
    request<{ message: string; category: Category }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: { name: string; slug?: string; description?: string }) =>
    request<{ message: string; category: Category }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) => request<{ message: string }>(`/api/categories/${id}`, { method: 'DELETE' }),

  // Media Library
  getMedia: (params?: { category?: string; search?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return request<{ data: MediaItem[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>(
      `/api/media?${query.toString()}`
    );
  },
  uploadMedia: (formData: FormData) =>
    request<{ message: string; media: MediaItem[] }>('/api/media/upload', {
      method: 'POST',
      body: formData,
    }),
  updateMedia: (id: string, data: { original_name?: string; status?: string }) =>
    request<{ message: string; media: MediaItem }>(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMedia: (id: string, force = false) =>
    request<{ message: string }>(`/api/media/${id}?force=${force}`, { method: 'DELETE' }),
  checkOrphans: () => request<{ total_orphans: number; orphans: MediaItem[] }>('/api/media/check/orphans'),

  // Announcements
  getAnnouncements: (isAdmin = false) =>
    request<Announcement[]>(`/api/announcements${isAdmin ? '?isAdmin=true' : ''}`),
  createAnnouncement: (data: Partial<Announcement>) =>
    request<{ message: string; announcement: Announcement }>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAnnouncement: (id: string, data: Partial<Announcement>) =>
    request<{ message: string; announcement: Announcement }>(`/api/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAnnouncement: (id: string) => request<{ message: string }>(`/api/announcements/${id}`, { method: 'DELETE' }),

  // Graduation
  getGraduationStatus: () =>
    request<{
      is_active: boolean;
      is_released: boolean;
      announcement?: GraduationAnnouncement;
      message?: string;
    }>('/api/graduation/status'),
  checkGraduationIndividual: (data: { nisn: string; birth_date?: string; exam_number?: string }) =>
    request<{
      found: boolean;
      student: {
        nisn: string;
        name: string;
        student_class: string;
        academic_year: string;
        status: string;
        notes?: string;
        exam_number?: string;
        school_name: string;
        kepala_sekolah: string;
        release_date: string;
      };
    }>('/api/graduation/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getGraduationAnnouncements: () => request<GraduationAnnouncement[]>('/api/graduation/announcements'),
  createGraduationAnnouncement: (data: Partial<GraduationAnnouncement>) =>
    request<{ message: string; announcement: GraduationAnnouncement }>('/api/graduation/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGraduationAnnouncement: (id: string, data: Partial<GraduationAnnouncement>) =>
    request<{ message: string; announcement: GraduationAnnouncement }>(`/api/graduation/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getGraduationStudents: (params?: { announcement_id?: string; search?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.announcement_id) query.set('announcement_id', params.announcement_id);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return request<{
      data: GraduationStudent[];
      pagination: { page: number; limit: number; total: number; total_pages: number };
      summary: { total_all: number; graduated: number; not_graduated: number; pending: number };
    }>(`/api/graduation/students?${query.toString()}`);
  },
  createGraduationStudent: (data: Partial<GraduationStudent>) =>
    request<{ message: string; student: GraduationStudent }>('/api/graduation/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGraduationStudent: (id: string, data: Partial<GraduationStudent>) =>
    request<{ message: string; student: GraduationStudent }>(`/api/graduation/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGraduationStudent: (id: string) =>
    request<{ message: string }>(`/api/graduation/students/${id}`, { method: 'DELETE' }),
  importGraduationFile: (formData: FormData) =>
    request<{
      total_rows: number;
      valid_count: number;
      error_count: number;
      preview_valid: any[];
      errors: any[];
      valid_rows: any[];
    }>('/api/graduation/import', {
      method: 'POST',
      body: formData,
    }),
  confirmGraduationImport: (students: any[], mode: 'append' | 'replace') =>
    request<{ message: string; added_count: number; updated_count: number }>('/api/graduation/import/confirm', {
      method: 'POST',
      body: JSON.stringify({ students, mode }),
    }),

  // Gallery
  getGallery: (isAdmin = false, filter?: { type?: string; album?: string; year?: string }) => {
    const query = new URLSearchParams();
    if (isAdmin) query.set('isAdmin', 'true');
    if (filter?.type) query.set('type', filter.type);
    if (filter?.album) query.set('album', filter.album);
    if (filter?.year) query.set('year', filter.year);
    return request<GalleryItem[]>(`/api/gallery?${query.toString()}`);
  },
  createGallery: (data: Partial<GalleryItem>) =>
    request<{ message: string; item: GalleryItem }>('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGallery: (id: string, data: Partial<GalleryItem>) =>
    request<{ message: string; item: GalleryItem }>(`/api/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGallery: (id: string) => request<{ message: string }>(`/api/gallery/${id}`, { method: 'DELETE' }),

  // Downloads
  getDownloads: (isAdmin = false, filter?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (isAdmin) query.set('isAdmin', 'true');
    if (filter?.category) query.set('category', filter.category);
    if (filter?.search) query.set('search', filter.search);
    return request<DownloadItem[]>(`/api/downloads?${query.toString()}`);
  },
  trackDownload: (id: string) => request<{ success: boolean; count: number }>(`/api/downloads/${id}/track`),
  createDownload: (data: Partial<DownloadItem>) =>
    request<{ message: string; item: DownloadItem }>('/api/downloads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDownload: (id: string, data: Partial<DownloadItem>) =>
    request<{ message: string; item: DownloadItem }>(`/api/downloads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDownload: (id: string) => request<{ message: string }>(`/api/downloads/${id}`, { method: 'DELETE' }),

  // Menus
  getMenus: (isAdmin = false) => request<MenuItem[]>(`/api/menus${isAdmin ? '?isAdmin=true' : ''}`),
  updateMenus: (menus: MenuItem[]) =>
    request<{ message: string; menus: MenuItem[] }>('/api/menus', {
      method: 'PUT',
      body: JSON.stringify({ menus }),
    }),

  // Users (Super Admin)
  getUsers: () => request<User[]>('/api/users'),
  createUser: (data: any) =>
    request<{ message: string; user: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: any) =>
    request<{ message: string; user: User }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  resetPassword: (id: string, new_password: string) =>
    request<{ message: string }>(`/api/users/${id}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ new_password }),
    }),
  deleteUser: (id: string) =>
    request<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  // Activity Logs
  getActivityLogs: (page = 1, limit = 30) =>
    request<{ data: ActivityLog[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>(
      `/api/activity-logs?page=${page}&limit=${limit}`
    ),

  // Global Search
  globalSearch: (q: string) =>
    request<{
      query: string;
      results: {
        posts: Post[];
        announcements: Announcement[];
        downloads: DownloadItem[];
        gallery: GalleryItem[];
      };
      total: number;
    }>(`/api/search?q=${encodeURIComponent(q)}`),

  // Dashboard Stats
  getStats: () => request<DashboardStats>('/api/stats'),
  getDashboardStats: () => request<DashboardStats>('/api/stats'),

  // Aliases for convenience
  getPostBySlug: (slug: string) => request<Post & { related_posts?: Post[] }>(`/api/posts/${slug}`),
  getPopularPosts: (limit = 5) =>
    request<{ data: Post[]; pagination: any }>(`/api/posts?limit=${limit}`).then((res) => res.data),
  deleteGalleryItem: (id: string) => request<{ message: string }>(`/api/gallery/${id}`, { method: 'DELETE' }),
  createGalleryItem: (data: Partial<GalleryItem>) =>
    request<{ message: string; item: GalleryItem }>('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recordDownloadHit: (id: string) => request<{ success: boolean; count: number }>(`/api/downloads/${id}/track`),
  checkGraduation: (data: { nisn: string; birth_date?: string; exam_number?: string }) =>
    request<{
      found: boolean;
      student: {
        nisn: string;
        name: string;
        student_class: string;
        academic_year: string;
        status: string;
        notes?: string;
        exam_number?: string;
        school_name: string;
        kepala_sekolah: string;
        release_date: string;
      };
    }>('/api/graduation/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
