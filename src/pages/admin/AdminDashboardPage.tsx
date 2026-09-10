import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Tags,
  Bell,
  GraduationCap,
  FolderOpen,
  Users,
  Eye,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardStats, ActivityLog } from '../../types';
import { useAuth } from '../../lib/auth-context';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const [statsData, logsRes] = await Promise.all([
          api.getDashboardStats().catch((err) => {
            console.error('Failed to load stats:', err);
            return null;
          }),
          api.getActivityLogs(1, 8).catch((err) => {
            console.error('Failed to load activity logs:', err);
            return null;
          }),
        ]);

        if (!isMounted) return;

        if (statsData) {
          setStats(statsData);
        }

        if (logsRes && Array.isArray(logsRes.data)) {
          setLogs(logsRes.data);
        } else if (Array.isArray(logsRes)) {
          setLogs(logsRes as any);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
            Control Panel Sekolah
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Selamat Datang, {user?.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Anda masuk dengan hak akses sebagai <strong className="text-sky-400 capitalize">{user?.role}</strong>. Kelola warta kegiatan, media library, dan portal kelulusan secara terpadu.
          </p>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => onNavigate('/admin/berita')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      {/* Metrics 4-Column Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Posts */}
        <div
          onClick={() => onNavigate('/admin/berita')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_posts ?? stats?.total_news ?? 0}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Total Berita</p>
        </div>

        {/* Kategori */}
        <div
          onClick={() => onNavigate('/admin/kategori')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Tags className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_categories ?? 0}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Kategori</p>
        </div>

        {/* Media */}
        <div
          onClick={() => onNavigate('/admin/media')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_media ?? 0}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Berkas Media</p>
        </div>

        {/* Pengumuman */}
        <div
          onClick={() => onNavigate('/admin/pengumuman')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Bell className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_announcements ?? stats?.active_announcements ?? 0}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Pengumuman</p>
        </div>

        {/* Kelulusan */}
        <div
          onClick={() => onNavigate('/admin/kelulusan')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_students ?? stats?.graduation_stats?.total_students ?? 0}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Peserta Lulus</p>
        </div>

        {/* Users */}
        <div
          onClick={() => onNavigate('/admin/pengguna')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.total_users ?? 0}</div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Operator CMS</p>
        </div>
      </div>

      {/* Two-Column Grid: Quick Actions & Graduation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Quick Actions & Recent Activity Logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Shortcuts Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pintasan Menu Cepat
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('/admin/berita')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors text-left"
              >
                <Newspaper className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Kelola Berita</span>
              </button>
              <button
                onClick={() => onNavigate('/admin/media')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors text-left"
              >
                <FolderOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Media Library</span>
              </button>
              <button
                onClick={() => onNavigate('/admin/kelulusan')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors text-left"
              >
                <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Jadwal Kelulusan</span>
              </button>
              <button
                onClick={() => onNavigate('/admin/pengaturan')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors text-left"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Profil & Kontak</span>
              </button>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Log Aktivitas Pengguna Terkini
              </h3>
              <button
                onClick={() => onNavigate('/admin/aktivitas')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                Semua Log &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {!Array.isArray(logs) || logs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada catatan aktivitas.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.user_name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold uppercase">
                          {log.action}
                        </span>
                        <span className="text-slate-500 font-medium capitalize">
                          {log.entity_type}
                        </span>
                      </div>
                      <p className="text-slate-600">{log.details}</p>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Graduation & System Overview Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Graduation Module Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Status Modul Kelulusan
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status Portal:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                  Siap / Terjadwal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tahun Pelajaran:</span>
                <span className="font-semibold text-slate-800">{stats?.graduation_stats?.academic_year || '2025/2026'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Siswa Terdaftar:</span>
                <span className="font-bold text-slate-900">{stats?.total_students ?? stats?.graduation_stats?.total_students ?? 0} Siswa</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/admin/kelulusan')}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Kelola Jadwal & Data Siswa
                </button>
              </div>
            </div>
          </div>

          {/* System Info Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Informasi Lingkungan Sistem
            </h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Versi CMS:</span>
                <span className="font-mono font-bold text-slate-900">v2.4.0-PRO</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Backend Engine:</span>
                <span className="font-mono text-slate-800">Express + TypeScript</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Database Engine:</span>
                <span className="font-mono text-slate-800">JSON Atomic Store</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span>Media Storage:</span>
                <span className="font-mono text-slate-800">Local Uploads Directory</span>
              </div>
              <div className="flex justify-between">
                <span>Keamanan Sesi:</span>
                <span className="font-mono text-emerald-600 font-semibold">JWT + Bcrypt (Active)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
