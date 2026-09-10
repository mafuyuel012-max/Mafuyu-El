import React, { useState, useEffect } from 'react';
import {
  Building2,
  UserCheck,
  Target,
  History,
  Phone,
  Save,
  Image as ImageIcon,
  CheckCircle,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
  Check,
  Zap,
} from 'lucide-react';
import { useSettings } from '../../lib/settings-context';
import { useToast } from '../../components/common/Toast';
import { MediaPickerModal } from '../../components/common/MediaPickerModal';
import { MediaItem } from '../../types';
import { api } from '../../lib/api';

export const AdminPengaturanPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'identitas' | 'sambutan' | 'visimisi' | 'sejarah' | 'database'>('identitas');
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Supabase Cloud State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConfigured: boolean;
    connected: boolean;
    message: string;
    url?: string | null;
  } | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isCopiedSchema, setIsCopiedSchema] = useState(false);

  // Fetch Supabase status when tab opens
  useEffect(() => {
    if (activeTab === 'database') {
      checkSupabaseStatus();
    }
  }, [activeTab]);

  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    synced: Record<string, number>;
    message: string;
    errors?: string[];
  } | null>(null);

  const checkSupabaseStatus = async () => {
    setIsCheckingSupabase(true);
    try {
      const res = await api.getSupabaseStatus();
      setSupabaseStatus(res);
    } catch (err: any) {
      setSupabaseStatus({
        isConfigured: false,
        connected: false,
        message: 'Tidak dapat memeriksa status Supabase.',
      });
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    toast.info('Menguji koneksi ke Supabase Cloud...');
    try {
      const res = await api.testSupabase();
      if (res.connected) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      checkSupabaseStatus();
    } catch (err: any) {
      toast.error(err.message || 'Uji koneksi ke Supabase gagal.');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    toast.info('Memulai sinkronisasi data website ke Supabase Cloud...');
    try {
      const res = await api.syncToSupabase();
      setSyncResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.warning(res.message);
      }
      checkSupabaseStatus();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyinkronkan data ke Supabase.');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySchemaSql = async () => {
    try {
      const res = await api.getSupabaseSchema();
      await navigator.clipboard.writeText(res.sql);
      setIsCopiedSchema(true);
      toast.success('Skrip SQL Skema Supabase berhasil disalin ke clipboard!');
      setTimeout(() => setIsCopiedSchema(false), 3000);
    } catch (err: any) {
      toast.error('Gagal mengambil skrip SQL skema.');
    }
  };

  // Tab 1: Identitas & Kontak
  const [schoolName, setSchoolName] = useState(settings?.school_name || '');
  const [npsn, setNpsn] = useState(settings?.npsn || '10702482');
  const [akreditasi, setAkreditasi] = useState(settings?.akreditasi || 'A (Unggul)');
  const [address, setAddress] = useState(settings?.address || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [facebook, setFacebook] = useState(settings?.facebook || '');
  const [instagram, setInstagram] = useState(settings?.instagram || '');
  const [youtube, setYoutube] = useState(settings?.youtube || '');

  // Tab 2: Sambutan Kepala Sekolah
  const [kepsekNama, setKepsekNama] = useState(settings?.kepala_sekolah_nama || '');
  const [kepsekNip, setKepsekNip] = useState(settings?.kepala_sekolah_nip || '');
  const [kepsekFoto, setKepsekFoto] = useState(settings?.kepala_sekolah_foto || '');
  const [kepsekSambutan, setKepsekSambutan] = useState(settings?.kepala_sekolah_sambutan || '');

  // Tab 3: Visi Misi
  const [visi, setVisi] = useState(settings?.visi || '');
  const [misi, setMisi] = useState(settings?.misi?.join('\n') || '');
  const [tujuan, setTujuan] = useState(settings?.tujuan?.join('\n') || '');

  // Tab 4: Sejarah & Sarpras
  const [sejarah, setSejarah] = useState(settings?.sejarah || '');
  const [sarana, setSarana] = useState(settings?.sarana_prasarana?.join('\n') || '');

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        school_name: schoolName,
        npsn,
        akreditasi,
        address,
        phone,
        whatsapp,
        email,
        facebook,
        instagram,
        youtube,
        kepala_sekolah_nama: kepsekNama,
        kepala_sekolah_nip: kepsekNip,
        kepala_sekolah_foto: kepsekFoto,
        kepala_sekolah_sambutan: kepsekSambutan,
        visi,
        misi: misi.split('\n').filter((l) => l.trim().length > 0),
        tujuan: tujuan.split('\n').filter((l) => l.trim().length > 0),
        sejarah,
        sarana_prasarana: sarana.split('\n').filter((l) => l.trim().length > 0),
      });
      toast.success('Pengaturan profil sekolah berhasil disimpan secara keseluruhan!');
    } catch (err: any) {
      toast.error('Gagal menyimpan profil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Pengaturan Profil & Data Sekolah
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola sambutan kepala sekolah, visi misi, identitas resmi, sarana, dan kontak
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('identitas')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'identitas'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Identitas & Kontak
        </button>
        <button
          onClick={() => setActiveTab('sambutan')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sambutan'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sambutan Kepala Sekolah
        </button>
        <button
          onClick={() => setActiveTab('visimisi')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'visimisi'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Visi, Misi & Tujuan
        </button>
        <button
          onClick={() => setActiveTab('sejarah')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sejarah'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sejarah & Sarana Prasarana
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'database'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Supabase Cloud (Gratis)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* TAB 1: IDENTITAS & KONTAK */}
        {activeTab === 'identitas' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Identitas Sekolah & Nomor Registrasi
              </h3>
              <a
                href="/admin/tampilan"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/admin/tampilan');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
              >
                <span>Ubah Logo & Latar Belakang &rarr;</span>
              </a>
            </div>

            {/* School Logo Snapshot */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                  {settings?.logo ? (
                    <img src={settings.logo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-black text-sky-600 text-sm">53</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Logo Resmi Sekolah</div>
                  <div className="text-[11px] text-slate-500">
                    {settings?.logo ? 'Logo kustom telah dikonfigurasi' : 'Menggunakan lambang default'}
                  </div>
                </div>
              </div>
              <a
                href="/admin/tampilan"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/admin/tampilan');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs whitespace-nowrap"
              >
                Ganti Logo
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NPSN
                </label>
                <input
                  type="text"
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Akreditasi
                </label>
                <input
                  type="text"
                  value={akreditasi}
                  onChange={(e) => setAkreditasi(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Alamat Lengkap
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 pt-4">
              Kontak Resmi & Media Sosial
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Telepon Kantor
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp Center
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Kedinasan
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Facebook Fanpage
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instagram Akun
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kanal YouTube
                </label>
                <input
                  type="text"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAMBUTAN KEPALA SEKOLAH */}
        {activeTab === 'sambutan' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Profil & Sambutan Kepala Sekolah
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Kepala Sekolah Beserta Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={kepsekNama}
                  onChange={(e) => setKepsekNama(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={kepsekNip}
                  onChange={(e) => setKepsekNip(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Foto Resmi Kepala Sekolah
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {kepsekFoto ? (
                    <img src={kepsekFoto} alt="Kepsek" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      No Photo
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Pilih Foto dari Media Library
                  </button>
                  <input
                    type="text"
                    value={kepsekFoto}
                    onChange={(e) => setKepsekFoto(e.target.value)}
                    placeholder="Atau masukkan URL foto..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Isi Lengkap Sambutan Kepala Sekolah *
              </label>
              <textarea
                rows={6}
                required
                value={kepsekSambutan}
                onChange={(e) => setKepsekSambutan(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 3: VISI MISI & TUJUAN */}
        {activeTab === 'visimisi' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Visi, Misi, & Tujuan Pendidikan
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Visi Sekolah
              </label>
              <textarea
                rows={3}
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Misi Sekolah (Satu poin per baris)
              </label>
              <textarea
                rows={6}
                value={misi}
                onChange={(e) => setMisi(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tujuan Sekolah (Satu poin per baris)
              </label>
              <textarea
                rows={5}
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 4: SEJARAH & SARANA */}
        {activeTab === 'sejarah' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Sejarah & Sarana Prasarana
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sejarah Berdirinya Sekolah
              </label>
              <textarea
                rows={5}
                value={sejarah}
                onChange={(e) => setSejarah(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Daftar Sarana & Prasarana Sekolah (Satu fasilitas per baris)
              </label>
              <textarea
                rows={6}
                value={sarana}
                onChange={(e) => setSarana(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 5: SUPABASE CLOUD DATABASE */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    supabaseStatus?.connected ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Status Database Cloud (Supabase PostgreSQL)
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        supabaseStatus?.connected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {supabaseStatus?.connected ? 'Terhubung (Online)' : 'Mode Lokal (Siap Disambungkan)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {supabaseStatus?.message || 'Memeriksa status koneksi database cloud...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={checkSupabaseStatus}
                    disabled={isCheckingSupabase}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                    title="Muat Ulang Status"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={isTestingSupabase}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isTestingSupabase ? 'Menguji...' : 'Uji Koneksi'}</span>
                  </button>
                </div>
              </div>

              {/* URL Detail if connected */}
              {supabaseStatus?.url && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Supabase Host URL:</span>
                  <span className="font-mono text-slate-800 font-bold">{supabaseStatus.url}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Sinkronisasi Data Lokal &rarr; Supabase</span>
                  </div>
                  <p className="text-xs text-emerald-800/80 leading-relaxed">
                    Unggah seluruh data berita, galeri, pengumuman, dan pengaturan sekolah dari penyimpanan lokal saat ini ke tabel Supabase Cloud Anda.
                  </p>
                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingSupabase}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSupabase ? 'Sedang Mengunggah & Menyinkronkan...' : 'Unggah & Sinkronkan ke Supabase'}</span>
                  </button>

                  {syncResult && (
                    <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-300 text-[11px] text-slate-700 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ringkasan Data Tersinkron:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-medium">
                        <div>• Profil Sekolah: <span className="font-bold text-slate-800">{syncResult.synced.settings || 0}</span></div>
                        <div>• Berita & Post: <span className="font-bold text-slate-800">{syncResult.synced.posts || 0}</span></div>
                        <div>• Kategori: <span className="font-bold text-slate-800">{syncResult.synced.categories || 0}</span></div>
                        <div>• Galeri Foto: <span className="font-bold text-slate-800">{syncResult.synced.gallery || 0}</span></div>
                        <div>• Pengumuman: <span className="font-bold text-slate-800">{syncResult.synced.announcements || 0}</span></div>
                        <div>• Unduhan Dokumen: <span className="font-bold text-slate-800">{syncResult.synced.downloads || 0}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
                    <Copy className="w-4 h-4 text-sky-600" />
                    <span>Skrip SQL Skema Otomatis</span>
                  </div>
                  <p className="text-xs text-sky-800/80 leading-relaxed">
                    Salin seluruh skrip DDL SQL lengkap (tabel berita, pengaturan, kelulusan, dan RLS publik) untuk dijalankan di SQL Editor Supabase.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopySchemaSql}
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isCopiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedSchema ? 'Skrip SQL Tersalin!' : 'Salin Skrip SQL Skema'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step by Step Tutorial Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Tutorial Gratis: Cara Menghubungkan Supabase (100% Bebas Biaya)
                </h3>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Buka Supabase.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Buat Project Baru di Supabase</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Daftar akun gratis di <strong>supabase.com</strong>, klik <em>New Project</em>, beri nama misalnya <code className="bg-slate-200 px-1 rounded">sdn53-db</code>, tentukan password database, dan pilih region terdekat (misal: <em>Singapore</em>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Jalankan Skrip SQL Skema</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Di dashboard Supabase, klik menu <strong>SQL Editor</strong> di bilah kiri &rarr; <em>New query</em>. Tempelkan skrip yang telah disalin dari tombol di atas, lalu klik <strong>Run</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Masukkan API Keys</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Buka <strong>Project Settings &rarr; API</strong> di Supabase. Salin <em>Project URL</em> dan <em>service_role key</em> (atau <em>anon key</em>), masukkan ke file <code className="bg-slate-200 px-1 rounded">.env</code> atau Secrets hosting Anda.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <strong className="font-bold">Keuntungan Supabase untuk Website Publik Sekolah:</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Supabase menggunakan PostgreSQL open-source yang sangat cepat dan gratis selamanya hingga 500MB penyimpanan data. Ketika Admin menambah berita atau mengubah sambutan kepala sekolah, data otomatis tersimpan di cloud dan langsung muncul ke seluruh pengunjung publik seketika.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save button only for profile tabs */}
        {activeTab !== 'database' && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Seluruh Pengaturan Profil'}</span>
            </button>
          </div>
        )}
      </form>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media: MediaItem) => setKepsekFoto(media.url)}
        allowedCategory="image"
        title="Pilih Foto Resmi Kepala Sekolah"
      />
    </div>
  );
};
