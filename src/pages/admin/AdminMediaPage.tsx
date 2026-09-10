import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  UploadCloud,
  Search,
  Copy,
  Trash2,
  Check,
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Archive,
  Eye,
  Loader2,
  ExternalLink,
  X,
  FileBox,
} from 'lucide-react';
import { api } from '../../lib/api';
import { MediaItem, MediaCategory } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminMediaPage: React.FC = () => {
  const toast = useToast();

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete modal state
  const [mediaToDelete, setMediaToDelete] = useState<MediaItem | null>(null);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  // Preview modal state
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMedia({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 18,
      });
      setMediaList(res.data);
      setTotalPages(res.pagination.total_pages);
    } catch (err: any) {
      toast.error('Gagal memuat pustaka media: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedCategory, searchQuery, currentPage]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('status', 'public');

    try {
      const res = await api.uploadMedia(formData);
      toast.success(res.message);
      fetchMedia();
    } catch (err: any) {
      toast.error('Gagal mengunggah media: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    const fullUrl = window.location.origin + item.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    toast.success('URL media berhasil disalin ke papan klip!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (item: MediaItem) => {
    setMediaToDelete(item);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;
    setIsDeletingMedia(true);
    try {
      await api.deleteMedia(mediaToDelete.id);
      toast.success('Berkas berhasil dihapus.');
      setMediaToDelete(null);
      fetchMedia();
    } catch (err: any) {
      toast.error('Gagal menghapus media: ' + err.message);
    } finally {
      setIsDeletingMedia(false);
    }
  };

  const renderIcon = (cat: MediaCategory) => {
    switch (cat) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-sky-500" />;
      case 'video':
        return <Film className="w-5 h-5 text-rose-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-emerald-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileBox className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Universal Media Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat terpadu berkas gambar, video, audio, dan dokumen publikasi sekolah
          </p>
        </div>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleUploadFiles(e.dataTransfer.files);
        }}
        className={`bg-white border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
          dragActive
            ? 'border-sky-500 bg-sky-50/50'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {isUploading ? 'Sedang Memproses Upload...' : 'Tarik dan Letakkan Berkas ke Sini'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mendukung Foto (JPG, PNG, WEBP), Video (MP4), Audio (MP3), Dokumen (PDF, Word, Excel) & ZIP.
            </p>
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Pilih File dari Komputer</span>
              <input
                type="file"
                multiple
                disabled={isUploading}
                onChange={(e) => handleUploadFiles(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berkas berdasarkan nama file..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
          {['all', 'image', 'video', 'audio', 'document', 'archive'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full capitalize font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Berkas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs min-h-[400px]">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs">Memuat pustaka media...</p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <FileBox className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada berkas ditemukan</p>
            <p className="text-xs text-slate-400">Silakan unggah berkas menggunakan formulir di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-sky-400 hover:shadow-md transition-all duration-150 flex flex-col"
              >
                {/* Preview Box */}
                <div
                  onClick={() => setPreviewMedia(item)}
                  className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {item.category === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.original_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      {renderIcon(item.category)}
                      <span className="text-[10px] uppercase font-bold text-slate-500 mt-2">
                        {item.extension}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-900/70 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>

                {/* Info & Action Buttons */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1" title={item.original_name}>
                      {item.original_name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(item.size / 1024).toFixed(0)} KB â€¢ {item.extension.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleCopyUrl(item)}
                      className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Salin Tautan URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Berkas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="pt-6"
        />
      </div>

      {/* Media Detail Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {previewMedia.original_name}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 flex items-center justify-center max-h-[50vh] overflow-hidden p-2">
              {previewMedia.category === 'image' ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.original_name}
                  className="max-h-[48vh] object-contain"
                />
              ) : previewMedia.category === 'video' ? (
                <video src={previewMedia.url} controls className="max-h-[48vh] w-full" />
              ) : previewMedia.category === 'audio' ? (
                <audio src={previewMedia.url} controls className="w-full m-4" />
              ) : (
                <div className="p-12 text-center text-white space-y-2">
                  {renderIcon(previewMedia.category)}
                  <p className="text-xs font-bold mt-2">{previewMedia.original_name}</p>
                </div>
              )}
            </div>

            <div className="p-5 space-y-3 text-xs bg-slate-50">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <strong>Ukuran:</strong> {(previewMedia.size / 1024).toFixed(0)} KB
                </div>
                <div>
                  <strong>Kategori:</strong> {previewMedia.category}
                </div>
                <div>
                  <strong>Ekstensi:</strong> {previewMedia.extension}
                </div>
                <div>
                  <strong>Tanggal Upload:</strong> {new Date(previewMedia.created_at).toLocaleDateString('id-ID')}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.origin + previewMedia.url}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                />
                <button
                  onClick={() => handleCopyUrl(previewMedia)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs hover:bg-sky-700"
                >
                  Salin URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(mediaToDelete)}
        onClose={() => setMediaToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeletingMedia}
        title="Hapus Berkas Media"
        message={
          <span>
            Apakah Anda yakin ingin menghapus berkas media{' '}
            <strong className="text-slate-900 font-semibold">"{mediaToDelete?.original_name}"</strong>?
            Tautan yang merujuk berkas ini tidak akan dapat diakses kembali.
          </span>
        }
      />
    </div>
  );
};
