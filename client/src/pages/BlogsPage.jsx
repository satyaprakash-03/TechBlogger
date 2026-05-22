import { Link } from 'react-router-dom';
import { useGetBlogsQuery } from '../redux/slices/blogsApiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiClock, FiEye, FiArrowRight, FiChevronDown,
  FiGrid, FiList, FiFilter, FiTrendingUp, FiX
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { getImageUrl, handleImgError } from '../utils/image';

const readingTime = (content) => {
  const words = content?.replace(/<[^>]+>/g, '').split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
};

const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return format(d, formatStr);
};

const CATEGORIES = ['All', 'Web Development', 'Mobile Dev', 'AI & Machine Learning', 'Data Science', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'Cybersecurity', 'Blockchain', 'Game Development', 'Software Engineering', 'Embedded Systems'];

export default function BlogsPage() {
  const { data: blogs, isLoading, error } = useGetBlogsQuery();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [visible, setVisible] = useState(9);
  const [view, setView] = useState('grid');

  const allTags = useMemo(() => {
    if (!blogs) return [];
    const freq = {};
    blogs.forEach(b => b.tags?.forEach(t => { freq[t] = (freq[t] || 0) + 1; }));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t);
  }, [blogs]);

  const processed = useMemo(() => {
    if (!blogs) return [];
    return blogs
      .filter(b => {
        const s = search.toLowerCase();
        return (
          (!s || b.title.toLowerCase().includes(s) || b.excerpt?.toLowerCase().includes(s) || b.tags?.some(t => t.toLowerCase().includes(s))) &&
          (category === 'All' || b.category === category)
        );
      })
      .sort((a, b) => {
        if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        return (b.views || 0) - (a.views || 0);
      });
  }, [blogs, search, category, sort]);

  const featured = !search && category === 'All' ? processed[0] : null;
  const rest = featured ? processed.slice(1) : processed;
  const hasMore = visible < rest.length;
  const isFiltered = search || category !== 'All';

  return (
    <div className="min-h-screen">

      {/* Page Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/60 pt-24 pb-10 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FiTrendingUp size={12} /> Developer Articles
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
              Explore <span className="gradient-text">Articles</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base">Tutorials, guides & insights from the developer community.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">

        {/* Featured Blog */}
        {featured && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <Link to={`/blogs/${featured._id}`}
              className="group flex flex-col md:flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 rounded-2xl overflow-hidden transition-all duration-300"
            >
              <div className="relative md:w-2/5 h-56 md:h-auto overflow-hidden">
                <img src={getImageUrl(featured.coverImage)} alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/40 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent md:hidden" />
                <span className="absolute top-4 left-4 badge badge-violet">Featured</span>
              </div>
              <div className="md:w-3/5 p-7 md:p-10 flex flex-col justify-center">
                <span className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-3">{featured.category}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 leading-tight group-hover:text-violet-400 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center justify-between mt-auto border-t border-zinc-200 dark:border-zinc-800 pt-5">
                  <div className="flex items-center gap-2.5">
                    <img src={getImageUrl(featured.author?.avatar, featured.author?.name)} onError={handleImgError(featured.author?.name)} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{featured.author?.name}</p>
                      <p className="text-xs text-zinc-600">{formatDate(featured.createdAt, 'MMM dd, yyyy')} · {readingTime(featured.content)} min read</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-violet-400 text-sm font-semibold group-hover:gap-2.5 transition-all">
                    Read <FiArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Filters */}
        <div className="sticky top-16 z-40 bg-slate-100 dark:bg-zinc-950/90 py-4 mb-8 -mx-5 md:-mx-8 px-5 md:px-8 border-y border-zinc-200 dark:border-zinc-800/60">
          <div className="flex flex-col gap-3">
            {/* Row 1: Search + Sort + View */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400" size={15} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-600 dark:text-zinc-300">
                    <FiX size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 cursor-pointer">
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                  <option value="oldest">Oldest</option>
                </select>
                <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => setView('grid')}
                    className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-violet-600 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-200'}`}>
                    <FiGrid size={15} />
                  </button>
                  <button onClick={() => setView('list')}
                    className={`p-2.5 transition-colors ${view === 'list' ? 'bg-violet-600 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-200'}`}>
                    <FiList size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Category + Tags */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <FiFilter size={13} className="text-zinc-600 shrink-0" />
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    category === cat
                      ? 'bg-violet-600 text-zinc-900 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700'
                  }`}>
                  {cat}
                </button>
              ))}
              {allTags.length > 0 && <div className="w-px h-4 bg-zinc-100 dark:bg-zinc-800 mx-1 shrink-0" />}
              {allTags.map(tag => (
                <button key={tag} onClick={() => setSearch(tag)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 hover:text-violet-400 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 hover:border-violet-500/30 transition-all">
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{Math.min(visible, rest.length)}</span> of{' '}
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{rest.length}</span> articles
              {search && <> for "<span className="text-violet-400">{search}</span>"</>}
            </p>
            {isFiltered && (
              <button onClick={() => { setSearch(''); setCategory('All'); }} className="text-xs text-zinc-600 hover:text-violet-400 transition-colors flex items-center gap-1">
                <FiX size={12} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, n) => (
              <div key={n} className="h-80 bg-zinc-100 dark:bg-zinc-800/40 rounded-2xl animate-pulse border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Failed to load articles.</p>
          </div>
        ) : rest.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed">
            <FiSearch size={36} className="text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-600 dark:text-zinc-300 mb-2">No articles found</h3>
            <p className="text-zinc-600 text-sm mb-6">Try different keywords or browse all articles.</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn-primary">Clear Filters</button>
          </div>
        ) : view === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {rest.slice(0, visible).map((blog, i) => (
                  <motion.article key={blog._id} layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: (i % 9) * 0.04 }}
                    className="card card-hover flex flex-col overflow-hidden group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={getImageUrl(blog.coverImage)} alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
                      <span className="absolute top-3 left-3 badge badge-violet text-[9px] px-2">{blog.category}</span>
                      <span className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-300 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                        <FiClock size={9} /> {readingTime(blog.content)} min
                      </span>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      {blog.tags?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mb-2.5">
                          {blog.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[10px] text-zinc-600 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded font-medium">#{t}</span>
                          ))}
                        </div>
                      )}
                      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors leading-snug">
                        <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 flex-grow leading-relaxed">{blog.excerpt}</p>
                      <div className="flex items-center justify-between pt-3.5 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <img src={getImageUrl(blog.author?.avatar, blog.author?.name)} onError={handleImgError(blog.author?.name)} alt="" className="w-6 h-6 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" />
                          <div>
                            <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{blog.author?.name}</p>
                            <p className="text-[9px] text-zinc-600">{formatDate(blog.createdAt, 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px] text-zinc-600">
                          <span className="flex items-center gap-0.5"><FiEye size={9} /> {blog.views}</span>
                          <Link to={`/blogs/${blog._id}`} className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-0.5 transition-colors">
                            Read <FiArrowRight size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button onClick={() => setVisible(v => v + 9)} className="btn-secondary flex items-center gap-2">
                  Load More <FiChevronDown size={15} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* List View */
          <div className="space-y-3">
            <AnimatePresence>
              {rest.slice(0, visible).map((blog, i) => (
                <motion.div key={blog._id} layout
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                >
                  <Link to={`/blogs/${blog._id}`}
                    className="group flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/30 rounded-2xl transition-all duration-200 hover:bg-white dark:bg-zinc-900/80"
                  >
                    <img src={getImageUrl(blog.coverImage)} alt={blog.title}
                      className="w-28 h-20 rounded-xl object-cover flex-shrink-0 group-hover:scale-102 transition-transform" />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge badge-violet text-[9px] px-2 py-0.5">{blog.category}</span>
                        {blog.tags?.slice(0, 1).map(t => (
                          <span key={t} className="text-[9px] text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">#{t}</span>
                        ))}
                      </div>
                      <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 line-clamp-1 mb-1 group-hover:text-violet-400 transition-colors">{blog.title}</h3>
                      <p className="text-xs text-zinc-600 line-clamp-1 mb-2 leading-relaxed">{blog.excerpt}</p>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-600">
                        <div className="flex items-center gap-1.5">
                          <img src={getImageUrl(blog.author?.avatar, blog.author?.name)} onError={handleImgError(blog.author?.name)} alt="" className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 object-cover" />
                          <span className="text-zinc-600 dark:text-zinc-400">{blog.author?.name}</span>
                        </div>
                        <span className="flex items-center gap-0.5"><FiClock size={9} /> {readingTime(blog.content)}m</span>
                        <span className="flex items-center gap-0.5"><FiEye size={9} /> {blog.views}</span>
                        <span>{formatDate(blog.createdAt, 'MMM dd')}</span>
                      </div>
                    </div>
                    <FiArrowRight size={16} className="text-zinc-700 group-hover:text-violet-400 transition-colors self-center ml-2 flex-shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button onClick={() => setVisible(v => v + 9)} className="btn-secondary flex items-center gap-2">
                  Load More <FiChevronDown size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
