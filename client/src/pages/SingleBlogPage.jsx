import { useParams, Link } from 'react-router-dom';
import { 
  useGetBlogDetailsQuery, 
  useGetBlogsQuery, 
  useLikeBlogMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation
} from '../redux/slices/blogsApiSlice';
import { useSelector } from 'react-redux';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { getImageUrl, handleImgError } from '../utils/image';
import {
  FiArrowLeft, FiClock, FiEye, FiHeart, FiBookmark,
  FiTwitter, FiGithub, FiLinkedin, FiCopy, FiCheck, FiList,
  FiChevronRight, FiArrowRight, FiCalendar, FiTrash2
} from 'react-icons/fi';

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

export default function SingleBlogPage() {
  const { id } = useParams();
  const { data: blog, isLoading, error } = useGetBlogDetailsQuery(id);
  const { data: allBlogs } = useGetBlogsQuery();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const { userInfo } = useSelector((state) => state.auth);
  const [likeBlog] = useLikeBlogMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [likeComment] = useLikeCommentMutation();

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tocItems, setTocItems] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const contentRef = useRef(null);

  const rt = readingTime(blog?.content);
  const isLiked = blog && userInfo && blog.likes?.includes(userInfo._id);

  const handleLike = async () => {
    if (!userInfo) return;
    try {
      await likeBlog(id).unwrap();
    } catch (err) {
      console.error('Failed to like blog:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    try {
      await addComment({ blogId: id, content: commentContent.trim() }).unwrap();
      setCommentContent('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!userInfo) return;
    try {
      await likeComment({ blogId: id, commentId }).unwrap();
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment({ blogId: id, commentId }).unwrap();
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  const formatCommentDate = (dateString) => {
    if (!dateString) return 'just now';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'just now';
    try {
      return formatDistanceToNow(d) + ' ago';
    } catch (e) {
      return 'just now';
    }
  };

  useEffect(() => {
    if (blog?.content && contentRef.current) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(blog.content, 'text/html');
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));
      setTocItems(headings.map((h, i) => ({ id: `h-${i}`, text: h.textContent, level: parseInt(h.tagName[1]) })));
      
      const elements = contentRef.current.querySelectorAll('h1, h2, h3');
      elements.forEach((h, i) => { h.id = `h-${i}`; });
    }
  }, [blog]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); }),
      { rootMargin: '-15% 0px -70% 0px' }
    );
    if (contentRef.current) {
      contentRef.current.querySelectorAll('h1, h2, h3').forEach(h => obs.observe(h));
    }
    return () => obs.disconnect();
  }, [blog, contentRef.current]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const related = allBlogs?.filter(b => b._id !== id && b.category === blog?.category).slice(0, 3);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 text-sm font-medium">Loading article...</p>
    </div>
  );

  if (error || !blog) return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 max-w-md shadow-sm">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Article not found</h3>
        <p className="text-zinc-500 text-sm mb-8">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/blogs" className="btn-primary w-full justify-center">Browse Articles</Link>
      </div>
    </div>
  );

  return (
    <article className="min-h-screen pb-24 bg-white dark:bg-zinc-950">
      {/* Reading Progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-violet-600 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="container mx-auto px-4 lg:px-8 pt-20 md:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6">
              <FiArrowLeft size={16} /> Back to Articles
            </Link>

            <header className="mb-8">
              {/* DevBlogger Style Title */}
              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold mb-6 leading-tight text-gray-900 dark:text-white">
                {blog.title}
              </h1>

              {/* Cover Image */}
              {blog.coverImage && (
                <div className="relative w-full aspect-video mb-6 md:mb-8 rounded-xl overflow-hidden shadow-sm">
                  <img src={getImageUrl(blog.coverImage)} alt={blog.title} className="w-full h-full object-cover" loading="eager" />
                </div>
              )}

              {/* DevBlogger Metadata Grid */}
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 font-medium">
                  <FiCalendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <time dateTime={blog.createdAt}>{formatDate(blog.createdAt, 'MMMM d, yyyy')}</time>
                </div>
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 font-medium">
                  <FiClock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{rt} mins read</span>
                </div>
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 font-medium">
                  <FiHeart className={`w-4 h-4 mr-2 flex-shrink-0 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{blog.likes?.length || 0} Likes</span>
                </div>
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 font-medium">
                  <FiEye className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{blog.views?.toLocaleString() || 0} Views</span>
                </div>
              </div>
            </header>

            {/* Main Article Content */}
            <div ref={contentRef} className="blog-content quill-content" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* Tags and Action Bottom */}
            <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                {blog.tags?.map(t => (
                  <Link key={t} to={`/blogs?search=${t}`}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-all">
                    #{t}
                  </Link>
                ))}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleLike} 
                  disabled={!userInfo}
                  className={`btn-secondary !px-4 ${isLiked ? '!border-pink-500 !text-pink-600' : ''}`}
                  title={!userInfo ? "Log in to like this blog" : ""}
                >
                  <FiHeart className={isLiked ? 'fill-current text-pink-500' : ''} /> {isLiked ? 'Liked' : 'Like'}
                </button>
                <button onClick={copyLink} className="btn-secondary !px-4">
                  {copied ? <FiCheck className="text-green-500" /> : <FiCopy />} {copied ? 'Copied' : 'Share'}
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                Comments <span className="bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-sm py-0.5 px-2.5 rounded-full">{blog.comments?.length || 0}</span>
              </h3>

              {/* Comment Input */}
              {userInfo ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-4 mb-10">
                  <img 
                    src={getImageUrl(userInfo.avatar, userInfo.name)} 
                    onError={handleImgError(userInfo.name)}
                    alt={userInfo.name} 
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0" 
                  />
                  <div className="flex-grow">
                    <textarea 
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Write a comment..." 
                      className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none transition-all"
                      rows="3"
                    ></textarea>
                    <div className="flex justify-end mt-3">
                      <button 
                        type="submit" 
                        disabled={isAddingComment || !commentContent.trim()}
                        className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        {isAddingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center mb-10">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">Join the conversation! Log in to write a comment.</p>
                  <Link 
                    to={`/login?redirect=/blogs/${id}`} 
                    className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    Log In to Comment
                  </Link>
                </div>
              )}

              {/* Comments List (Dynamic UI) */}
              <div className="space-y-8">
                {blog.comments && blog.comments.length > 0 ? (
                  blog.comments.map((comment) => {
                    const isCommentLiked = userInfo && comment.likes?.includes(userInfo._id);
                    const canDelete = userInfo && (
                      comment.user?._id === userInfo._id ||
                      blog.author?._id === userInfo._id ||
                      userInfo.role === 'admin'
                    );

                    return (
                      <div key={comment._id} className="flex gap-4 group">
                        <img 
                          src={getImageUrl(comment.user?.avatar, comment.user?.name)} 
                          onError={handleImgError(comment.user?.name)}
                          alt={comment.user?.name || 'User'} 
                          className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0" 
                        />
                        <div className="flex-grow">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <div className="flex items-baseline gap-2">
                              <h4 className="font-bold text-gray-900 dark:text-white">{comment.user?.name || 'Deleted User'}</h4>
                              <span className="text-xs text-zinc-500">{formatCommentDate(comment.createdAt)}</span>
                            </div>
                            {canDelete && (
                              <button 
                                onClick={() => handleCommentDelete(comment._id)} 
                                className="text-xs font-medium text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                title="Delete comment"
                              >
                                <FiTrash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <button 
                              onClick={() => handleCommentLike(comment._id)}
                              disabled={!userInfo}
                              className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                                isCommentLiked 
                                  ? 'text-pink-500 hover:text-pink-600' 
                                  : 'text-zinc-500 hover:text-pink-500'
                              }`}
                              title={!userInfo ? "Log in to like comment" : ""}
                            >
                              <FiHeart size={12} className={isCommentLiked ? 'fill-current' : ''} /> {comment.likes?.length || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500 text-center py-6">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </div>

            {/* Related Articles */}
            {related?.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Read next</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {related.slice(0, 2).map(rb => (
                    <Link key={rb._id} to={`/blogs/${rb._id}`}
                      className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img src={getImageUrl(rb.coverImage)} alt={rb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">{rb.title}</h4>
                        <div className="mt-auto flex items-center justify-between text-sm text-zinc-500">
                          <span className="flex items-center gap-1.5"><FiClock size={14} /> {readingTime(rb.content)} min</span>
                          <span className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">Read <FiArrowRight size={14} /></span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              
              {/* Author Card */}
              <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={getImageUrl(blog.author?.avatar, blog.author?.name)} onError={handleImgError(blog.author?.name)} alt={blog.author?.name} className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{blog.author?.name}</h3>
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">{blog.author?.designation || 'Author'}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-5">
                  {blog.author?.bio || 'A passionate developer sharing knowledge and insights with the community. Writing about modern web technologies.'}
                </p>
                <div className="flex gap-2">
                  {blog.author?.socialLinks?.twitter && (
                    <a href={blog.author.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-[#1DA1F2] transition-colors">
                      <FiTwitter size={14} />
                    </a>
                  )}
                  {blog.author?.socialLinks?.github && (
                    <a href={blog.author.socialLinks.github} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      <FiGithub size={14} />
                    </a>
                  )}
                  {blog.author?.socialLinks?.linkedin && (
                    <a href={blog.author.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-[#0A66C2] transition-colors">
                      <FiLinkedin size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Table of Contents */}
              {tocItems.length > 0 && (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiList className="text-violet-600" /> Table of Contents
                  </h4>
                  <nav className="space-y-1 border-l-2 border-zinc-100 dark:border-zinc-800/80">
                    {tocItems.map(item => (
                      <a key={item.id} href={`#${item.id}`}
                        className={`block text-sm py-1.5 pr-3 transition-all duration-200 ${
                          activeId === item.id
                            ? 'text-violet-600 dark:text-violet-400 font-semibold border-l-2 border-violet-600 dark:border-violet-400 -ml-[2px] pl-4'
                            : 'text-zinc-500 hover:text-gray-900 dark:hover:text-white border-l-2 border-transparent pl-4'
                        } ${item.level === 2 ? 'pl-4' : item.level === 3 ? 'pl-8' : ''}`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Floating Action Box (optional, devblogger style) */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                 <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Share Article</h4>
                 <div className="flex flex-col gap-3">
                   <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-semibold transition-colors">
                     {copied ? <FiCheck className="text-green-500" /> : <FiCopy />} {copied ? 'Copied to clipboard' : 'Copy Link'}
                   </button>
                   <button onClick={() => setSaved(!saved)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${saved ? 'border-violet-500 text-violet-600 bg-violet-50 dark:bg-violet-500/10' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>
                     <FiBookmark className={saved ? 'fill-current' : ''} /> {saved ? 'Saved for later' : 'Save Article'}
                   </button>
                 </div>
              </div>

            </div>
          </aside>
          
        </div>
      </div>
    </article>
  );
}
