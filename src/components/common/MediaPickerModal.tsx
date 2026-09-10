import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  Archive,
  UploadCloud,
  Search,
  Check,
  Loader2,
  FileBox,
} from 'lucide-react';
import { Modal } from './Modal';
import { MediaItem, MediaCategory } from '../../types';
import { api } from '../../lib/api';
import { useToast } from './Toast';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  onSelectMultiple?: (media: MediaItem[]) => void;
  allowedCategory?: MediaCategory | 'all';
  multiple?: boolean;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  allowedCategory = 'all',
  multiple = false,
  title = 'Pilih Media',
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(allowedCategory === 'all' ? 'all' : allowedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const toast = useToast();

  const fetchMedia = async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const res = await api.getMedia({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      setMediaList(res.data);
      setTotalPages(res.pagination.total_pages);
    } catch (err: any) {
      toast.error('Gagal memuat media dari pustaka: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedItems([]);
    }
  }, [isOpen, selectedCategory, searchQuery, page]);

  const handleItemClick = (item: MediaItem) => {
    if (multiple) {
      const exists = selectedItems.some((s) => s.id === item.id);
      if (exists) {
        setSelectedItems((prev) => prev.filter((s) => s.id !== item.id));
      } else {
        setSelectedItems((prev) => [...prev, item]);
      }
    } else {
      onSelect(item);
      onClose();
    }
  };

  const handleConfirmMultiple = () => {
    if (onSelectMultiple && selectedItems.length > 0) {
      onSelectMultiple(selectedItems);
      onClose();
    } else if (selectedItems.length > 0) {
      onSelect(selectedItems[0]);
      onClose();
    }
  };

  // Upload handlers
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
      setActiveTab('library');
      fetchMedia();

      // If single file upload, automatically select it!
      if (!multiple && res.media.length > 0) {
        onSelect(res.media[0]);
        onClose();
      }
    } catch (err: any) {
      toast.error('Gagal mengunggah file: ' + err.message);
    } finally {
      setIsUploading(false);
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
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="4xl">
      <div className="flex flex-col gap-5">
        {/* Top Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'library'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pilih dari Media Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload Media Baru
          </button>
        </div>

        {activeTab === 'library' && (
          <div className="flex flex-col gap-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari file berdasarkan nama..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Category Pills */}
              {allowedCategory === 'all' && (
                <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                  {['all', 'image', 'video', 'audio', 'document', 'archive'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full capitalize font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Semua' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media Items Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
                <p className="text-sm">Memuat media dari pustaka...</p>
              </div>
            ) : mediaList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FileBox className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Belum ada file media yang sesuai.</p>
                <p className="text-xs text-slate-400 mt-1">Silakan unggah media baru menggunakan tab di atas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-1">
                {mediaList.map((item) => {
                  const isSelected = selectedItems.some((s) => s.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all duration-150 flex flex-col bg-white ${
                        isSelected
                          ? 'border-sky-600 ring-2 ring-sky-600/30 shadow-md'
                          : 'border-slate-200 hover:border-sky-400 hover:shadow-xs'
                      }`}
                    >
                      {/* Media Preview Box */}
                      <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                        {item.category === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.original_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center">
                            {renderIcon(item.category)}
                            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                              {item.extension}
                            </span>
                          </div>
                        )}

                        {/* Selection Checkbox Badge */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="p-2 flex-1 flex flex-col justify-between">
                        <p className="text-xs font-medium text-slate-800 line-clamp-1 group-hover:text-sky-600" title={item.original_name}>
                          {item.original_name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {(item.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                {multiple ? `${selectedItems.length} media dipilih` : 'Klik item untuk memilih'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                {multiple && (
                  <button
                    type="button"
                    onClick={handleConfirmMultiple}
                    disabled={selectedItems.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-40 rounded-lg shadow-xs transition-colors"
                  >
                    Gunakan {selectedItems.length} Media
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="flex flex-col gap-4">
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
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                dragActive
                  ? 'border-sky-500 bg-sky-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-xs flex items-center justify-center mb-4 border border-slate-100">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-sky-600" />
                )}
              </div>

              <h4 className="text-base font-semibold text-slate-800 mb-1">
                {isUploading ? 'Sedang Mengunggah Media...' : 'Tarik & Letakkan file ke sini'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
                Mendukung Gambar (JPG, PNG, WEBP, SVG), Video (MP4, WEBM), Audio (MP3), Dokumen (PDF, DOCX, XLSX), dan Arsip (ZIP). Maksimal 50MB per file.
              </p>

              <label className="cursor-pointer inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-sky-600 text-white font-medium text-sm hover:bg-sky-700 shadow-xs transition-colors">
                <span>Pilih File dari Perangkat</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUploadFiles(e.target.files)}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
