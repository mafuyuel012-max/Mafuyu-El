import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Announcement } from '../../types';

export const PengumumanPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await api.getAnnouncements();
        setAnnouncements(data);
        if (data.length > 0) {
          setExpandedId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/20 text-amber-100 text-xs font-bold uppercase tracking-wider">
            Pemberitahuan Resmi
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Pengumuman Sekolah
          </h1>
          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed">
            Informasi resmi kegiatan kurikuler, kalender akademik, libur sekolah, dan edaran kedinasan.
          </p>
        </div>
      </div>

      {/* Announcements Accordion List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-sm">Memuat pengumuman...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-800">Belum Ada Pengumuman Aktif</p>
          <p className="text-xs text-slate-400">Seluruh pengumuman terbaru akan ditampilkan pada laman ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => {
            const isExpanded = expandedId === item.id;
            const isPenting = item.priority === 'penting';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isPenting
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-start sm:items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-slate-50/60"
                >
                  <div className="flex items-start sm:items-center gap-4 pr-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPenting ? 'bg-amber-100 text-amber-700' : 'bg-sky-50 text-sky-600'
                      }`}
                    >
                      {isPenting ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isPenting && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700">
                            Penting / Mendesak
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.publish_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}{' '}
                          {item.publish_time && `â€¢ ${item.publish_time} WIB`}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Content Body */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 text-slate-700 text-sm leading-relaxed space-y-4">
                    <div className="prose prose-slate max-w-none whitespace-pre-line text-slate-700">
                      {item.content}
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                      <span>Diterbitkan oleh Manajemen SD Negeri 53 Kota Bengkulu</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
