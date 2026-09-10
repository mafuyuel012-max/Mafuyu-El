import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Eye,
  ArrowRight,
  TrendingUp,
  Tag,
  Loader2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Post, Category } from '../../types';
import { Pagination } from '../../components/common/Pagination';

interface BeritaPageProps {
  onNavigate: (path: string) => void;
}

export const BeritaPage: React.FC<BeritaPageProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories & popular
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catData, popData] = await Promise.all([
          api.getCategories(),
          api.getPopularPosts(4),
        ]);
        setCategories(catData);
        setPopularPosts(popData);
      } catch (err) {
        console.error('Failed to load news meta:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch posts on filter/page change
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await api.getPosts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 6,
        });
        setPosts(res.data);
        setTotalPages(res.pagination.total_pages);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategory, searchQuery, currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold uppercase tracking-wider">
            Warta Sekolah
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Berita & Artikel SD Negeri 53 Kota Bengkulu
          </h1>
          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
            Informasi terkini mengenai prestasi siswa, inovasi pembelajaran guru, dan kegiatan sekolah sehari-hari.
          </p>
        </div>
      </div>

      {/* Main Grid: Articles + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Articles List & Filters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul berita atau topik..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.slug
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              <p className="text-sm">Memuat berita...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-800">Tidak ada berita yang sesuai</p>
              <p className="text-xs text-slate-400">Silakan ubah kata kunci atau pilih kategori lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onNavigate(`/berita/${post.slug}`)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col cursor-pointer group"
                >
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {post.category_name}
                    </span>
                  </div>

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
                          {post.views || 0} kali
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
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="pt-4"
          />
        </div>

        {/* Right Sidebar: Popular News & Category List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Popular News Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Berita Populer
              </h2>
            </div>

            <div className="space-y-3">
              {popularPosts.map((pop, idx) => (
                <div
                  key={pop.id}
                  onClick={() => onNavigate(`/berita/${pop.slug}`)}
                  className="flex items-start gap-3 cursor-pointer group py-1.5"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-slate-800 group-hover:text-sky-600 line-clamp-2 leading-snug">
                      {pop.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {pop.views} pembaca
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Tag className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Kategori Berita
              </h2>
            </div>

            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setCurrentPage(1);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                >
                  <span>{cat.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {cat.post_count || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
