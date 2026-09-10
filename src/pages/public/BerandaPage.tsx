import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Calendar,
  User as UserIcon,
  Eye,
  GraduationCap,
  Bell,
  Award,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { useSettings } from '../../lib/settings-context';
import { api } from '../../lib/api';
import { Post, Announcement, GalleryItem } from '../../types';

interface BerandaPageProps {
  onNavigate: (path: string) => void;
}

export const BerandaPage: React.FC<BerandaPageProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [urgentAnnouncements, setUrgentAnnouncements] = useState<Announcement[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<GalleryItem[]>([]);
  const [isGraduationActive, setIsGraduationActive] = useState(false);
  const [graduationTitle, setGraduationTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured & latest news
        const featuredRes = await api.getPosts({ featured: true, limit: 2 });
        const latestRes = await api.getPosts({ limit: 4 });
        setFeaturedPosts(featuredRes.data);
        setLatestPosts(latestRes.data);

        // Fetch announcements
        const annRes = await api.getAnnouncements();
        const urgent = annRes.filter((a) => a.priority === 'penting');
        setUrgentAnnouncements(urgent.length > 0 ? urgent : annRes.slice(0, 2));

        // Fetch gallery
        const galRes = await api.getGallery(false);
        setGalleryPreviews(galRes.slice(0, 4));

        // Fetch graduation status
        const gradRes = await api.getGraduationStatus();
        if (gradRes.is_active && gradRes.announcement) {
          setIsGraduationActive(true);
          setGraduationTitle(gradRes.announcement.title);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* 1. HERO / BANNER SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden min-h-[500px] sm:min-h-[580px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              settings?.hero_image ||
              'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&auto=format&fit=crop&q=80'
            }
            alt="SD Negeri 53 Kota Bengkulu"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-900/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Portal Resmi Pendidikan Dasar Unggulan</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {settings?.hero_title || 'Membangun Karakter & Mengukir Prestasi Gemilang'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {settings?.hero_subtitle ||
                'Selamat Datang di SD Negeri 53 Kota Bengkulu. Lembaga pendidikan ramah anak yang membentuk generasi religius, cerdas, berintegritas, dan berwawasan lingkungan hidup.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate(settings?.hero_button_link || '/profil')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition-all hover:translate-y-[-1px]"
              >
                <span>{settings?.hero_button_text || 'Jelajahi Profil Sekolah'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/kelulusan')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-sky-300" />
                <span>Cek Kelulusan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMPORTANT NOTICE / ANNOUNCEMENT BANNER */}
      {urgentAnnouncements.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full -mt-8 sm:-mt-12 relative z-20">
          <div className="bg-amber-500/10 border border-amber-300/40 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Pengumuman Terkini
                </span>
                <h2 className="text-sm font-bold text-slate-900 mt-1">
                  {urgentAnnouncements[0].title}
                </h2>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/pengumuman')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors whitespace-nowrap self-end sm:self-center"
            >
              <span>Selengkapnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE GRADUATION BANNER (JIKA AKTIF) */}
      {isGraduationActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold">
                <GraduationCap className="w-4 h-4" />
                <span>Pengumuman Kelulusan Resmi Aktif</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {graduationTitle || 'Pengumuman Kelulusan Peserta Didik Kelas VI'}
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                Hasil kelulusan telah dipublikasikan. Peserta didik dan wali murid dapat melakukan pengecekan individual menggunakan NISN secara aman dan mencetak Surat Keterangan Lulus (SKL).
              </p>
            </div>

            <button
              onClick={() => onNavigate('/kelulusan')}
              className="px-6 py-3 rounded-xl bg-white text-sky-900 font-bold text-sm hover:bg-sky-50 shadow-md transition-transform hover:scale-105 shrink-0 whitespace-nowrap"
            >
              Cek Status Kelulusan Sekarang â†’
            </button>
          </div>
        </div>
      )}

      {/* 4. SAMBUTAN KEPALA SEKOLAH & PROFIL SINGKAT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Kepala Sekolah Photo Card */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-slate-100 relative group">
              <img
                src={
                  settings?.kepala_sekolah_foto ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
                }
                alt={settings?.kepala_sekolah_nama}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-4">
              {settings?.kepala_sekolah_nama || 'Hj. Rosdiana, S.Pd., M.Pd.'}
            </h3>
            <p className="text-xs text-sky-600 font-semibold mt-0.5">Kepala SD Negeri 53 Kota Bengkulu</p>
          </div>

          {/* Sambutan Text */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600">
              <BookOpen className="w-4 h-4" />
              <span>Sambutan Pimpinan Sekolah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Selamat Datang di Portal Publikasi SD Negeri 53 Kota Bengkulu
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
              {settings?.kepala_sekolah_sambutan?.split('\n\n')[0] ||
                'Assalamuâ€™alaikum Warahmatullahi Wabarakatuh. Puji syukur kami panjatkan ke hadirat Allah SWT, atas karunia dan rahmat-Nya portal resmi publikasi SD Negeri 53 Kota Bengkulu dapat hadir sebagai media informasi, komunikasi, dan publikasi transparansi sekolah.'}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('/profil')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
              >
                <span>Baca Sambutan Lengkap & Profil Sekolah</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUICK STATS & KEUNGGULAN SEKOLAH */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {settings?.akreditasi?.split(' ')[0] || 'A'}
              </div>
              <p className="text-xs text-slate-500 font-medium">Akreditasi Unggul BAN-SM</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">Adiwiyata</div>
              <p className="text-xs text-slate-500 font-medium">Sekolah Berbudaya Lingkungan</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Building className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">18 Kelas</div>
              <p className="text-xs text-slate-500 font-medium">Fasilitas Lengkap & Ramah Anak</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">Prestasi</div>
              <p className="text-xs text-slate-500 font-medium">Juara FLS2N, OSN & O2SN</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BERITA UNGGULAN & TERBARU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Warta & Publikasi Kegiatan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Berita Terbaru SD Negeri 53
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/berita')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 self-start sm:self-auto"
          >
            <span>Lihat Semua Berita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPosts.slice(0, 3).map((post) => (
            <article
              key={post.id}
              onClick={() => onNavigate(`/berita/${post.slug}`)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col cursor-pointer group"
            >
              {/* Thumbnail image */}
              <div className="aspect-video bg-slate-100 overflow-hidden relative">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {post.is_featured && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Unggulan
                  </span>
                )}
                <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                  {post.category_name || 'Umum'}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {post.views || 0}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 line-clamp-2 leading-snug transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600">
                  <span>Baca Selengkapnya</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. DOKUMENTASI & GALERI TERBARU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Dokumentasi Kegiatan
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Galeri Foto & Video Sekolah
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/galeri')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            <span>Semua Galeri</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {galleryPreviews.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('/galeri')}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 cursor-pointer shadow-xs"
            >
              <img
                src={item.media_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <span className="text-[10px] text-sky-300 font-semibold">{item.album}</span>
                <p className="text-xs font-bold text-white line-clamp-1">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
