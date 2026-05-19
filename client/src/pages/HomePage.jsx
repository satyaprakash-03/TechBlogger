import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiArrowRight, FiMonitor, FiSmartphone, FiCpu,
  FiServer, FiPenTool, FiBookOpen, FiTrendingUp, FiClock,
  FiEye, FiZap, FiUsers, FiStar, FiMail, FiLinkedin, FiGithub, FiInstagram, FiGlobe, FiTerminal
} from 'react-icons/fi';
import { useGetBlogsQuery, useGetTopWritersQuery } from '../redux/slices/blogsApiSlice';
import { format } from 'date-fns';
import { useState } from 'react';
import { getImageUrl, handleImgError } from '../utils/image';

const readingTime = (content) => {
  const words = content?.replace(/<[^>]+>/g, '').split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
};

// ── Follow Button Component ──────────────────────────────────────
function FollowButton({ writerId }) {
  const [followed, setFollowed] = useState(false);
  return (
    <button
      onClick={() => setFollowed(f => !f)}
      className={`w-full py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5
        ${followed
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600'
          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}
    >
      {followed ? '✓ Following' : '+ Follow'}
    </button>
  );
}


export default function HomePage() {
  const { data: blogs, isLoading } = useGetBlogsQuery();
  const { data: topWriters = [] } = useGetTopWritersQuery();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/blogs?search=${search}`);
  };

  const categories = [
    { name: 'Web Dev', full: 'Web Development', icon: <FiMonitor size={20} />, color: '#3b82f6' },
    { name: 'Mobile', full: 'Mobile Dev', icon: <FiSmartphone size={20} />, color: '#10b981' },
    { name: 'AI / ML', full: 'AI & Machine Learning', icon: <FiCpu size={20} />, color: '#8b5cf6' },
    { name: 'DevOps', full: 'DevOps', icon: <FiServer size={20} />, color: '#f59e0b' },
    { name: 'UI/UX', full: 'UI/UX Design', icon: <FiPenTool size={20} />, color: '#ec4899' },
    { name: 'Data Science', full: 'Data Science', icon: <FiBookOpen size={20} />, color: '#06b6d4' },
  ];

  const trendingTags = ['React', 'TypeScript', 'Next.js', 'Node.js', 'Docker', 'Python', 'AWS', 'GraphQL', 'Rust', 'Go'];

  const totalViews = blogs?.reduce((a, b) => a + (b.views || 0), 0) || 0;
  const uniqueAuthors = [...new Set(blogs?.map(b => b.author?._id?.toString()))].filter(Boolean).length || 0;

  return (
    <div className="min-h-screen">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-10 pb-20 px-5 md:px-8 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:64px_64px] -z-10" />
        {/* Glow orbs */}
        <div className="absolute top-16 left-1/3 w-[480px] h-[480px] bg-violet-600/8 rounded-full blur-[120px] -z-10" />

        <div className="absolute top-32 right-1/4 w-[320px] h-[320px] bg-pink-600/6 rounded-full blur-[100px] -z-10" />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mb-8 uppercase tracking-widest">
              <FiTerminal size={12} className="animate-pulse" />
              Developer Ecosystem
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6 leading-snug">
              Where Developers Share Knowledge <span className="gradient-text">& Innovation</span>
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
              Join a passionate community of developers to share knowledge, explore modern technologies, collaborate on ideas, and grow together in the ever-evolving world of tech.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" size={17} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search React, System Design, AI..."
                className="w-full py-4 pl-12 pr-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 text-sm transition-all"
              />
              <button type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-500 text-zinc-900 dark:text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                Search
              </button>
            </form>

            {/* Popular Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {trendingTags.map(tag => (
                <Link key={tag} to={`/blogs?search=${tag}`}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-violet-400 bg-white dark:bg-zinc-900 hover:bg-violet-500/8 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/25 rounded-lg transition-all">
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <Link to="/dashboard" className="btn-primary">
                Start Writing <FiPenTool size={14} />
              </Link>
              <Link to="/blogs" className="btn-secondary">
                Explore Articles <FiArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="relative overflow-hidden border-y border-zinc-200 dark:border-zinc-800/60 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 dark:from-zinc-900/60 dark:via-zinc-900/30 dark:to-zinc-900/60">
        {/* subtle glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(124,58,237,0.04),transparent)] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-5 md:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800/60">
            {[
              { icon: <FiBookOpen size={20} />, value: `${blogs?.length || 0}+`, label: 'Articles Published', color: 'text-violet-500', bg: 'bg-violet-500/10', glow: 'group-hover:shadow-violet-500/20' },
              { icon: <FiEye size={20} />, value: `${(totalViews / 1000).toFixed(0)}K+`, label: 'Total Views', color: 'text-pink-500', bg: 'bg-pink-500/10', glow: 'group-hover:shadow-pink-500/20' },
              { icon: <FiUsers size={20} />, value: `${uniqueAuthors}+`, label: 'Active Writers', color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'group-hover:shadow-emerald-500/20' },
              { icon: <FiStar size={20} />, value: '6', label: 'Categories', color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'group-hover:shadow-blue-500/20' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group flex flex-col items-center gap-3 py-6 px-4 md:px-6 text-center"
              >
                <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shadow-lg ${s.glow} group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  {s.icon}
                </div>
                <div>
                  <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED POSTS ═══════════════ */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Must Read</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">Featured Articles</h2>
          </div>
          <Link to="/blogs" className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-violet-400 transition-colors font-medium">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(n => <div key={n} className="h-80 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl animate-pulse border border-zinc-200 dark:border-zinc-800" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {blogs?.slice(0, 3).map((blog, i) => (
              <motion.article key={blog._id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card card-hover flex flex-col overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={getImageUrl(blog.coverImage)} alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                  <span className="absolute top-3 left-3 badge badge-violet">{blog.category}</span>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  {blog.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {blog.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-medium text-zinc-600 bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded">#{t}</span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-[0.95rem] font-bold text-zinc-800 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors leading-snug">
                    <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5 line-clamp-2 leading-relaxed flex-grow">{blog.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <img src={getImageUrl(blog.author?.avatar, blog.author?.name)} onError={handleImgError(blog.author?.name)} alt="" className="w-7 h-7 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" />
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{blog.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                      <span className="flex items-center gap-1"><FiClock size={9} /> {readingTime(blog.content)}m</span>
                      <span className="flex items-center gap-1"><FiEye size={9} /> {blog.views}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════ CATEGORIES ═══════════════ */}
      <section className="border-y border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/20 py-16 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Browse Topics</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">Explore by Category</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <motion.div key={cat.name}
                initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              >
                <Link to={`/blogs?category=${encodeURIComponent(cat.full)}`}
                  className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-zinc-300 dark:border-zinc-700 transition-all group hover:-translate-y-1 duration-200 text-center"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{ background: `${cat.color}15`, color: cat.color }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-200 transition-colors leading-tight">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TRENDING ═══════════════ */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FiTrendingUp size={12} /> Trending
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">Latest in Tech</h2>
          </div>
          <Link to="/blogs" className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-pink-400 transition-colors font-medium">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {!isLoading && blogs?.length > 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Big card */}
            {blogs[3] && (
              <motion.article
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3 card card-hover overflow-hidden group flex flex-col"
              >
                <div className="relative h-60 overflow-hidden">
                  <img src={getImageUrl(blogs[3].coverImage)} alt={blogs[3].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />
                  <span className="absolute top-4 left-4 badge badge-pink">Trending</span>
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 mb-3">
                    <span>{blogs[3].category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><FiClock size={10} /> {readingTime(blogs[3].content)} min read</span>
                    <span className="flex items-center gap-1"><FiEye size={10} /> {blogs[3].views}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-pink-400 transition-colors">
                    <Link to={`/blogs/${blogs[3]._id}`}>{blogs[3].title}</Link>
                  </h3>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 line-clamp-2 mb-5">{blogs[3].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={getImageUrl(blogs[3].author?.avatar, blogs[3].author?.name)} onError={handleImgError(blogs[3].author?.name)} alt="" className="w-7 h-7 rounded-full border border-zinc-300 dark:border-zinc-700 object-cover" />
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{blogs[3].author?.name}</span>
                    </div>
                    <Link to={`/blogs/${blogs[3]._id}`} className="text-pink-400 text-sm font-semibold hover:text-pink-300 flex items-center gap-1 transition-colors">
                      Read <FiArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            )}

            {/* Side list */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {blogs?.slice(4, 8).map((blog, i) => (
                <motion.div key={blog._id}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                >
                  <Link to={`/blogs/${blog._id}`}
                    className="group flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 rounded-xl transition-all duration-200"
                  >
                    <img src={getImageUrl(blog.coverImage)} alt={blog.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:opacity-90 transition-opacity" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">{blog.category}</span>
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 line-clamp-2 mt-0.5 group-hover:text-violet-400 transition-colors leading-snug">{blog.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-600">
                        <span className="flex items-center gap-0.5"><FiClock size={9} /> {readingTime(blog.content)}m</span>
                        <span className="flex items-center gap-0.5"><FiEye size={9} /> {blog.views}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════ TOP WRITERS ═══════════════ */}
      {!isLoading && topWriters.length > 0 && (
        <section className="border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-[#09090b] py-20 px-5 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FiUsers size={12} /> Community
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">Top Writers</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topWriters.map((writer, i) => {
                const linkedin = writer.socialLinks?.linkedin;
                const github = writer.socialLinks?.github;
                const twitter = writer.socialLinks?.twitter;
                const rawWebsite = writer.socialLinks?.website;
                // Normalize URL — ensure https:// prefix
                const website = rawWebsite
                  ? (rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`)
                  : null;
                const hasSocial = linkedin || github || twitter;

                return (
                  <motion.div key={writer._id}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 group flex flex-col"
                  >
                    {/* Avatar + Rank */}
                    <div className="relative inline-block mb-4 mx-auto">
                      <img src={getImageUrl(writer.avatar, writer.name)} onError={handleImgError(writer.name)} alt={writer.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-zinc-900 shadow-lg group-hover:border-emerald-400 transition-colors" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 text-[10px] font-bold">
                        #{i + 1}
                      </div>
                    </div>

                    {/* Name & Stats */}
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-0.5">{writer.name}</h3>
                    {writer.designation && (
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">{writer.designation}</p>
                    )}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{writer.posts} article{writer.posts !== 1 ? 's' : ''} · {writer.totalViews} views</p>

                    {/* Tags */}
                    {writer.tags.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                        {writer.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] rounded-md font-medium">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Social Icons Row */}
                    {hasSocial && (
                      <div className="flex justify-center gap-3 mb-4">
                        {linkedin && (
                          <a href={linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200">
                            <FiLinkedin size={15} />
                          </a>
                        )}
                        {github && (
                          <a href={github} target="_blank" rel="noopener noreferrer" title="GitHub"
                            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
                            <FiGithub size={15} />
                          </a>
                        )}
                        {twitter && (
                          <a href={twitter} target="_blank" rel="noopener noreferrer" title="Twitter / X"
                            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-sky-500 hover:bg-sky-500/10 transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                    {!hasSocial && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mb-4 italic">No social links added</p>
                    )}

                    {/* ── Bottom CTA buttons ── */}
                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      {/* Follow Button */}
                      <FollowButton writerId={writer._id} />

                      {/* Visit Website — always visible */}
                      <button
                        onClick={() => {
                          if (website) {
                            window.open(website, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        disabled={!website}
                        title={website || 'No website added'}
                        className={`w-full py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5
                        ${website
                            ? 'border border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 cursor-pointer'
                            : 'border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                          }`}
                      >
                        <FiGlobe size={12} />
                        {website ? 'Visit Website' : 'No Website'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ PLATFORM FEATURES (BENTO GRID) ═══════════════ */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Platform Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Built for modern developers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {/* Feature 1 (Spans 2 cols) */}
          <div className="md:col-span-2 relative rounded-[2rem] bg-gradient-to-br from-violet-500/5 to-violet-500/10 dark:from-violet-500/10 dark:to-violet-500/5 border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-violet-500/30 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-violet-500 mb-6 group-hover:scale-110 transition-transform">
                <FiPenTool size={22} />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Rich Markdown Editor</h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
                Write beautiful articles with our distraction-free, powerful markdown editor designed specifically for technical content. Code snippets, tables, and embeds work seamlessly.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="relative rounded-[2rem] bg-gradient-to-br from-pink-500/5 to-pink-500/10 dark:from-pink-500/10 dark:to-pink-500/5 border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 group-hover:bg-pink-500/30 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
                <FiServer size={22} />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Lightning Fast</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Powered by a modern tech stack ensuring your articles load instantly across the globe.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="relative rounded-[2rem] bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/10 dark:to-emerald-500/5 border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 overflow-hidden group">
            <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] -translate-y-1/3 -translate-x-1/4 group-hover:bg-emerald-500/30 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                <FiTrendingUp size={22} />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">SEO Optimized</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Automatically optimized for search engines so your content reaches a wider audience effortlessly.
              </p>
            </div>
          </div>

          {/* Feature 4 (Spans 2 cols) */}
          <div className="md:col-span-2 relative rounded-[2rem] bg-gradient-to-br from-blue-500/5 to-blue-500/10 dark:from-blue-500/10 dark:to-blue-500/5 border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-y-1/3 translate-x-1/3 group-hover:bg-blue-500/30 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <FiUsers size={22} />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Global Community</h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
                Connect with thousands of developers, share insights, and get valuable feedback on your projects and ideas in a supportive environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CONTACT US ═══════════════ */}
      <section id="contact" className="border-t border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-[#09090b] py-24 px-5 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-2 flex justify-center items-center gap-2"><FiMail size={14} /> Get in touch</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Contact Us</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4 max-w-xl mx-auto text-lg">We would love to hear from you. Have a question or want to collaborate?</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: Info */}
            <div className="space-y-10">
              <div className="relative rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 p-8 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/20 transition-colors" />
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 relative z-10">Contact Information</h3>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-violet-500 shrink-0">
                      <FiMail size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">E-mail </p>
                      <a href="mailto:satyaprakash.in33@gmail.com" className="text-base font-bold text-zinc-900 dark:text-white hover:text-violet-500 transition-colors">satyaprakash.in33@gmail.com</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-pink-500 shrink-0">
                      <FiSmartphone size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">Contact No</p>
                      <a href="tel:+916392645782" className="text-base font-bold text-zinc-900 dark:text-white hover:text-pink-500 transition-colors">+91 6392645782</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                      <FiLinkedin size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">LinkedIn</p>
                      <a href="https://linkedin.com/in/satyaprakash-prajapati03" target="_blank" rel="noopener noreferrer" className="text-base font-bold text-zinc-900 dark:text-white hover:text-blue-500 transition-colors">Satyaprakash-03</a>
                    </div>
                  </div><br />

                  {/* Follow Us */}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 relative z-10">Follow Us</h3>
                  <div className="flex items-center gap-4 relative z-10">
                    <a href="https://linkedin.com/in/satyaprakash-prajapati03" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-blue-500 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                      <FiLinkedin size={20} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-pink-500 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
                      <FiInstagram size={20} />
                    </a>
                    <a href="https://github.com/satyaprakash-03" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-zinc-800 dark:text-white hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-500/20 transition-all duration-300">
                      <FiGithub size={20} />
                    </a>
                    <a href="mailto:satyaprakash.in33@gmail.com" aria-label="Email" className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-violet-500 hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300">
                      <FiMail size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white dark:bg-zinc-900/50 p-8 md:p-10 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-black/20">
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for contacting us! We'll get back to you soon."); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">First Name</label>
                    <input type="text" required className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" placeholder="First Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Last Name</label>
                    <input type="text" required className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" placeholder="Last Name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
                  <input type="email" required className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all" placeholder="example@gmail.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Message</label>
                  <textarea required rows="4" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none" placeholder="Your message here..."></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ NEWSLETTER ═══════════════ */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#dce3fc] dark:bg-zinc-800/60 border border-[#c4ccf0] dark:border-zinc-700/50 shadow-sm"
        >
          <div className="relative px-6 py-16 md:py-20 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-[#e8edff] dark:bg-zinc-700 shadow-sm flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <FiPenTool size={26} />
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Stay in the Loop</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Subscribe to our weekly newsletter and get the latest tech articles, job opportunities, and coding tips delivered straight to your inbox.
            </p>

            {subscribed ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 font-medium px-6 py-4 rounded-xl flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">✓</div>
                Thanks for subscribing to our weekly digest!
              </motion.div>
            ) : (
              <div className="w-full max-w-lg mx-auto">
                <form onSubmit={e => { e.preventDefault(); if (email.trim()) { setSubscribed(true); setEmail(''); } }} className="flex flex-col sm:flex-row gap-3">
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" />
                  <button type="submit"
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98] whitespace-nowrap shadow-sm">
                    Subscribe
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
