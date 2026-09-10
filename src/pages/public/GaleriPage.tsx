import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Film,
  X,
  Play,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { GalleryItem } from '../../types';

export const GaleriPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [activeMedia, setActiveMedia] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await api.getGallery(false);
        setGallery(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Extract unique albums
  const albums = Array.from(new Set(gallery.map((g) => g.album || 'Umum')));

  const filteredGallery = gallery.filter((item) => {
    const matchesAlbum = selectedAlbum === 'all' || item.album === selectedAlbum;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesAlbum && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-200 text-xs font-bold uppercase tracking-wider">
            Dokumentasi Sekolah
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Galeri Kegiatan & Prestasi
          </h1>
          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
            Kumpulan potret jejak aktivitas belajar, ekstrakurikuler, perayaan hari besar, dan prestasi siswa SD Negeri 53 Kota Bengkulu.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Album Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedAlbum('all')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors whitespace-nowrap ${
              selectedAlbum === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Album ({gallery.length})
          </button>
          {albums.map((alb) => (
            <button
              key={alb}
              onClick={() => setSelectedAlbum(alb)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors whitespace-nowrap ${
                selectedAlbum === alb
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {alb}
            </button>
          ))}
        </div>

        {/* Media type toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedType('image')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              selectedType === 'image' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Foto
          </button>
          <button
            onClick={() => setSelectedType('video')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              selectedType === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Video
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-sm">Memuat galeri kegiatan...</p>
        </div>
      ) : filteredGallery.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-800">Tidak ada media yang sesuai</p>
          <p className="text-xs text-slate-400">Silakan pilih album lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveMedia(item)}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 cursor-pointer shadow-xs border border-slate-200 hover:shadow-lg transition-all"
            >
              <img
                src={item.media_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900/70 backdrop-blur-xs text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                  {item.album}
                </span>
                <p className="text-xs font-bold text-white line-clamp-1 mt-0.5">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveMedia(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Content */}
            <div className="bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              {activeMedia.type === 'video' ? (
                <video
                  src={activeMedia.media_url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full"
                />
              ) : (
                <img
                  src={activeMedia.media_url}
                  alt={activeMedia.title}
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                />
              )}
            </div>

            {/* Metadata bar */}
            <div className="p-5 text-white bg-slate-900 space-y-1">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                {activeMedia.album}
              </span>
              <h2 className="text-base font-bold text-white">{activeMedia.title}</h2>
              {activeMedia.description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activeMedia.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
