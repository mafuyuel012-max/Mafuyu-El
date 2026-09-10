import React, { useState, useEffect } from 'react';
import { Search, Loader2, FileText, Bell, Download, Image as ImageIcon, ArrowRight, X } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../../lib/api';
import { Post, Announcement, DownloadItem, GalleryItem } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    posts: Post[];
    announcements: Announcement[];
    downloads: DownloadItem[];
    gallery: GalleryItem[];
  }>({ posts: [], announcements: [], downloads: [], gallery: [] });
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ posts: [], announcements: [], downloads: [], gallery: [] });
      setTotalResults(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.globalSearch(query);
        setResults(res.results);
        setTotalResults(res.total);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl" showCloseButton={false}>
      <div className="flex flex-col gap-4 -m-2">
        {/* Search Input Box */}
        <div className="relative flex items-center border-b border-slate-200 pb-3">
          <Search className="w-5 h-5 text-slate-400 absolute left-2" />
          <input
            type="text"
            placeholder="Ketik kata kunci untuk mencari berita, pengumuman, formulir, atau galeri..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-10 py-2.5 text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto space-y-5 px-1 py-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              <p className="text-xs">Mencari di seluruh konten sekolah...</p>
            </div>
          ) : query && totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-700">Tidak ada hasil ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain seperti "kelulusan", "tari", atau "jadwal".</p>
            </div>
          ) : (
            <>
              {/* Berita Results */}
              {results.posts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Berita ({results.posts.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handleSelect(`/berita/${post.slug}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-sky-50 text-left transition-colors border border-slate-100 hover:border-sky-200 group"
                      >
                        <div className="pr-4">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700">
                            {post.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{post.summary}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 shrink-0 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pengumuman Results */}
              {results.announcements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>Pengumuman ({results.announcements.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.announcements.map((ann) => (
                      <button
                        key={ann.id}
                        onClick={() => handleSelect('/pengumuman')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 text-left transition-colors border border-slate-100 hover:border-amber-200 group"
                      >
                        <div className="pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-amber-800">
                              {ann.title}
                            </span>
                            {ann.priority === 'penting' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                                Penting
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ann.content}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unduhan Results */}
              {results.downloads.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Download Center ({results.downloads.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {results.downloads.map((dl) => (
                      <button
                        key={dl.id}
                        onClick={() => handleSelect('/download')}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 text-left transition-colors border border-slate-100 hover:border-emerald-200 group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-800">
                            {dl.title}
                          </p>
                          <p className="text-xs text-slate-400">{dl.category} â€¢ {(dl.file_size / 1024).toFixed(0)} KB</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Galeri Results */}
              {results.gallery.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    <span>Galeri ({results.gallery.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {results.gallery.map((gal) => (
                      <button
                        key={gal.id}
                        onClick={() => handleSelect('/galeri')}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-purple-50 text-left transition-colors border border-slate-100 group"
                      >
                        <img
                          src={gal.media_url}
                          alt={gal.title}
                          className="w-12 h-12 object-cover rounded-lg shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-purple-700">
                            {gal.title}
                          </p>
                          <p className="text-[10px] text-slate-400">{gal.album}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>Ketik kata kunci untuk pencarian langsung</span>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
          >
            Tutup (ESC)
          </button>
        </div>
      </div>
    </Modal>
  );
};
