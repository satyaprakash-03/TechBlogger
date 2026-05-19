import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useCreateBlogMutation, useGetBlogsQuery, useUpdateBlogMutation, useDeleteBlogMutation } from '../redux/slices/blogsApiSlice';
import { useUpdateUserMutation, useUploadImageMutation } from '../redux/slices/usersApiSlice';
import { setCredentials } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { FiPlus, FiList, FiSettings, FiPieChart, FiEye, FiHeart, FiMessageSquare, FiUpload, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { getImageUrl } from '../utils/image';

const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { data: blogs, refetch } = useGetBlogsQuery();
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdatingBlog }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  const [activeTab, setActiveTab] = useState('overview');
  
  // Blog Form State
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', category: 'Web Development', tags: '', coverImage: ''
  });

  const [profileData, setProfileData] = useState({
    name: userInfo?.name || '', 
    email: userInfo?.email || '', 
    avatar: userInfo?.avatar || '', 
    bio: userInfo?.bio || '', 
    password: '',
    socialLinks: {
      twitter:  userInfo?.socialLinks?.twitter  || '',
      github:   userInfo?.socialLinks?.github   || '',
      linkedin: userInfo?.socialLinks?.linkedin || '',
      website:  userInfo?.socialLinks?.website  || '',
    }
  });

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }]
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image', 'video',
    'color', 'background', 'align'
  ];

  const myBlogs = blogs?.filter(b => b.author?._id === userInfo?._id) || [];
  const totalViews = myBlogs.reduce((acc, blog) => acc + (blog.views || 0), 0);
  const totalLikes = myBlogs.reduce((acc, blog) => acc + (blog.likes?.length || 0), 0);

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
      
      if (editingBlogId) {
        await updateBlog({ id: editingBlogId, data: { ...formData, slug, tags: tagsArray } }).unwrap();
        toast.success('Article updated successfully!');
      } else {
        await createBlog({ ...formData, slug, tags: tagsArray }).unwrap();
        toast.success('Article published successfully!');
      }
      
      resetForm();
      setActiveTab('articles');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const resetForm = () => {
    setEditingBlogId(null);
    setFormData({ title: '', excerpt: '', content: '', category: 'Web Development', tags: '', coverImage: '' });
  };

  const handleEditClick = (blog) => {
    setEditingBlogId(blog._id);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      tags: blog.tags && Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      coverImage: blog.coverImage || ''
    });
    setActiveTab('create');
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      try {
        await deleteBlog(id).unwrap();
        toast.success('Article deleted successfully!');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const normalizeUrl = (url) => {
    if (!url || !url.trim()) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...profileData,
        socialLinks: {
          linkedin: normalizeUrl(profileData.socialLinks.linkedin),
          github:   normalizeUrl(profileData.socialLinks.github),
          twitter:  normalizeUrl(profileData.socialLinks.twitter),
          website:  normalizeUrl(profileData.socialLinks.website),
        }
      };
      const res = await updateProfile(dataToSend).unwrap();
      dispatch(setCredentials({ ...res }));
      // Update local profileData with normalized URLs
      setProfileData(prev => ({ ...prev, socialLinks: dataToSend.socialLinks, password: '' }));
      toast.success('Profile updated! Social links will reflect on homepage shortly.');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const uploadFileHandler = async (e, type) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await uploadImage(uploadData).unwrap();
      toast.success(res.message);
      if (type === 'avatar') {
        setProfileData(prev => ({ ...prev, avatar: res.image }));
      } else if (type === 'coverImage') {
        setFormData(prev => ({ ...prev, coverImage: res.image }));
      }
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (!userInfo) return <div className="text-center py-20 text-zinc-900 dark:text-white">Please log in to access dashboard.</div>;

  return (
    <div className="container mx-auto px-6 md:px-12 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900/40 p-6 sticky top-24 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-3xl backdrop-blur-xl">
            <div className="flex flex-col items-center border-b border-zinc-200 dark:border-zinc-800/60 pb-8 mb-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl"></div>
              <img src={getImageUrl(userInfo.avatar)} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-md mb-4 object-cover relative z-10" />
              <h3 className="text-zinc-900 dark:text-white font-bold text-xl">{userInfo.name}</h3>
              <p className="text-violet-600 dark:text-violet-400 text-sm font-medium capitalize mt-1">{userInfo.role}</p>
            </div>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
              >
                <FiPieChart size={18} /> Overview
              </button>
              <button 
                onClick={() => setActiveTab('articles')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'articles' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
              >
                <FiList size={18} /> My Articles
              </button>
              <button 
                onClick={() => { resetForm(); setActiveTab('create'); }}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'create' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
              >
                <FiPlus size={18} /> {editingBlogId ? 'Edit Article' : 'Write Article'}
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
              >
                <FiSettings size={18} /> Profile Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">Welcome back, {userInfo.name.split(' ')[0]}!</h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Here is what's happening with your articles today.</p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900/40 p-6 flex items-center gap-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all shadow-sm hover:shadow-md">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FiList size={24} />
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Articles</p>
                    <h4 className="text-3xl font-bold text-zinc-900 dark:text-white">{myBlogs.length}</h4>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900/40 p-6 flex items-center gap-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all shadow-sm hover:shadow-md">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <FiEye size={24} />
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Views</p>
                    <h4 className="text-3xl font-bold text-zinc-900 dark:text-white">{totalViews}</h4>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900/40 p-6 flex items-center gap-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all shadow-sm hover:shadow-md">
                  <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <FiHeart size={24} />
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">Total Likes</p>
                    <h4 className="text-3xl font-bold text-zinc-900 dark:text-white">{totalLikes}</h4>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mt-8">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Recent Articles</h3>
                {myBlogs.slice(0, 3).map(blog => (
                  <div key={blog._id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl mb-3 border border-zinc-100 dark:border-zinc-700/50">
                    <div className="flex items-center gap-4">
                      <img src={getImageUrl(blog.coverImage)} className="w-16 h-16 rounded-xl object-cover" alt="cover" />
                      <div>
                        <h4 className="text-zinc-900 dark:text-white font-semibold line-clamp-1">{blog.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{format(new Date(blog.createdAt), 'MMM dd, yyyy')} • {blog.views} views</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">Published</span>
                  </div>
                ))}
                {myBlogs.length === 0 && <p className="text-zinc-500 dark:text-zinc-400 text-sm">No articles published yet.</p>}
              </div>
            </motion.div>
          )}

          {activeTab === 'articles' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">My Articles</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage, edit or delete your published pieces.</p>
                </div>
                <button onClick={() => { resetForm(); setActiveTab('create'); }} className="btn-primary text-sm px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md"><FiPlus /> Write New</button>
              </div>
              
              {myBlogs?.length === 0 ? (
                <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-700 border-dashed">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-zinc-400 dark:text-zinc-500">
                    <FiList size={24} />
                  </div>
                  <h3 className="text-zinc-900 dark:text-white font-semibold mb-2">No Articles Yet</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Start sharing your knowledge with the world.</p>
                  <button onClick={() => setActiveTab('create')} className="btn-secondary rounded-full px-6 text-sm">Create First Article</button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Article Title</th>
                        <th className="px-6 py-4 font-semibold">Category</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Stats</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {myBlogs?.map(blog => (
                        <tr key={blog._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors bg-white dark:bg-transparent">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-zinc-900 dark:text-white line-clamp-1 w-64">{blog.title}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700">{blog.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium"><FiEye className="text-zinc-400 dark:text-zinc-500" /> {blog.views}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button onClick={() => handleEditClick(blog)} className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors mr-4 font-semibold">Edit</button>
                            <button onClick={() => handleDeleteClick(blog._id)} className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-semibold">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{editingBlogId ? 'Edit Article' : 'Write a New Article'}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Share your ideas, tutorials, and insights with the community.</p>
              </div>
              
              <form onSubmit={handleBlogSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Article Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field text-lg py-3 rounded-xl" placeholder="Enter a catchy title..." />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Brief Excerpt</label>
                  <textarea required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="input-field h-24 resize-none rounded-xl" placeholder="A short summary of what this article is about..."></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field rounded-xl cursor-pointer">
                      <option>Web Development</option>
                      <option>Mobile Dev</option>
                      <option>AI & Machine Learning</option>
                      <option>DevOps</option>
                      <option>UI/UX Design</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tags</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="input-field rounded-xl" placeholder="react, nodejs, tutorial (comma separated)" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Cover Image</label>
                  <div className="flex flex-col gap-4">
                    <input type="file" onChange={(e) => uploadFileHandler(e, 'coverImage')} className="block w-full sm:w-auto text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 dark:file:bg-violet-500/10 dark:file:text-violet-400 hover:file:bg-violet-100 dark:hover:file:bg-violet-500/20 transition-colors cursor-pointer" />
                    {formData.coverImage && (
                      <div className="relative w-full max-w-sm h-48 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <img src={getImageUrl(formData.coverImage)} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Article Content</label>
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden focus-within:border-violet-500 dark:focus-within:border-violet-500 transition-colors focus-within:ring-4 focus-within:ring-violet-500/10 quill-dark-theme bg-white dark:bg-zinc-900/50">
                    <ReactQuill 
                      theme="snow"
                      value={formData.content} 
                      onChange={(content) => setFormData({...formData, content})} 
                      modules={modules}
                      formats={formats}
                      placeholder="Write your amazing content here..."
                      className="text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6">
                  <button type="button" onClick={() => { resetForm(); setActiveTab('articles'); }} className="btn-secondary px-6 rounded-full font-bold">Cancel</button>
                  <button type="submit" disabled={isCreating || isUpdatingBlog} className="btn-primary px-8 rounded-full font-bold shadow-md shadow-violet-500/20">
                    {isCreating || isUpdatingBlog ? (editingBlogId ? 'Updating...' : 'Publishing...') : (editingBlogId ? 'Update Article' : 'Publish Article')}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Profile Settings</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Update your personal information and public profile details.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="max-w-2xl space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800/60">
                  <img src={getImageUrl(profileData.avatar || userInfo.avatar)} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-sm object-cover" />
                  <div className="flex-grow w-full space-y-3">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Upload New Avatar</label>
                    <input type="file" onChange={(e) => uploadFileHandler(e, 'avatar')} className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-violet-50 file:text-violet-700 dark:file:bg-violet-500/10 dark:file:text-violet-400 hover:file:bg-violet-100 dark:hover:file:bg-violet-500/20 transition-colors cursor-pointer" />
                    <input type="text" value={profileData.avatar} onChange={e => setProfileData({...profileData, avatar: e.target.value})} className="input-field text-sm rounded-xl" placeholder="Or enter image URL..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
                    <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="input-field rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="input-field rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Short Bio</label>
                  <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="input-field h-24 resize-none rounded-xl" placeholder="Tell the community a little about yourself..."></textarea>
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/60">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Social Links</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Ye links Top Writers section mein aapke card pe dikhenge.</p>
                  </div>
                  <div className="space-y-3">
                    {/* LinkedIn */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"><FiLinkedin size={16} /></div>
                      <input
                        type="text"
                        value={profileData.socialLinks.linkedin}
                        onChange={e => setProfileData(prev => ({...prev, socialLinks: {...prev.socialLinks, linkedin: e.target.value}}))}
                        className="input-field rounded-xl pl-9"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    {/* GitHub */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><FiGithub size={16} /></div>
                      <input
                        type="text"
                        value={profileData.socialLinks.github}
                        onChange={e => setProfileData(prev => ({...prev, socialLinks: {...prev.socialLinks, github: e.target.value}}))}
                        className="input-field rounded-xl pl-9"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    {/* Twitter / X */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={profileData.socialLinks.twitter}
                        onChange={e => setProfileData(prev => ({...prev, socialLinks: {...prev.socialLinks, twitter: e.target.value}}))}
                        className="input-field rounded-xl pl-9"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    {/* Website */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"><FiGlobe size={16} /></div>
                      <input
                        type="text"
                        value={profileData.socialLinks.website}
                        onChange={e => setProfileData(prev => ({...prev, socialLinks: {...prev.socialLinks, website: e.target.value}}))}
                        className="input-field rounded-xl pl-9"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-6 border-t border-zinc-200 dark:border-zinc-800/60">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Change Password</h3>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">New Password <span className="text-zinc-400 font-normal">(leave blank to keep current)</span></label>
                  <input type="password" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} className="input-field rounded-xl" placeholder="••••••••" />
                </div>

                <div className="flex justify-end pt-6">
                  <button type="submit" disabled={isUpdating || isUploading} className="btn-primary px-8 rounded-full font-bold shadow-md shadow-violet-500/20">{isUpdating ? 'Saving Changes...' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
