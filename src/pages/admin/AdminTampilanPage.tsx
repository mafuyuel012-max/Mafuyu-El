import React, { useState, useRef } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Save,
  Check,
  RefreshCw,
  Upload,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  Sun,
  Moon,
  Trash2,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { useSettings } from '../../lib/settings-context';
import { useToast } from '../../components/common/Toast';
import { MediaPickerModal } from '../../components/common/MediaPickerModal';
import { MediaItem } from '../../types';
import { api } from '../../lib/api';
import {
  PRESET_COLORS,
  PRESET_GRADIENTS,
  PRESET_PATTERNS,
  getBackgroundPatternStyle,
} from '../../lib/background-utils';

export const AdminTampilanPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const toast = useToast();

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // 1. Identity & Logo
  const [schoolName, setSchoolName] = useState(settings?.school_name || 'SD Negeri 53 Kota Bengkulu');
  const [tagline, setTagline] = useState(settings?.tagline || 'Cerdas, Berkarakter, Berakhlak Mulia & Berwawasan Lingkungan');
  const [logoUrl, setLogoUrl] = useState(settings?.logo || '');
  const [faviconUrl, setFaviconUrl] = useState(settings?.favicon || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  // 2. Background Settings
  const [bgType, setBgType] = useState<'none' | 'color' | 'gradient' | 'pattern' | 'image'>(
    (settings?.background_type as any) || 'none'
  );
  const [bgValue, setBgValue] = useState(settings?.background_value || '#f8fafc');
  const [bgOpacity, setBgOpacity] = useState<number>(settings?.background_opacity ?? 100);
  const [bgPattern, setBgPattern] = useState<string>(settings?.background_pattern || 'grid');
  const [bgRepeat, setBgRepeat] = useState<'cover' | 'repeat' | 'contain'>(settings?.background_repeat || 'cover');
  const [bgAttachment, setBgAttachment] = useState<'fixed' | 'scroll'>(settings?.background_attachment || 'fixed');
  const [bgOverlayColor, setBgOverlayColor] = useState<string>(settings?.background_overlay_color || '#ffffff');
  const [bgBlur, setBgBlur] = useState<number>(settings?.background_blur ?? 0);
  const [isUploadingBgImage, setIsUploadingBgImage] = useState(false);

  // 3. Hero Section
  const [heroTitle, setHeroTitle] = useState(settings?.hero_title || 'Membangun Karakter & Mengukir Prestasi Gemilang');
  const [heroSubtitle, setHeroSubtitle] = useState(
    settings?.hero_subtitle ||
      'Selamat Datang di SD Negeri 53 Kota Bengkulu. Lembaga pendidikan ramah anak yang membentuk generasi religius, cerdas, dan berintegritas.'
  );
  const [heroButtonText, setHeroButtonText] = useState(settings?.hero_button_text || 'Jelajahi Profil Sekolah');
  const [heroButtonLink, setHeroButtonLink] = useState(settings?.hero_button_link || '/profil');
  const [heroBannerUrl, setHeroBannerUrl] = useState(
    settings?.hero_image || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80'
  );

  // 4. Colors
  const [primaryColor, setPrimaryColor] = useState(settings?.primary_color || '#0284c7');
  const [secondaryColor, setSecondaryColor] = useState(settings?.secondary_color || '#0f172a');

  const [isSaving, setIsSaving] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState<'logo' | 'favicon' | 'banner' | 'background' | null>(null);

  // Direct file upload handlers
  const handleUploadLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('status', 'public');

    try {
      const res = await api.uploadMedia(formData);
      if (res.media && res.media.length > 0) {
        setLogoUrl(res.media[0].url);
        toast.success('Logo baru berhasil diunggah!');
      }
    } catch (err: any) {
      toast.error('Gagal mengunggah logo: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleUploadFaviconFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('status', 'public');

    try {
      const res = await api.uploadMedia(formData);
      if (res.media && res.media.length > 0) {
        setFaviconUrl(res.media[0].url);
        toast.success('Favicon baru berhasil diunggah!');
      }
    } catch (err: any) {
      toast.error('Gagal mengunggah favicon: ' + err.message);
    } finally {
      setIsUploadingFavicon(false);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const handleUploadBgImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBgImage(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('status', 'public');

    try {
      const res = await api.uploadMedia(formData);
      if (res.media && res.media.length > 0) {
        setBgValue(res.media[0].url);
        setBgType('image');
        toast.success('Gambar latar belakang berhasil diunggah!');
      }
    } catch (err: any) {
      toast.error('Gagal mengunggah gambar latar: ' + err.message);
    } finally {
      setIsUploadingBgImage(false);
      if (bgFileInputRef.current) bgFileInputRef.current.value = '';
    }
  };

  const handleSelectMedia = (media: MediaItem) => {
    if (activeMediaTarget === 'logo') {
      setLogoUrl(media.url);
      toast.success('Logo sekolah diperbarui dari Media.');
    } else if (activeMediaTarget === 'favicon') {
      setFaviconUrl(media.url);
      toast.success('Favicon diperbarui dari Media.');
    } else if (activeMediaTarget === 'banner') {
      setHeroBannerUrl(media.url);
      toast.success('Banner hero diperbarui.');
    } else if (activeMediaTarget === 'background') {
      setBgValue(media.url);
      setBgType('image');
      toast.success('Gambar latar belakang dipilih dari Media.');
    }
    setActiveMediaTarget(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        school_name: schoolName,
        tagline,
        logo: logoUrl,
        favicon: faviconUrl,
        background_type: bgType,
        background_value: bgValue,
        background_opacity: bgOpacity,
        background_pattern: bgPattern,
        background_repeat: bgRepeat,
        background_attachment: bgAttachment,
        background_overlay_color: bgOverlayColor,
        background_blur: bgBlur,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_button_text: heroButtonText,
        hero_button_link: heroButtonLink,
        hero_image: heroBannerUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });
      toast.success('Pengaturan logo, latar belakang, dan tema website berhasil disimpan!');
    } catch (err: any) {
      toast.error('Gagal menyimpan tampilan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper style for live mockup preview
  const getMockupBackgroundStyle = (): React.CSSProperties => {
    switch (bgType) {
      case 'color':
        return { backgroundColor: bgValue || '#f8fafc' };
      case 'gradient':
        return { backgroundImage: bgValue || PRESET_GRADIENTS[0].value };
      case 'pattern':
        return {
          backgroundColor: '#f8fafc',
          ...getBackgroundPatternStyle(bgPattern),
          opacity: Math.max(0.1, bgOpacity / 100),
        };
      case 'image':
        return {
          backgroundImage: bgValue ? `url("${bgValue}")` : 'none',
          backgroundColor: '#f8fafc',
          backgroundSize: bgRepeat === 'repeat' ? 'auto' : bgRepeat,
          backgroundRepeat: bgRepeat === 'repeat' ? 'repeat' : 'no-repeat',
          backgroundPosition: 'center',
          filter: bgBlur > 0 ? `blur(${bgBlur}px)` : undefined,
        };
      case 'none':
      default:
        return { backgroundColor: '#f8fafc' };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-sky-600" />
            <span>Kustomisasi Logo & Latar Belakang Website</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan logo resmi sekolah, gaya latar belakang website publik, banner hero, dan identitas visual
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* ========================================================================= */}
        {/* 1. LOGO & BRANDING SEKOLAH */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>1. Logo Resmi & Identitas Visual</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Logo ini akan ditampilkan di bilah navigasi atas (Header), bagian bawah (Footer), SKL, dan panel Admin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Dual Preview (Light Canvas & Dark Canvas) */}
            <div className="lg:col-span-5 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pratinjau Logo Sekolah
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Light Mode Preview (Header) */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Di Latar Terang</span>
                  </div>
                  <div className="w-24 h-24 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Pratinjau Logo Terang"
                        className="w-full h-full object-contain drop-shadow-xs"
                      />
                    ) : (
                      <span className="font-black text-sky-600 text-2xl">53</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Header & Halaman</span>
                </div>

                {/* Dark Mode Preview (Footer / Dark Bar) */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-900 shadow-2xs space-y-2 text-white">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Moon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Di Latar Gelap</span>
                  </div>
                  <div className="w-24 h-24 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-2 overflow-hidden backdrop-blur-xs">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Pratinjau Logo Gelap"
                        className="w-full h-full object-contain drop-shadow-xs"
                      />
                    ) : (
                      <span className="font-black text-white text-2xl">53</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">Footer Sekolah</span>
                </div>
              </div>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 py-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Logo (Gunakan Ikon Bawaan)</span>
                </button>
              )}
            </div>

            {/* Right: Upload & URL Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Cara Mengubah Logo
                </label>

                <div className="flex flex-wrap gap-2.5">
                  {/* File Upload Button */}
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleUploadLogoFile}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>{isUploadingLogo ? 'Mengunggah...' : 'Unggah dari Komputer'}</span>
                  </button>

                  {/* Media Library Picker */}
                  <button
                    type="button"
                    onClick={() => setActiveMediaTarget('logo')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                    <span>Pilih dari Media Library</span>
                  </button>
                </div>
              </div>

              {/* Direct URL Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Atau Masukkan Tautan URL Logo Langsung:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo-sdn53.png"
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                  {logoUrl && (
                    <a
                      href={logoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500"
                      title="Buka URL di tab baru"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Guidelines / Recommendation */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span>Tips Format Logo Terbaik:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Gunakan gambar format <strong>PNG transparan</strong> atau <strong>SVG</strong> dengan resolusi minimal{' '}
                  <strong>200x200 px</strong> agar lambang sekolah tajam dan berpadu sempurna baik di latar terang maupun gelap.
                </p>
              </div>

              {/* Favicon Browser */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Favicon Tab Browser
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={faviconFileInputRef}
                      onChange={handleUploadFaviconFile}
                      accept="image/x-icon,image/png,image/svg+xml"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => faviconFileInputRef.current?.click()}
                      disabled={isUploadingFavicon}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      {isUploadingFavicon ? 'Mengunggah...' : 'Unggah File'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTarget('favicon')}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      Pilih Media
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="/favicon.ico atau tautan gambar icon..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. LATAR BELAKANG WEBSITE (WEBSITE BACKGROUND) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>2. Kustomisasi Latar Belakang Website Publik</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan warna, gradien modern, pola tekstur geometris, atau gambar kustom untuk latar belakang seluruh website
            </p>
          </div>

          {/* Background Type Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {[
              { id: 'none', label: 'Default Bersih', desc: 'Slate netral' },
              { id: 'color', label: 'Warna Solid', desc: 'Warna pilihan' },
              { id: 'gradient', label: 'Gradien Halus', desc: 'Gradasi modern' },
              { id: 'pattern', label: 'Pola Tekstur', desc: 'Grid & motif' },
              { id: 'image', label: 'Gambar Kustom', desc: 'Foto wallpaper' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setBgType(tab.id as any);
                  if (tab.id === 'color' && (!bgValue || bgValue.startsWith('linear') || bgValue.startsWith('http'))) {
                    setBgValue('#f8fafc');
                  } else if (tab.id === 'gradient' && !bgValue.startsWith('linear')) {
                    setBgValue(PRESET_GRADIENTS[0].value);
                  } else if (tab.id === 'pattern' && !bgPattern) {
                    setBgPattern('grid');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-center transition-all cursor-pointer ${
                  bgType === tab.id
                    ? 'bg-white text-sky-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
                }`}
              >
                <div className="text-xs">{tab.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* TAB 1: DEFAULT BERSIH */}
          {bgType === 'none' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-800">Latar Belakang Bawaan (Default Clean Slate):</p>
              <p className="text-slate-500 leading-relaxed">
                Website akan menggunakan nuansa latar belakang minimalis modern khas institusi pendidikan (
                <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px]">#f8fafc</code>
                ). Pilihan ini memberikan kontras maksimal dan tingkat kenyamanan membaca yang optimal bagi siswa dan orang tua.
              </p>
            </div>
          )}

          {/* TAB 2: WARNA SOLID */}
          {bgType === 'color' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Preset Warna Edukatif Populer:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBgValue(color.value)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                        bgValue === color.value
                          ? 'border-sky-600 ring-2 ring-sky-600/20 bg-sky-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-sky-300 bg-white'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-[11px] font-semibold text-slate-800 line-clamp-1">{color.name}</span>
                      <span className="text-[9px] font-mono text-slate-400">{color.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hex Color Picker */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Warna Kustom:</label>
                  <input
                    type="color"
                    value={bgValue && bgValue.startsWith('#') ? bgValue : '#f8fafc'}
                    onChange={(e) => setBgValue(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={bgValue}
                    onChange={(e) => setBgValue(e.target.value)}
                    placeholder="#f8fafc"
                    className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono uppercase font-bold"
                  />
                </div>
                <span className="text-xs text-slate-500">
                  Gunakan warna terang atau netral agar teks website tetap kontras dan nyaman dibaca.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: GRADIEN HALUS */}
          {bgType === 'gradient' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Gradien Modern yang Direkomendasikan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PRESET_GRADIENTS.map((grad) => (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => setBgValue(grad.value)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2.5 ${
                        bgValue === grad.value
                          ? 'border-sky-600 ring-2 ring-sky-600/30 bg-sky-50/20 shadow-md'
                          : 'border-slate-200 hover:border-sky-300 bg-white hover:shadow-xs'
                      }`}
                    >
                      <div
                        className="w-full h-14 rounded-xl border border-slate-200 shadow-inner"
                        style={{ backgroundImage: grad.value }}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{grad.name}</div>
                        <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{grad.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom CSS Gradient input */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Kode CSS Gradien Kustom:</label>
                <input
                  type="text"
                  value={bgValue}
                  onChange={(e) => setBgValue(e.target.value)}
                  placeholder="linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                />
              </div>
            </div>
          )}

          {/* TAB 4: POLA TEKSTUR */}
          {bgType === 'pattern' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Gaya Pola Geometris:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_PATTERNS.map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => {
                        setBgPattern(pat.id);
                        setBgValue(pat.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2.5 ${
                        bgPattern === pat.id
                          ? 'border-sky-600 ring-2 ring-sky-600/30 bg-sky-50/20 shadow-md'
                          : 'border-slate-200 hover:border-sky-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-full h-16 rounded-xl border border-slate-200 bg-slate-50 shadow-inner"
                        style={getBackgroundPatternStyle(pat.id)}
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{pat.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{pat.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-800">Kepekatan Pola: {bgOpacity}%</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan kepekatan lembut (40% - 80%) agar tidak mendistraksi pembacaan artikel.
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-60">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <span className="text-xs font-mono font-bold text-slate-700 w-10 text-right">{bgOpacity}%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GAMBAR KUSTOM */}
          {bgType === 'image' && (
            <div className="space-y-6">
              {/* Upload & Select */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Sumber Gambar Latar Belakang
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unggah foto gedung sekolah, lingkungan, atau ornamen visual edukasi
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      type="file"
                      ref={bgFileInputRef}
                      onChange={handleUploadBgImageFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      disabled={isUploadingBgImage}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingBgImage ? 'Mengunggah...' : 'Unggah Foto Latar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMediaTarget('background')}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>Pilih dari Media Library</span>
                    </button>
                  </div>
                </div>

                {/* Image URL input */}
                <div>
                  <input
                    type="text"
                    value={bgValue.startsWith('http') || bgValue.startsWith('/uploads') ? bgValue : ''}
                    onChange={(e) => setBgValue(e.target.value)}
                    placeholder="Atau tempel URL gambar latar: https://..."
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Adjustments: Opacity, Repeat, Attachment, Blur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Opacity */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Transparansi: {bgOpacity}%</label>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <p className="text-[10px] text-slate-400">10% (Sangat tipis) - 100% (Penuh)</p>
                </div>

                {/* Repeat / Mode */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Ukuran / Posisi</label>
                  <select
                    value={bgRepeat}
                    onChange={(e) => setBgRepeat(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="cover">Penuh Layar (Cover)</option>
                    <option value="repeat">Berulang / Tile (Repeat)</option>
                    <option value="contain">Rata Tengah (Contain)</option>
                  </select>
                </div>

                {/* Attachment */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Perilaku Gulir (Scroll)</label>
                  <select
                    value={bgAttachment}
                    onChange={(e) => setBgAttachment(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="fixed">Parallax Statis (Fixed)</option>
                    <option value="scroll">Ikut Gulir (Scroll)</option>
                  </select>
                </div>

                {/* Blur */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Efek Blur Latar</label>
                  <select
                    value={bgBlur}
                    onChange={(e) => setBgBlur(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  >
                    <option value="0">Tidak Ada Blur (Tajam)</option>
                    <option value="2">Blur Halus (2px)</option>
                    <option value="4">Blur Sedang (4px)</option>
                    <option value="8">Blur Tebal (8px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* INTERACTIVE LIVE MINI-MOCKUP PREVIEW */}
          {/* ========================================================================= */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>Simulasi Pratinjau Tampilan di Website Publik</span>
              </label>
              <span className="text-[11px] text-slate-400">Pratinjau Real-Time Sebelum Disimpan</span>
            </div>

            {/* Mockup Frame */}
            <div className="rounded-2xl border border-slate-300/80 shadow-md overflow-hidden relative">
              {/* Browser Window Header */}
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="mx-auto text-[10px] text-slate-400 font-mono bg-slate-900/60 px-3 py-0.5 rounded-md">
                  sdn53kotabengkulu.sch.id
                </div>
              </div>

              {/* Simulated Page Content with Dynamic Background */}
              <div className="relative min-h-[260px] p-6 flex flex-col justify-between overflow-hidden">
                {/* Background Layer */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={getMockupBackgroundStyle()}
                />
                {/* Overlay layer for image type */}
                {bgType === 'image' && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: bgOverlayColor,
                      opacity: Math.max(0, 1 - (bgOpacity / 100) * 0.75),
                    }}
                  />
                )}

                {/* Simulated Header */}
                <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center p-1 shrink-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="font-black text-sky-600 text-xs">53</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 leading-tight">
                        {schoolName || 'SD NEGERI 53 KOTA BENGKULU'}
                      </div>
                      <div className="text-[9px] text-slate-500 line-clamp-1">{tagline}</div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-600">
                    <span className="text-sky-600">Beranda</span>
                    <span>Profil</span>
                    <span>Berita</span>
                    <span>Kelulusan</span>
                  </div>
                </div>

                {/* Floating Content Cards on Chosen Background */}
                <div className="relative z-10 my-4 max-w-lg mx-auto w-full">
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-md space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      <span>Kartu Berita & Informasi Sekolah</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">
                      Prestasi Gemilang Siswa SD Negeri 53 Kota Bengkulu
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Konten teks dan artikel tetap terlihat tajam, kontras, dan nyaman dibaca di atas gaya latar belakang
                      yang Anda tentukan.
                    </p>
                  </div>
                </div>

                {/* Simulated Footer */}
                <div className="relative z-10 bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[10px]">
                  <span>© 2026 {schoolName}</span>
                  <span className="text-slate-400">Kota Bengkulu, Bengkulu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. HERO BANNER BERANDA */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            3. Hero Banner Beranda Utama
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Judul Besar Banner (Hero Heading)
              </label>
              <input
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subjudul Deskriptif
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teks Tombol Aksi (CTA Button)
                </label>
                <input
                  type="text"
                  value={heroButtonText}
                  onChange={(e) => setHeroButtonText(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tujuan Link Tombol (Path)
                </label>
                <input
                  type="text"
                  value={heroButtonLink}
                  onChange={(e) => setHeroButtonLink(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gambar Latar Banner (Hero Image)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroBannerUrl}
                  onChange={(e) => setHeroBannerUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => setActiveMediaTarget('banner')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  Pilih dari Media Library
                </button>
              </div>

              {heroBannerUrl && (
                <div className="mt-3 aspect-[21/9] max-w-md rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={heroBannerUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. PALET WARNA RESMI */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            4. Palet Aksen Warna Resmi Sekolah
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Warna Primer (Primary Accent)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
                <span className="text-xs text-slate-500">Warna tombol & tautan utama</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Warna Sekunder (Secondary Tone)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                />
                <span className="text-xs text-slate-500">Warna footer & aksen kontras</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Pastikan untuk mengklik tombol simpan agar perubahan diterapkan pada website.
          </span>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Tampilan...' : 'Terapkan & Simpan Semua Perubahan'}</span>
          </button>
        </div>
      </form>

      {/* Universal Media Picker Modal */}
      <MediaPickerModal
        isOpen={!!activeMediaTarget}
        onClose={() => setActiveMediaTarget(null)}
        onSelect={handleSelectMedia}
        allowedCategory="image"
        title={
          activeMediaTarget === 'logo'
            ? 'Pilih Logo Sekolah dari Media Library'
            : activeMediaTarget === 'favicon'
            ? 'Pilih Favicon Browser'
            : activeMediaTarget === 'background'
            ? 'Pilih Gambar Latar Belakang Website'
            : 'Pilih Banner Hero Beranda'
        }
      />
    </div>
  );
};
