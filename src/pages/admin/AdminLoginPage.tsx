import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { useSettings } from '../../lib/settings-context';
import { useToast } from '../../components/common/Toast';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.warning('Silakan masukkan username dan password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password.trim());
      toast.success('Login berhasil! Selamat datang di Panel CMS.');
      onNavigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Card */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-xl shadow-sky-600/30">
            53
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Portal Admin & CMS
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {settings?.school_name || 'SD Negeri 53 Kota Bengkulu'}
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username Anda..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password Anda..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              <span>{isLoading ? 'Memverifikasi Sesi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Accounts Quick-Fill Box */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Pilih Akun Pengujian (Klik untuk Isi Otomatis):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/60 text-purple-800 text-center transition-all cursor-pointer flex flex-col items-center"
              >
                <span className="font-bold text-xs">Superadmin</span>
                <span className="text-[10px] text-purple-600 font-mono mt-0.5">admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('operator', 'operator123')}
                className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200/60 text-sky-800 text-center transition-all cursor-pointer flex flex-col items-center"
              >
                <span className="font-bold text-xs">Operator</span>
                <span className="text-[10px] text-sky-600 font-mono mt-0.5">operator</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('guru_editor', 'editor123')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/60 text-amber-800 text-center transition-all cursor-pointer flex flex-col items-center"
              >
                <span className="font-bold text-xs">Editor Guru</span>
                <span className="text-[10px] text-amber-600 font-mono mt-0.5">guru_editor</span>
              </button>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between font-mono">
                <span>Superadmin:</span>
                <span className="font-semibold text-slate-800">admin / admin123</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Operator:</span>
                <span className="font-semibold text-slate-800">operator / operator123</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Editor:</span>
                <span className="font-semibold text-slate-800">guru_editor / editor123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to public link */}
        <div className="text-center">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            â† Kembali ke Beranda Website Sekolah
          </button>
        </div>
      </div>
    </div>
  );
};
