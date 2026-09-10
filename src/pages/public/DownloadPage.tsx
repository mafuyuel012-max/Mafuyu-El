import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Search,
  CheckCircle,
  Eye,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DownloadItem } from '../../types';

export const DownloadPage: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDownloads = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDownloads(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setDownloads(data);
    } catch (err) {
      console.error('Failed to load downloads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, [selectedCategory]);

  const handleDownloadClick = async (item: DownloadItem) => {
    try {
      // Record download hit
      await api.recordDownloadHit(item.id);
      // Update local count
      setDownloads((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, downloads_count: d.downloads_count + 1 } : d))
      );

      // Trigger actual download
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.file_name || item.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const categories = ['all', 'Formulir', 'Silabus', 'RPP', 'Panduan', 'Surat Edaran', 'Materi'];

  const filteredDownloads = downloads.filter((d) =>
    searchQuery ? d.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-rose-500" />;
    if (type.includes('sheet') || type.includes('xls'))
      return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
    if (type.includes('zip') || type.includes('rar'))
      return <FileArchive className="w-6 h-6 text-amber-500" />;
    return <FileText className="w-6 h-6 text-sky-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider">
            Layanan Dokumen & Berkas
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Pusat Unduhan & Formulir Resmi
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Unduh formulir pendaftaran, kalender pendidikan, silabus, instrumen penilaian, dan berkas surat edaran resmi SD Negeri 53 Kota Bengkulu.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Berkas' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama dokumen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* File List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Memuat daftar unduhan...</p>
        </div>
      ) : filteredDownloads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-800">Tidak ada dokumen yang sesuai</p>
          <p className="text-xs text-slate-400">Silakan pilih kategori berkas lain atau ubah pencarian Anda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDownloads.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getFileIcon(item.file_type || item.file_url)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {(item.file_size / 1024).toFixed(0)} KB â€¢ {item.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-[11px] text-slate-400">
                  {item.downloads_count}x diunduh
                </span>

                <button
                  onClick={() => handleDownloadClick(item)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
