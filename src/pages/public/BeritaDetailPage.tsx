import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Eye,
  User as UserIcon,
  Tag,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Facebook,
  Twitter,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Post } from '../../types';
import { useToast } from '../../components/common/Toast';

interface BeritaDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const BeritaDetailPage: React.FC<BeritaDetailPageProps> = ({ slug, onNavigate }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.getPostBySlug(slug);
        setPost(res);
        setRelatedPosts(res.related_posts || []);
      } catch (err: any) {
        toast.error('Gagal memuat detail berita: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Tautan berhasil disalin ke papan klip!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${post?.title} - Baca selengkapnya di: ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${post?.title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
        <p className="text-sm">Memuat artikel berita...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Berita Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">Artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
        <button
          onClick={() => onNavigate('/berita')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Berita</span>
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/berita')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Warta Berita</span>
      </button>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-extrabold uppercase tracking-wider">
            {post.category_name}
          </span>
          {post.is_featured && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
              Unggulan
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
          {post.title}
        </h1>

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <UserIcon className="w-3.5 h-3.5 text-sky-600" />
              {post.author_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(post.published_at || post.created_at).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Dilihat {post.views} kali
            </span>
          </div>

          {/* Social Share Buttons (Top) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
              title="Bagikan ke WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareFacebook}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
              title="Bagikan ke Facebook"
            >
              <Facebook className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareTwitter}
              className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-colors"
              title="Bagikan ke Twitter / X"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Salin Tautan"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      {post.cover_image && (
        <figure className="rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </figure>
      )}

      {/* Summary highlight */}
      {post.summary && (
        <div className="bg-sky-50/70 border-l-4 border-sky-600 p-4 sm:p-5 rounded-r-2xl text-sm font-medium text-sky-950 leading-relaxed italic">
          {post.summary}
        </div>
      )}

      {/* Main Rich Content */}
      <div
        className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base pt-2"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Bottom Share & Tags Section */}
      <div className="pt-8 border-t border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Bagikan Berita Ini</h4>
            <p className="text-xs text-slate-500 mt-0.5">Sebarkan informasi resmi kegiatan sekolah kepada wali murid dan masyarakat.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleShareFacebook}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related News */}
      {relatedPosts.length > 0 && (
        <div className="pt-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-bold text-slate-900">Berita Terkait Lainnya</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onNavigate(`/berita/${rel.slug}`)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group flex flex-col"
              >
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={rel.cover_image}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    {new Date(rel.published_at || rel.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
