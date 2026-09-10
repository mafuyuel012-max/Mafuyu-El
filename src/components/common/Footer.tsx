import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Award,
  ArrowUp,
  MessageCircle,
} from 'lucide-react';
import { useSettings } from '../../lib/settings-context';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-auto border-t border-slate-800">
      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings?.logo && (
                <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={settings.logo}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight">
                  {settings?.school_name || 'SD NEGERI 53 KOTA BENGKULU'}
                </h3>
                <p className="text-xs text-sky-400 font-medium">Kota Bengkulu, Provinsi Bengkulu</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              {settings?.description ||
                'Sekolah ramah anak berwawasan lingkungan hidup (Adiwiyata) dengan komitmen membangun generasi beriman, cerdas, dan berkarakter unggul.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-sky-400">
                <Award className="w-3.5 h-3.5" />
                Akreditasi: {settings?.akreditasi || 'A (Unggul)'}
              </span>
              <span className="text-xs text-slate-500 font-medium">NPSN: {settings?.npsn || '10702672'}</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Tautan Cepat</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors text-left"
                >
                  Beranda Sekolah
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/profil')}
                  className="hover:text-white transition-colors text-left"
                >
                  Profil, Visi & Misi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/berita')}
                  className="hover:text-white transition-colors text-left"
                >
                  Warta & Berita Kegiatan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/pengumuman')}
                  className="hover:text-white transition-colors text-left"
                >
                  Pengumuman Resmi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/galeri')}
                  className="hover:text-white transition-colors text-left"
                >
                  Dokumentasi & Galeri
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/download')}
                  className="hover:text-white transition-colors text-left"
                >
                  Pusat Unduhan / Formulir
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/kelulusan')}
                  className="text-sky-400 hover:text-sky-300 transition-colors font-semibold text-left"
                >
                  Portal Cek Kelulusan Siswa
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Address */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Kontak Sekolah</h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  {settings?.address || 'Jl. Merapi Raya No. 53, Kebun Tebeng, Ratu Agung, Kota Bengkulu'}
                </span>
              </div>
              {settings?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:text-white">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings?.whatsapp && (
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`https://wa.me/62${settings.whatsapp.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-300 text-emerald-400 font-medium"
                  >
                    WhatsApp: {settings.whatsapp}
                  </a>
                </div>
              )}
              {settings?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Social Media & Hours */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Media Sosial</h4>
            <p className="text-xs text-slate-400">
              Ikuti akun resmi sekolah untuk pembaruan kegiatan harian dan pengumuman terbaru:
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sky-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings?.tiktok && (
                <a
                  href={settings.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="TikTok"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-500">Jam Operasional Pelayanan:</span>
              <p className="text-slate-300 font-medium mt-0.5">Senin - Jumat: 07.15 - 14.30 WIB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-5 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left">
            {settings?.copyright ||
              `Â© ${new Date().getFullYear()} SD Negeri 53 Kota Bengkulu. Seluruh Hak Cipta Dilindungi.`}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/admin/login')}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Portal Administrator
            </button>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <span>Ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
