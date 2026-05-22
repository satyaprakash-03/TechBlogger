import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useCreateBlogMutation, useGetBlogsQuery, useUpdateBlogMutation, useDeleteBlogMutation } from '../redux/slices/blogsApiSlice';
import { useUpdateUserMutation, useUploadImageMutation, useGetUsersQuery, useDeleteUserMutation, useUpdateUserByAdminMutation } from '../redux/slices/usersApiSlice';
import { 
  useGetDbStatsQuery,
  useBackupDbMutation,
  useRestoreDbMutation,
  useGetCollectionDocumentsQuery,
  useCreateCollectionDocumentMutation,
  useUpdateCollectionDocumentMutation,
  useDeleteCollectionDocumentMutation
} from '../redux/slices/adminApiSlice';
import { setCredentials } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { FiPlus, FiList, FiSettings, FiPieChart, FiEye, FiHeart, FiMessageSquare, FiUpload, FiLinkedin, FiGithub, FiGlobe, FiLayers, FiUsers, FiDatabase, FiRefreshCw, FiDownload, FiUploadCloud, FiTrash2, FiEdit, FiTerminal, FiMail } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { getImageUrl, handleImgError } from '../utils/image';

const DashboardPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = userInfo?.role === 'admin' && userInfo?.email === 'satyaprakash.in33@gmail.com';
  const dispatch = useDispatch();
  const { data: blogs, refetch } = useGetBlogsQuery();
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdatingBlog }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  // Admin-only RTK Query & Mutation Hooks
  const { data: users, refetch: refetchUsers } = useGetUsersQuery(undefined, { skip: !isAdmin });
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserByAdmin] = useUpdateUserByAdminMutation();

  // Database Administration Panel Hooks & States
  const { data: dbStats, refetch: refetchDbStats, isLoading: isStatsLoading } = useGetDbStatsQuery(undefined, { skip: !isAdmin });
  const [backupDb, { isLoading: isBackingUp }] = useBackupDbMutation();
  const [restoreDb, { isLoading: isRestoring }] = useRestoreDbMutation();

  const [dbCollection, setDbCollection] = useState('users');
  const [dbSearch, setDbSearch] = useState('');
  const [dbPage, setDbPage] = useState(1);
  const [dbLimit] = useState(10);

  // Subscribers tab hooks & states
  const [subSearch, setSubSearch] = useState('');
  const [subPage, setSubPage] = useState(1);
  const [subLimit] = useState(10);
  const [newSubEmail, setNewSubEmail] = useState('');

  const { data: subscribersData, refetch: refetchSubscribers, isLoading: isSubsLoading } = useGetCollectionDocumentsQuery(
    { collectionName: 'subscribers', search: subSearch, page: subPage, limit: subLimit },
    { skip: !isAdmin || activeTab !== 'subscribers' }
  );

  const { data: dbDocsData, refetch: refetchDbDocs, isLoading: isDocsLoading } = useGetCollectionDocumentsQuery(
    { collectionName: dbCollection, search: dbSearch, page: dbPage, limit: dbLimit },
    { skip: !isAdmin || !dbCollection }
  );

  const [createCollectionDoc] = useCreateCollectionDocumentMutation();
  const [updateCollectionDoc] = useUpdateCollectionDocumentMutation();
  const [deleteCollectionDoc] = useDeleteCollectionDocumentMutation();

  // Database JSON Editor Modals State
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbModalMode, setDbModalMode] = useState('create'); // 'create', 'edit'
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [rawJsonText, setRawJsonText] = useState('');

  // Warning Restore Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreConfirmationText, setRestoreConfirmationText] = useState('');
  const [restoreFileJson, setRestoreFileJson] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [returnTab, setReturnTab] = useState('articles');
  
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
    designation: userInfo?.designation || '',
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
      setActiveTab(returnTab);
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
    setReturnTab(activeTab);
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserByAdmin({ id: userId, data: { role: newRole } }).unwrap();
      toast.success('User role updated successfully!');
      refetchUsers();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? All their articles will also be deleted. This cannot be undone.')) {
      try {
        await deleteUser(userId).unwrap();
        toast.success('User and their articles deleted successfully!');
        refetchUsers();
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
      dispatch(setCredentials({ ...userInfo, ...res }));
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

  // Database Admin Handler Functions
  const handleBackupDownload = async () => {
    try {
      const res = await backupDb().unwrap();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `techblogger-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Database backup downloaded successfully!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to generate backup.");
    }
  };

  const handleFileImport = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsedJson = JSON.parse(event.target.result);
          if (!parsedJson.users || !parsedJson.blogs) {
            toast.error("Invalid file format. Backup file must contain 'users' and 'blogs' keys.");
            return;
          }
          setRestoreFileJson(parsedJson);
          setRestoreConfirmationText('');
          setIsRestoreModalOpen(true);
        } catch (error) {
          toast.error("Failed to parse JSON file.");
        }
      };
    }
  };

  const handleConfirmRestore = async () => {
    if (restoreConfirmationText !== 'RESTORE') {
      toast.error("Please type RESTORE to confirm.");
      return;
    }
    try {
      await restoreDb(restoreFileJson).unwrap();
      toast.success("Database restored successfully! Logging you out to refresh status...");
      setIsRestoreModalOpen(false);
      setRestoreFileJson(null);
      refetchDbStats();
      
      // Log out and reload
      setTimeout(() => {
        dispatch(setCredentials(null));
        localStorage.removeItem('userInfo');
        window.location.reload();
      }, 2000);
    } catch (err) {
      toast.error(err?.data?.message || "Restore failed.");
    }
  };

  const handleAddDocClick = () => {
    setDbModalMode('create');
    setSelectedDocId(null);
    const template = dbCollection === 'users' ? {
      name: '',
      email: '',
      password: '',
      role: 'user',
      designation: '',
      bio: '',
      avatar: ''
    } : dbCollection === 'subscribers' ? {
      email: ''
    } : {
      title: '',
      excerpt: '',
      content: '',
      category: 'Web Development',
      tags: [],
      coverImage: '',
      views: 0,
      isPublished: true,
      author: userInfo?._id
    };
    setRawJsonText(JSON.stringify(template, null, 2));
    setIsDbModalOpen(true);
  };

  const handleEditDocClick = (doc) => {
    setDbModalMode('edit');
    setSelectedDocId(doc._id);
    const copy = { ...doc };
    delete copy.__v;
    setRawJsonText(JSON.stringify(copy, null, 2));
    setIsDbModalOpen(true);
  };

  const handleSaveDbDoc = async () => {
    try {
      const parsedData = JSON.parse(rawJsonText);
      if (dbModalMode === 'create') {
        await createCollectionDoc({ collectionName: dbCollection, data: parsedData }).unwrap();
        toast.success("Document created successfully!");
      } else {
        await updateCollectionDoc({ collectionName: dbCollection, id: selectedDocId, data: parsedData }).unwrap();
        toast.success("Document updated successfully!");
      }
      setIsDbModalOpen(false);
      refetchDbDocs();
      refetchDbStats();
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON syntax. Please check your commas, braces, and quotes.");
      } else {
        toast.error(err?.data?.message || err.error || "Operation failed.");
      }
    }
  };

  const handleDeleteDbDoc = async (id) => {
    const warningText = dbCollection === 'users' 
      ? "Are you sure you want to delete this user? This will cascade delete all blogs authored by this user!" 
      : "Are you sure you want to delete this document?";
      
    if (window.confirm(warningText)) {
      try {
        await deleteCollectionDoc({ collectionName: dbCollection, id }).unwrap();
        toast.success("Document deleted successfully!");
        refetchDbDocs();
        refetchDbStats();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete document.");
      }
    }
  };

  const handleSubscriberDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this email from the subscribers list?')) {
      try {
        await deleteCollectionDoc({ collectionName: 'subscribers', id }).unwrap();
        toast.success('Subscriber deleted successfully!');
        refetchSubscribers();
        refetchDbStats();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete subscriber');
      }
    }
  };

  const handleAddSubscriberSubmit = async (e) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    try {
      await createCollectionDoc({ collectionName: 'subscribers', data: { email: newSubEmail.trim() } }).unwrap();
      toast.success('Subscriber added successfully!');
      setNewSubEmail('');
      refetchSubscribers();
      refetchDbStats();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add subscriber');
    }
  };

  if (!userInfo) return <div className="text-center py-20 text-zinc-900 dark:text-white">Please log in to access dashboard.</div>;

  return (
    <div className="container mx-auto px-6 md:px-12 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-24 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-zinc-700/50">
            {/* Profile Card Header */}
            <div className="relative bg-gray-300 dark:bg-zinc-800 px-6 pt-8 pb-14">
              {/* Decorative blobs */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl translate-x-4 translate-y-4"></div>
              {/* Avatar */}
              <div className="flex flex-col items-center relative z-10">
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-white/30 blur-sm scale-110"></div>
                  <img
                    src={getImageUrl(userInfo.avatar, userInfo.name)}
                    onError={handleImgError(userInfo.name)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white/90 shadow-xl object-cover relative z-10"
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center z-20">
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-zinc-900 dark:text-white font-bold text-xl tracking-tight drop-shadow">{userInfo.name}</h3>
                {userInfo.designation ? (
                  <span className="mt-1.5 px-3 py-1 bg-black/5 dark:bg-white/20 backdrop-blur-sm border border-black/10 dark:border-white/30 text-zinc-800 dark:text-white/95 text-xs font-semibold rounded-full tracking-wide">
                    {userInfo.designation}
                  </span>
                ) : (
                  <span className="mt-1.5 px-3 py-1 bg-black/5 dark:bg-white/15 border border-black/10 dark:border-white/20 text-zinc-700 dark:text-white/70 text-xs font-medium rounded-full capitalize">
                    {userInfo.role}
                  </span>
                )}
              </div>
            </div>

            {/* Stats Strip */}
            <div className="bg-white dark:bg-zinc-900 grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800 -mt-6 mx-4 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800 relative z-10">
              <div className="flex flex-col items-center py-3">
                <span className="text-base font-bold text-zinc-900 dark:text-white">{myBlogs.length}</span>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Posts</span>
              </div>
              <div className="flex flex-col items-center py-3">
                <span className="text-base font-bold text-zinc-900 dark:text-white">{totalViews}</span>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Views</span>
              </div>
              <div className="flex flex-col items-center py-3">
                <span className="text-base font-bold text-zinc-900 dark:text-white">{totalLikes}</span>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Likes</span>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white dark:bg-zinc-900/70 backdrop-blur-xl p-4 mt-0 rounded-b-3xl">
            <nav className="flex flex-col gap-1.5 mt-2">
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
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setActiveTab('all-articles')}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'all-articles' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
                  >
                    <FiLayers size={18} /> All Articles
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'users' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
                  >
                    <FiUsers size={18} /> Manage Users
                  </button>
                  <button 
                    onClick={() => setActiveTab('subscribers')}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'subscribers' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
                  >
                    <FiMail size={18} /> Manage Subscribers
                  </button>
                  <button 
                    onClick={() => setActiveTab('db-admin')}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'db-admin' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}
                  >
                    <FiDatabase size={18} /> Database Admin
                  </button>
                </>
              )}
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

          {activeTab === 'all-articles' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Platform Articles</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Admin Panel: Manage, edit or delete any blog post on the platform.</p>
                </div>
              </div>
              
              {blogs?.length === 0 ? (
                <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-700 border-dashed">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-zinc-400 dark:text-zinc-500">
                    <FiList size={24} />
                  </div>
                  <h3 className="text-zinc-900 dark:text-white font-semibold mb-2">No Articles Yet</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No articles have been written on the platform yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Article Title</th>
                        <th className="px-6 py-4 font-semibold">Author</th>
                        <th className="px-6 py-4 font-semibold">Category</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Stats</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {blogs?.map(blog => (
                        <tr key={blog._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors bg-white dark:bg-transparent">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-zinc-900 dark:text-white line-clamp-1 w-64">{blog.title}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-700 dark:text-zinc-300 font-medium">
                            {blog.author?.name || 'Unknown'}
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

          {activeTab === 'users' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">User Management</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Admin Panel: View, update roles, or delete user accounts on the platform.</p>
                </div>
              </div>
              
              {!users || users.length === 0 ? (
                <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-700 border-dashed">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-zinc-400 dark:text-zinc-500">
                    <FiUsers size={24} />
                  </div>
                  <h3 className="text-zinc-900 dark:text-white font-semibold mb-2">No Users Found</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No registered users exist in the database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-4 font-semibold">User</th>
                        <th className="px-6 py-4 font-semibold">Email</th>
                        <th className="px-6 py-4 font-semibold">Joined Date</th>
                        <th className="px-6 py-4 font-semibold">Designation</th>
                        <th className="px-6 py-4 font-semibold">Role</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors bg-white dark:bg-transparent">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={getImageUrl(user.avatar, user.name)} 
                                onError={handleImgError(user.name)} 
                                className="w-8 h-8 rounded-full object-cover" 
                                alt={user.name} 
                              />
                              <p className="font-semibold text-zinc-900 dark:text-white">{user.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-700 dark:text-zinc-300 font-medium">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                            {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-zinc-550 dark:text-zinc-400 font-medium">
                            {user.designation || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={user.role} 
                              disabled={user._id === userInfo._id} 
                              onChange={(e) => handleRoleChange(user._id, e.target.value)} 
                              className="bg-zinc-150 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-full text-xs font-semibold border border-zinc-250 dark:border-zinc-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button 
                              onClick={() => handleUserDelete(user._id)} 
                              disabled={user._id === userInfo._id} 
                              className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:text-zinc-300 dark:disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors font-semibold"
                            >
                              Delete Account
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'subscribers' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2.5">
                    <FiMail className="text-violet-500" /> Newsletter Subscribers
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">View, search, add, or remove subscribers for the platform newsletter.</p>
                </div>

                {/* Add Subscriber form */}
                <form onSubmit={handleAddSubscriberSubmit} className="flex gap-3 w-full md:w-auto items-center">
                  <input
                    type="email"
                    required
                    placeholder="Enter email to subscribe..."
                    value={newSubEmail}
                    onChange={(e) => setNewSubEmail(e.target.value)}
                    className="input-field py-2 px-4 text-sm rounded-xl w-full md:w-64"
                  />
                  <button type="submit" className="btn-primary rounded-xl px-5 py-2 text-sm font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                    <FiPlus size={16} /> Add
                  </button>
                </form>
              </div>

              {/* Search subscriber */}
              <div className="mb-6 flex justify-between items-center gap-4">
                <input
                  type="text"
                  placeholder="Search subscribers by email..."
                  value={subSearch}
                  onChange={(e) => { setSubSearch(e.target.value); setSubPage(1); }}
                  className="input-field py-2.5 px-4 text-sm rounded-xl w-full max-w-md"
                />
                <button
                  type="button"
                  onClick={() => refetchSubscribers()}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                >
                  <FiRefreshCw className={`h-3.5 w-3.5 ${isSubsLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* Subscribers Table */}
              {isSubsLoading ? (
                <div className="text-center py-20 text-zinc-500 animate-pulse">Loading subscribers...</div>
              ) : !subscribersData?.documents || subscribersData.documents.length === 0 ? (
                <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-700 border-dashed">
                  <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-zinc-400 dark:text-zinc-500">
                    <FiMail size={24} />
                  </div>
                  <h3 className="text-zinc-900 dark:text-white font-semibold mb-2">No Subscribers Found</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No emails match your query or are currently subscribed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Subscriber Email</th>
                          <th className="px-6 py-4 font-semibold">Subscribed Date</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {subscribersData.documents.map((subscriber) => (
                          <tr key={subscriber._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-805 transition-colors bg-white dark:bg-transparent">
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white select-all">
                              {subscriber.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                              {subscriber.createdAt ? format(new Date(subscriber.createdAt), 'MMMM dd, yyyy - hh:mm a') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleSubscriberDelete(subscriber._id)}
                                className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-455 transition-colors font-semibold"
                              >
                                Delete Subscriber
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {subscribersData.pages > 1 && (
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                        Page {subPage} of {subscribersData.pages} ({subscribersData.total} subscribers)
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                          disabled={subPage === 1}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-700"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubPage((p) => Math.min(subscribersData.pages, p + 1))}
                          disabled={subPage === subscribersData.pages}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-700"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'db-admin' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* DB Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1 tracking-tight flex items-center gap-3">
                    <FiDatabase className="text-violet-500" /> Database Administration
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400">Monitor collections, backup/restore data, and execute CRUD operations on MongoDB.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => { refetchDbStats(); refetchDbDocs(); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 rounded-xl transition-all border border-zinc-200 dark:border-zinc-700 font-semibold"
                >
                  <FiRefreshCw className={`h-4 w-4 ${isStatsLoading || isDocsLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* DB Status Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Conn Card */}
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold ${dbStats?.connectionState === 'Connected' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450'}`}>
                    {dbStats?.connectionState === 'Connected' ? 'ON' : 'OFF'}
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">Status</span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white capitalize">{dbStats?.connectionState || 'Checking...'}</span>
                  </div>
                </div>

                {/* DB Name Card */}
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FiTerminal size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">DB Name</span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white block truncate">{dbStats?.dbName || 'N/A'}</span>
                  </div>
                </div>

                {/* Users Count Card */}
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FiUsers size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">Users Count</span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white block font-mono">
                      {dbStats?.collections?.find(c => c.name === 'users')?.count ?? '0'}
                    </span>
                  </div>
                </div>

                {/* Blogs Count Card */}
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <FiLayers size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">Blogs Count</span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white block font-mono">
                      {dbStats?.collections?.find(c => c.name === 'blogs')?.count ?? '0'}
                    </span>
                  </div>
                </div>

                {/* Subscribers Count Card */}
                <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">Subscribers</span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white block font-mono">
                      {dbStats?.collections?.find(c => c.name === 'subscribers')?.count ?? '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Maintenance Tools (Backup / Restore) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Backup Panel */}
                <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiDownload className="text-violet-500" /> Database Backup
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    Download a full JSON dump of the database (contains all registered users, profile details, and blog articles). Use this to keep offline backups of your platform.
                  </p>
                  <button 
                    type="button"
                    onClick={handleBackupDownload}
                    disabled={isBackingUp}
                    className="w-full sm:w-auto btn-primary rounded-xl px-6 py-3 font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isBackingUp ? 'Generating...' : 'Export DB to JSON'}
                  </button>
                </div>

                {/* Restore Panel */}
                <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiUploadCloud className="text-rose-500" /> Database Restore
                  </h3>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mb-6 font-medium">
                    ⚠️ WARNING: Restoring will overwrite existing data. Make sure the JSON includes correct collections. An admin profile must be present in the uploaded file to avoid lockout.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <label className="w-full sm:w-auto px-6 py-3 bg-rose-550 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-450 rounded-xl transition-all border border-rose-200 dark:border-rose-500/20 font-semibold cursor-pointer text-center">
                      Choose Backup File
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleFileImport}
                        className="hidden" 
                      />
                    </label>
                    {isRestoring && <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium animate-pulse">Restoring DB...</span>}
                  </div>
                </div>
              </div>

              {/* Collections Document Explorer */}
              <div className="bg-white dark:bg-zinc-900/40 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {/* Header controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
                  {/* Left Tabs */}
                  <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/45">
                    <button 
                      type="button"
                      onClick={() => { setDbCollection('users'); setDbPage(1); }}
                      className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${dbCollection === 'users' ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                      <FiUsers size={16} /> Users
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setDbCollection('blogs'); setDbPage(1); }}
                      className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${dbCollection === 'blogs' ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                      <FiLayers size={16} /> Blogs
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setDbCollection('subscribers'); setDbPage(1); }}
                      className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${dbCollection === 'subscribers' ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                    >
                      <FiMail size={16} /> Subscribers
                    </button>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
                    {/* Search bar */}
                    <input 
                      type="text" 
                      placeholder={`Search in ${dbCollection}...`}
                      value={dbSearch}
                      onChange={(e) => { setDbSearch(e.target.value); setDbPage(1); }}
                      className="input-field py-2.5 px-4 text-sm rounded-xl w-full sm:w-64"
                    />
                    
                    {/* Add Document button */}
                    <button 
                      type="button"
                      onClick={handleAddDocClick}
                      className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                    >
                      <FiPlus size={16} /> Add Document
                    </button>
                  </div>
                </div>

                {/* Collection Records View */}
                {isDocsLoading ? (
                  <div className="text-center py-20 text-zinc-500 animate-pulse">Loading documents...</div>
                ) : !dbDocsData?.documents || dbDocsData.documents.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl border border-zinc-200 dark:border-zinc-700 border-dashed">
                    <FiDatabase size={32} className="mx-auto text-zinc-400 dark:text-zinc-500 mb-3" />
                    <h3 className="text-zinc-900 dark:text-white font-semibold mb-1">No Documents Found</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">No items matched your query in this collection.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Document List */}
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-transparent">
                      {dbDocsData.documents.map((doc) => (
                        <div key={doc._id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          {/* Document Metadata Summary */}
                          <div className="flex items-start gap-4 flex-grow overflow-hidden">
                            {dbCollection === 'users' ? (
                              <img 
                                src={getImageUrl(doc.avatar, doc.name)} 
                                onError={handleImgError(doc.name)}
                                className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover flex-shrink-0" 
                                alt="" 
                              />
                            ) : dbCollection === 'subscribers' ? (
                              <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-750 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                                <FiMail size={18} />
                              </div>
                            ) : (
                              <img 
                                src={getImageUrl(doc.coverImage)} 
                                className="w-16 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0" 
                                alt="" 
                              />
                            )}
                            <div className="space-y-1 overflow-hidden w-full">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md font-semibold select-all">
                                  {doc._id}
                                </span>
                                {dbCollection === 'users' ? (
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${doc.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                    {doc.role}
                                  </span>
                                ) : dbCollection === 'subscribers' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                    Subscribed
                                  </span>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${doc.isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                    {doc.isPublished ? 'Published' : 'Draft'}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-zinc-900 dark:text-white truncate max-w-lg">
                                {dbCollection === 'users' ? doc.name : (dbCollection === 'subscribers' ? doc.email : doc.title)}
                              </h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                {dbCollection === 'users' ? doc.email : (dbCollection === 'subscribers' ? `Joined: ${doc.createdAt ? format(new Date(doc.createdAt), 'MMM dd, yyyy') : 'N/A'}` : `Category: ${doc.category} • Views: ${doc.views}`)}
                              </p>
                            </div>
                          </div>

                          {/* Quick Admin Actions */}
                          <div className="flex items-center gap-3 self-end md:self-auto flex-shrink-0">
                            <button 
                              type="button"
                              onClick={() => handleEditDocClick(doc)}
                              className="p-2.5 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl transition-all border border-transparent hover:border-violet-200 dark:hover:border-violet-500/20"
                              title="Edit raw JSON"
                            >
                              <FiEdit size={17} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteDbDoc(doc._id)}
                              disabled={dbCollection === 'users' && doc._id === userInfo._id}
                              className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Delete document"
                            >
                              <FiTrash2 size={17} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {dbDocsData.pages > 1 && (
                      <div className="flex justify-between items-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                          Page {dbPage} of {dbDocsData.pages} ({dbDocsData.total} docs)
                        </span>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setDbPage(p => Math.max(1, p - 1))}
                            disabled={dbPage === 1}
                            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-700"
                          >
                            Prev
                          </button>
                          <button 
                            type="button"
                            onClick={() => setDbPage(p => Math.min(dbDocsData.pages, p + 1))}
                            disabled={dbPage === dbDocsData.pages}
                            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold transition-all border border-zinc-200 dark:border-zinc-700"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                      <option>Data Science</option>
                      <option>Cloud Computing</option>
                      <option>DevOps</option>
                      <option>UI/UX Design</option>
                      <option>Cybersecurity</option>
                      <option>Blockchain</option>
                      <option>Game Development</option>
                      <option>Software Engineering</option>
                      <option>Embedded Systems</option>
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
                  <img src={getImageUrl(profileData.avatar || userInfo.avatar, userInfo.name)} onError={handleImgError(userInfo.name)} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-sm object-cover" />
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
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Designation <span className="text-zinc-400 font-normal">(e.g. Full Stack Developer)</span></label>
                  <input
                    type="text"
                    value={profileData.designation}
                    onChange={e => setProfileData({...profileData, designation: e.target.value})}
                    className="input-field rounded-xl"
                    placeholder="Your professional title..."
                  />
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

      {/* Safety Database Restore Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Confirm Database Restore</h3>
              <p className="text-sm text-rose-600 font-semibold mb-4 leading-relaxed">
                ⚠️ THIS ACTION IS EXTREMELY DANGEROUS! All current users and articles on the platform will be deleted permanently and replaced by the data in your backup file.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                To confirm and apply this change, please type <strong className="font-bold text-zinc-900 dark:text-white">"RESTORE"</strong> in the field below. After completion, you will be logged out to refresh status.
              </p>
            </div>

            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Type RESTORE to confirm"
                value={restoreConfirmationText}
                onChange={(e) => setRestoreConfirmationText(e.target.value)}
                className="input-field rounded-xl font-mono text-center font-bold tracking-wider"
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => { setIsRestoreModalOpen(false); setRestoreFileJson(null); }}
                className="flex-1 btn-secondary py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmRestore}
                disabled={restoreConfirmationText !== 'RESTORE' || isRestoring}
                className="flex-1 bg-rose-550 hover:bg-rose-600 disabled:bg-rose-500/30 text-white py-3 rounded-xl font-bold transition-all disabled:cursor-not-allowed"
              >
                {isRestoring ? 'Restoring...' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Document Editor Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full p-8 shadow-2xl space-y-6 relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-violet-500"></div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white capitalize">
                {dbModalMode === 'create' ? 'Add New Document' : 'Edit Raw JSON Document'}
              </h3>
              <span className="font-mono text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md font-semibold select-none">
                {dbCollection} Collection
              </span>
            </div>

            <div className="flex-grow flex flex-col space-y-2 min-h-0">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Edit document raw fields in JSON format:</label>
              <textarea 
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                className="flex-grow w-full h-80 min-h-0 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-850 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 dark:text-zinc-200 resize-none overflow-y-auto leading-relaxed"
                placeholder="{}"
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsDbModalOpen(false)}
                className="flex-1 btn-secondary py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveDbDoc}
                className="flex-1 btn-primary py-3 rounded-xl font-bold shadow-md shadow-violet-500/10"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
