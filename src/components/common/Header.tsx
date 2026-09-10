import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Search,
  Menu as MenuIcon,
  X,
  Lock,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../../lib/settings-context';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import { MenuItem } from '../../types';
import { SearchModal } from './SearchModal';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const DEFAULT_NAV_MENUS: MenuItem[] = [
  { id: 'menu-1', label: 'Beranda', path: '/', order: 1, is_active: true, target: '_self' },
  { id: 'menu-2', label: 'Profil', path: '/profil', order: 2, is_active: true, target: '_self' },
  { id: 'menu-3', label: 'Berita', path: '/berita', order: 3, is_active: true, target: '_self' },
  { id: 'menu-4', label: 'Pengumuman', path: '/pengumuman', order: 4, is_active: true, target: '_self' },
  { id: 'menu-5', label: 'Galeri', path: '/galeri', order: 5, is_active: true, target: '_self' },
  { id: 'menu-6', label: 'Download', path: '/download', order: 6, is_active: true, target: '_self' },
  { id: 'menu-7', label: 'Kontak', path: '/kontak', order: 7, is_active: true, target: '_self' },
];

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>(DEFAULT_NAV_MENUS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const data = await api.getMenus();
        if (Array.isArray(data) && data.length > 0) {
          setMenus(data.filter((m) => m.is_active));
        }
      } catch (err) {
        console.error('Failed to load menus:', err);
      }
    };
    fetchMenus();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (path: string, target = '_self') => {
    setIsMobileMenuOpen(false);
    if (target === '_blank') {
      window.open(path, '_blank');
    } else {
      onNavigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="w-full z-40 sticky top-0 transition-all duration-200">
        {/* Top Info Bar */}
        <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>{settings.phone}</span>
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{settings.email}</span>
                </a>
              )}
              <div className="hidden md:flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>NPSN: {settings?.npsn || '10702672'} • Akreditasi {settings?.akreditasi || 'A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Portal Kelulusan Quick Link */}
              <button
                onClick={() => handleLinkClick('/kelulusan')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-[11px] font-medium transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Cek Kelulusan</span>
              </button>

              {/* Admin Portal Shortcut */}
              <button
                onClick={() => handleLinkClick(user ? '/admin' : '/admin/login')}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <Lock className="w-3 h-3 text-sky-400" />
                <span>{user ? `CMS (${user.role})` : 'Login Admin'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Header */}
        <div
          className={`w-full bg-white transition-shadow ${
            isScrolled ? 'shadow-md py-3' : 'shadow-xs py-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
            {/* School Brand (Logo & Name) */}
            <div
              onClick={() => handleLinkClick('/')}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center p-1.5 border border-sky-100 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                {settings?.logo ? (
                  <img
                    src={settings.logo}
                    alt={settings.school_name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Sparkles className="w-6 h-6 text-sky-600" />
                )}
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-sky-600 transition-colors">
                  {settings?.school_name || 'SD NEGERI 53 KOTA BENGKULU'}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block line-clamp-1">
                  {settings?.tagline || 'Cerdas, Berkarakter, dan Berprestasi'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {menus.map((item) => {
                const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLinkClick(item.path, item.target)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-sky-600 bg-sky-50/80 shadow-xs'
                        : 'text-slate-700 hover:text-sky-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Search and Mobile Menu Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-colors"
                aria-label="Cari Konten"
                title="Pencarian Cepat"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Buka Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-1">
              {menus.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLinkClick(item.path, item.target)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
                  </button>
                );
              })}

              <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => handleLinkClick('/kelulusan')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm shadow-xs"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Cek Kelulusan Peserta Didik</span>
                </button>
                <button
                  onClick={() => handleLinkClick(user ? '/admin' : '/admin/login')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{user ? 'Buka Dashboard Admin' : 'Login Operator / Admin'}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleLinkClick}
      />
    </>
  );
};
