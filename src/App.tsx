import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { SettingsProvider, useSettings } from './lib/settings-context';
import { ToastProvider } from './components/common/Toast';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { BerandaPage } from './pages/public/BerandaPage';
import { ProfilPage } from './pages/public/ProfilPage';
import { BeritaPage } from './pages/public/BeritaPage';
import { BeritaDetailPage } from './pages/public/BeritaDetailPage';
import { PengumumanPage } from './pages/public/PengumumanPage';
import { GaleriPage } from './pages/public/GaleriPage';
import { DownloadPage } from './pages/public/DownloadPage';
import { KelulusanPage } from './pages/public/KelulusanPage';
import { KontakPage } from './pages/public/KontakPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBeritaPage } from './pages/admin/AdminBeritaPage';
import { AdminKategoriPage } from './pages/admin/AdminKategoriPage';
import { AdminPengumumanPage } from './pages/admin/AdminPengumumanPage';
import { AdminKelulusanPage } from './pages/admin/AdminKelulusanPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminGaleriPage } from './pages/admin/AdminGaleriPage';
import { AdminDownloadPage } from './pages/admin/AdminDownloadPage';
import { AdminTampilanPage } from './pages/admin/AdminTampilanPage';
import { AdminMenuPage } from './pages/admin/AdminMenuPage';
import { AdminPengaturanPage } from './pages/admin/AdminPengaturanPage';
import { AdminPenggunaPage } from './pages/admin/AdminPenggunaPage';
import { AdminAktivitasPage } from './pages/admin/AdminAktivitasPage';
import { WebsiteBackgroundLayer } from './components/common/WebsiteBackgroundLayer';

const AppContent: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { settings } = useSettings();

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Synchronize browser history and popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (path: string) => {
    if (path === currentPath) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  // If loading auth state and user is navigating to an admin route (other than login)
  if (isAdminRoute && isAuthLoading && currentPath !== '/admin/login') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Memuat sesi administrator...</p>
      </div>
    );
  }

  // If visiting an admin route and not logged in (and not already on login page)
  if (isAdminRoute && currentPath !== '/admin/login' && !user) {
    return <AdminLoginPage onNavigate={navigate} />;
  }

  // Admin Routes Handler
  if (isAdminRoute) {
    if (currentPath === '/admin/login') {
      return <AdminLoginPage onNavigate={navigate} />;
    }

    return (
      <AdminLayout currentPath={currentPath} onNavigate={navigate}>
        {currentPath === '/admin' || currentPath === '/admin/dashboard' ? (
          <AdminDashboardPage onNavigate={navigate} />
        ) : currentPath === '/admin/berita' ? (
          <AdminBeritaPage />
        ) : currentPath === '/admin/kategori' ? (
          <AdminKategoriPage />
        ) : currentPath === '/admin/pengumuman' ? (
          <AdminPengumumanPage />
        ) : currentPath === '/admin/kelulusan' ? (
          <AdminKelulusanPage />
        ) : currentPath === '/admin/media' ? (
          <AdminMediaPage />
        ) : currentPath === '/admin/galeri' ? (
          <AdminGaleriPage />
        ) : currentPath === '/admin/download' ? (
          <AdminDownloadPage />
        ) : currentPath === '/admin/tampilan' ? (
          <AdminTampilanPage />
        ) : currentPath === '/admin/menu' ? (
          <AdminMenuPage />
        ) : currentPath === '/admin/pengaturan' ? (
          <AdminPengaturanPage />
        ) : currentPath === '/admin/pengguna' ? (
          <AdminPenggunaPage />
        ) : currentPath === '/admin/aktivitas' ? (
          <AdminAktivitasPage />
        ) : (
          <AdminDashboardPage onNavigate={navigate} />
        )}
      </AdminLayout>
    );
  }

  // Public Routes Routing
  const renderPublicPage = () => {
    // Check for single news slug: /berita/:slug
    if (currentPath.startsWith('/berita/') && currentPath !== '/berita') {
      const slug = currentPath.replace('/berita/', '');
      return <BeritaDetailPage slug={slug} onNavigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
      case '/beranda':
        return <BerandaPage onNavigate={navigate} />;
      case '/profil':
        return <ProfilPage onNavigate={navigate} />;
      case '/berita':
        return <BeritaPage onNavigate={navigate} />;
      case '/pengumuman':
        return <PengumumanPage onNavigate={navigate} />;
      case '/galeri':
        return <GaleriPage onNavigate={navigate} />;
      case '/download':
        return <DownloadPage onNavigate={navigate} />;
      case '/kelulusan':
        return <KelulusanPage onNavigate={navigate} />;
      case '/kontak':
        return <KontakPage onNavigate={navigate} />;
      default:
        return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
            <h1 className="text-6xl font-black text-slate-200 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Halaman Tidak Ditemukan</h2>
            <p className="text-slate-500 text-sm max-w-md mb-6">
              Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-sky-500 selection:text-white relative">
      <WebsiteBackgroundLayer settings={settings} />
      <Header currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1 relative z-10">{renderPublicPage()}</main>
      <Footer onNavigate={navigate} />

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
