import React, { useState } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Tags,
  Bell,
  GraduationCap,
  FolderOpen,
  Image as ImageIcon,
  Download,
  Palette,
  Sliders,
  Menu as MenuIcon,
  Users,
  History,
  LogOut,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { useSettings } from '../../lib/settings-context';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const { user, logout, hasRole } = useAuth();
  const { settings } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationGroups = [
    {
      label: 'UTAMA',
      items: [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'editor'] },
      ],
    },
    {
      label: 'KONTEN & PUBLIKASI',
      items: [
        { path: '/admin/berita', label: 'Berita & Artikel', icon: Newspaper, roles: ['superadmin', 'admin', 'editor'] },
        { path: '/admin/kategori', label: 'Kategori Berita', icon: Tags, roles: ['superadmin', 'admin'] },
        { path: '/admin/pengumuman', label: 'Pengumuman', icon: Bell, roles: ['superadmin', 'admin'] },
        { path: '/admin/kelulusan', label: 'Kelulusan Siswa', icon: GraduationCap, roles: ['superadmin', 'admin'] },
        { path: '/admin/media', label: 'Media Library', icon: FolderOpen, roles: ['superadmin', 'admin', 'editor'] },
        { path: '/admin/galeri', label: 'Galeri Foto & Video', icon: ImageIcon, roles: ['superadmin', 'admin'] },
        { path: '/admin/download', label: 'Download Center', icon: Download, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      label: 'TAMPILAN & TEMA',
      items: [
        { path: '/admin/tampilan', label: 'Identitas & Desain', icon: Palette, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      label: 'PENGATURAN',
      items: [
        { path: '/admin/menu', label: 'Menu Navigasi', icon: MenuIcon, roles: ['superadmin', 'admin'] },
        { path: '/admin/pengaturan', label: 'Profil & Kontak', icon: Sliders, roles: ['superadmin', 'admin'] },
      ],
    },
    {
      label: 'SISTEM',
      items: [
        { path: '/admin/pengguna', label: 'Manajemen Pengguna', icon: Users, roles: ['superadmin'] },
        { path: '/admin/aktivitas', label: 'Log Aktivitas', icon: History, roles: ['superadmin', 'admin'] },
      ],
    },
  ];

  const handleNav = (path: string) => {
    setIsSidebarOpen(false);
    onNavigate(path);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700">SUPER ADMIN</span>;
      case 'admin':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-700">ADMIN</span>;
      case 'editor':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">EDITOR</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Admin Mobile Topbar */}
      <header className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            {settings?.logo ? (
              <img src={settings.logo} alt="Logo" className="w-6 h-6 object-contain rounded" />
            ) : null}
            <span className="font-bold text-sm truncate max-w-[200px]">
              {settings?.school_name || 'CMS SDN 53 Bengkulu'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/')}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Lihat Web</span>
        </button>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-0 h-screen w-72 bg-slate-900 text-slate-300 flex flex-col z-50 transition-transform duration-200 ease-in-out border-r border-slate-800 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div
              onClick={() => handleNav('/admin')}
              className="flex items-center gap-3 cursor-pointer min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0 overflow-hidden p-1">
                {settings?.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  '53'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-sm text-white truncate">
                  {settings?.school_name || 'SDN 53 Bengkulu'}
                </h2>
                <p className="text-[11px] text-sky-400 font-medium truncate">Control Center CMS</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info box */}
          <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <div className="mt-1">{user && getRoleBadge(user.role)}</div>
            </div>
          </div>

          {/* Navigation Links Grouped */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
            {navigationGroups.map((group) => {
              const visibleItems = group.items.filter((item) =>
                user ? (item.roles as any).includes(user.role) : false
              );
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    {group.label}
                  </p>
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      currentPath === item.path ||
                      (item.path !== '/admin' && currentPath.startsWith(item.path));

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNav(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                          isActive
                            ? 'bg-sky-600 text-white font-semibold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-slate-800 space-y-1.5">
            <button
              onClick={() => onNavigate('/')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span>Lihat Website Publik</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
          {/* Desktop Top Header Bar */}
          <div className="hidden lg:flex items-center justify-between bg-white px-8 py-4 border-b border-slate-200 shadow-xs">
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Panel Administrasi & Pengelolaan Sekolah
              </h1>
              <p className="text-xs text-slate-500">
                SD Negeri 53 Kota Bengkulu â€¢ Sesi aktif sebagai <span className="font-semibold text-slate-700">{user?.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                <span>Buka Portal Publik</span>
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                title="Keluar dari sesi CMS"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Dynamic Page Content */}
          <div className="p-4 sm:p-8 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
};
