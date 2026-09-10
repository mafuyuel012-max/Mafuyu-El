import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  Save,
  Loader2,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Post, Category, MediaItem } from '../../types';
import { useToast } from '../../components/common/Toast';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { MediaPickerModal } from '../../components/common/MediaPickerModal';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminBeritaPage: React.FC = () => {
  const toast = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Form mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [publishTime, setPublishTime] = useState('08:00');
  const [isSaving, setIsSaving] = useState(false);

  // Media Picker state for cover image and content insertion
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isContentMediaPickerOpen, setIsContentMediaPickerOpen] = useState(false);

  const handleInsertMediaToContent = (media: MediaItem) => {
    let snippet = '';
    if (media.category === 'image') {
      snippet = `<figure class="my-4 text-center"><img src="${media.url}" alt="${media.original_name || 'Gambar Berita'}" class="rounded-xl max-w-full h-auto mx-auto shadow-sm" /><figcaption class="text-xs text-slate-500 mt-1.5">${media.original_name || ''}</figcaption></figure><p><br/></p>`;
    } else if (media.category === 'video') {
      snippet = `<div class="my-4"><video controls class="rounded-xl w-full aspect-video shadow-sm bg-black" src="${media.url}"></video><p class="text-xs text-slate-500 text-center mt-1.5">${media.original_name || ''}</p></div><p><br/></p>`;
    } else if (media.category === 'audio') {
      snippet = `<div class="my-3 p-3 bg-slate-50 rounded-xl border border-slate-200"><p class="text-xs font-semibold text-slate-700 mb-1.5">🎵 ${media.original_name}</p><audio controls class="w-full" src="${media.url}"></audio></div><p><br/></p>`;
    } else {
      const fileSize = media.size ? `${(media.size / 1024).toFixed(0)} KB` : '';
      snippet = `<div class="my-3 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"><div class="flex items-center gap-3 min-w-0"><span class="text-2xl">📄</span><div class="truncate"><div class="font-semibold text-slate-800 text-sm truncate">${media.original_name}</div><div class="text-xs text-slate-500">${fileSize} • ${(media.extension || 'file').toUpperCase()}</div></div></div><a href="${media.url}" target="_blank" rel="noopener noreferrer" download class="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs">Unduh Berkas</a></div><p><br/></p>`;
    }
    setContent((prev) => (prev ? `${prev}${snippet}` : snippet));
    setIsContentMediaPickerOpen(false);
    toast.success('Media berhasil disisipkan ke dalam berita.');
  };

  // Delete confirmation modal state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      if (data.length > 0 && !categoryId) {
        setCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPosts({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        status: 'all',
        page: currentPage,
        limit: 10,
      });
      setPosts(res.data);
      setTotalPages(res.pagination.total_pages);
    } catch (err: any) {
      toast.error('Gagal memuat daftar berita: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchPosts();
    }
  }, [viewMode, selectedCategory, searchQuery, currentPage]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (viewMode === 'create') {
      setSlug(generateSlug(val));
    }
  };

  const handleCreateNew = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setCategoryId(categories[0]?.id || '');
    setSummary('');
    setContent('');
    setCoverImage('https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80');
    setIsFeatured(false);
    setStatus('published');
    setPublishDate(new Date().toISOString().split('T')[0]);
    setPublishTime('08:00');
    setViewMode('create');
  };

  const handleEdit = (p: Post) => {
    setEditingPost(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCategoryId(p.category_id);
    setSummary(p.summary || '');
    setContent(p.content);
    setCoverImage(p.cover_image);
    setIsFeatured(p.is_featured);
    setStatus(p.status as any);
    if (p.published_at) {
      const d = new Date(p.published_at);
      setPublishDate(d.toISOString().split('T')[0]);
      setPublishTime(d.toTimeString().substring(0, 5));
    }
    setViewMode('edit');
  };

  const handleDelete = (p: Post) => {
    setPostToDelete(p);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await api.deletePost(postToDelete.id);
      toast.success('Berita berhasil dihapus.');
      setPostToDelete(null);
      fetchPosts();
    } catch (err: any) {
      toast.error('Gagal menghapus berita: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.warning('Judul dan konten berita wajib diisi.');
      return;
    }

    setIsSaving(true);
    const postPayload = {
      title,
      slug: slug || generateSlug(title),
      category_id: categoryId,
      summary,
      content,
      cover_image: coverImage,
      is_featured: isFeatured,
      status,
      published_at: `${publishDate}T${publishTime}:00.000Z`,
    };

    try {
      if (viewMode === 'create') {
        await api.createPost(postPayload);
        toast.success('Berita baru berhasil diterbitkan!');
      } else if (editingPost) {
        await api.updatePost(editingPost.id, postPayload);
        toast.success('Perubahan berita berhasil disimpan!');
      }
      setViewMode('list');
    } catch (err: any) {
      toast.error('Gagal menyimpan berita: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Manajemen Berita & Artikel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Publikasikan kegiatan, informasi kedinasan, dan dokumentasi sekolah
              </p>
            </div>

            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Berita Baru</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul berita..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of Posts */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                <p className="text-xs">Memuat data berita...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Belum ada berita ditemukan</p>
                <p className="text-xs text-slate-400">Klik "Tulis Berita Baru" untuk membuat postingan pertama.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Cover & Judul</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Penulis</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Views</th>
                      <th className="p-4">Tanggal Rilis</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.cover_image}
                              alt={p.title}
                              className="w-14 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0 max-w-sm">
                              <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                              {p.is_featured && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800">
                                  Unggulan
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {p.category_name}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{p.author_name}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              p.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'scheduled'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-500">{p.views || 0}</td>
                        <td className="p-4 text-slate-500">
                          {new Date(p.published_at || p.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-600 transition-colors"
                              title="Edit Berita"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                              title="Hapus Berita"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* 2. CREATE & EDIT FORM VIEW */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {viewMode === 'create' ? 'Tulis Berita Baru' : 'Edit Berita & Konten'}
                </h2>
                <p className="text-xs text-slate-500">
                  Gunakan Universal Media Picker untuk memasukkan foto atau video ke dalam artikel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan & Publikasikan'}</span>
              </button>
            </div>
          </div>

          {/* Form Content 2-Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Main Content Inputs */}
            <div className="lg:col-span-8 space-y-4">
              {/* Title */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Judul Berita *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siswa SD Negeri 53 Raih Medali Emas FLS2N Tingkat Kota Bengkulu"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-slate-50 text-slate-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ringkasan Berita (Summary / Snippet)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ringkasan 1-2 kalimat pengantar berita untuk ditampilkan di kartu berita..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Konten Berita Lengkap *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsContentMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sisipkan Media ke Berita</span>
                  </button>
                </div>
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </div>

            {/* Right: Metadata & Settings Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              {/* Cover Image Selector */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Gambar Utama (Cover / Thumbnail)
                </label>

                <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative group">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Belum ada gambar
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCoverPickerOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>Pilih Cover dari Media Library</span>
                </button>
              </div>

              {/* Publishing Options */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                  Opsi Penerbitan
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
                  >
                    <option value="published">Langsung Publikasi (Published)</option>
                    <option value="draft">Simpan sebagai Draft</option>
                    <option value="scheduled">Jadwalkan (Scheduled)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tanggal Rilis
                    </label>
                    <input
                      type="date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Jam Rilis
                    </label>
                    <input
                      type="time"
                      value={publishTime}
                      onChange={(e) => setPublishTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Tandai sebagai Berita Unggulan (Featured)
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1 pl-6">
                    Berita unggulan akan disorot di bagian atas beranda utama sekolah.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Media Picker for Cover */}
          <MediaPickerModal
            isOpen={isCoverPickerOpen}
            onClose={() => setIsCoverPickerOpen(false)}
            onSelect={(media: MediaItem) => setCoverImage(media.url)}
            allowedCategory="image"
            title="Pilih Gambar Utama (Cover Berita)"
          />

          {/* Media Picker for Content Insertion */}
          <MediaPickerModal
            isOpen={isContentMediaPickerOpen}
            onClose={() => setIsContentMediaPickerOpen(false)}
            onSelect={handleInsertMediaToContent}
            allowedCategory="all"
            title="Sisipkan Foto, Video, atau Dokumen ke Berita"
          />
        </form>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(postToDelete)}
        onClose={() => setPostToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Berita"
        message={
          <span>
            Apakah Anda yakin ingin menghapus berita{' '}
            <strong className="text-slate-900 font-semibold">"{postToDelete?.title}"</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </span>
        }
      />
    </div>
  );
};
