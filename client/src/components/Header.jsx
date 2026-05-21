import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../redux/slices/usersApiSlice';
import { logout } from '../redux/slices/authSlice';
import { FiMenu, FiX, FiSearch, FiEdit3, FiLogOut, FiGrid, FiSettings, FiChevronDown, FiSun, FiMoon, FiBell, FiBookmark, FiCompass, FiMail, FiBookOpen, FiUser, FiInfo, FiTrash2, FiHeart } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation
} from '../redux/slices/notificationsApiSlice';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';
import { getImageUrl, handleImgError } from '../utils/image';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApiCall] = useLogoutMutation();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    skip: !userInfo,
    pollingInterval: 15000,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [clearAllNotifications] = useClearAllNotificationsMutation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif._id).unwrap();
      }
      setNotifOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error('Failed to click notification:', err);
    }
  };

  useEffect(() => {
    const fn = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled((prev) => {
        if (prev !== isScrolled) return isScrolled;
        return prev;
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleLogout = async () => {
    try { await logoutApiCall().unwrap(); dispatch(logout()); navigate('/'); }
    catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) { navigate(`/blogs?search=${searchTerm}`); setSearchTerm(''); setSearchOpen(false); }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-gradient-to-r from-zinc-50/90 via-white/90 to-zinc-50/90 dark:from-[#09090b]/90 dark:via-zinc-900/90 dark:to-[#09090b]/90 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800/80 shadow-sm' 
        : 'bg-transparent border-b border-transparent py-1'
    }`}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src={logoImg}
            alt="TechBlogger Logo"
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <span className="font-bold text-zinc-900 dark:text-white text-xl tracking-tight">
            Tech<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Blogger</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { path: '/', label: 'Home', icon: <FiCompass size={14} /> },
            { path: '/blogs', label: 'Articles', icon: <FiBookOpen size={14} /> },
            { path: userInfo ? '/dashboard' : '/login', label: 'Dashboard', icon: <FiGrid size={14} /> },
            { path: '/#contact', label: 'Contact', icon: <FiMail size={14} /> },
          ].map(({ path, label, icon }) => {
            const linkProps = {
              key: path,
              className: `flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                isActive(path)
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`
            };
            return path.startsWith('/#') 
              ? <a href={path} onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    const element = document.getElementById(path.substring(2));
                    if (element) {
                      const y = element.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }
                }} {...linkProps}>{icon}{label}</a>
              : <Link to={path} onClick={(e) => {
                  if (location.pathname === path) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }} {...linkProps}>{icon}{label}</Link>;
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">

          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <FiSearch size={16} />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-2"
                >
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search articles..."
                      className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                    <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-zinc-900 dark:text-white text-sm px-3 py-2 rounded-lg font-medium transition-colors">Go</button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {userInfo ? (
            <>
              {/* Notification Bell Popover */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-10 h-10 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <FiBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 px-1 text-[8px] font-bold text-white bg-pink-500 rounded-full min-w-[13px] h-[13px] flex items-center justify-center ring-1 ring-white dark:ring-[#09090b]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      {/* Popover Header */}
                      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {unreadCount > 0 && (
                            <button
                              onClick={() => markAllAsRead()}
                              className="text-xs font-semibold text-violet-600 hover:text-violet-500 transition-colors"
                            >
                              Mark all as read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={() => clearAllNotifications()}
                              className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <FiBell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notif) => {
                            let NotifIcon = FiInfo;
                            let iconBg = 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
                            if (notif.type === 'like') {
                              NotifIcon = FiHeart;
                              iconBg = 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400';
                            } else if (notif.type === 'publish') {
                              NotifIcon = FiBookOpen;
                              iconBg = 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400';
                            } else if (notif.type === 'register') {
                              NotifIcon = FiUser;
                              iconBg = 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
                            }

                            return (
                              <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`group p-4 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${!notif.isRead ? 'bg-violet-50/30 dark:bg-violet-500/5' : ''}`}
                              >
                                <div className="flex-shrink-0">
                                  {notif.sender ? (
                                    <img
                                      src={getImageUrl(notif.sender.avatar, notif.sender.name)}
                                      onError={handleImgError(notif.sender.name)}
                                      alt="avatar"
                                      className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                                    />
                                  ) : (
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBg}`}>
                                      <NotifIcon size={16} />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-grow min-w-0">
                                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                                      {notif.title}
                                    </p>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                                      {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                    {notif.message}
                                  </p>
                                </div>

                                <div className="flex flex-col items-center justify-between gap-2 flex-shrink-0">
                                  {!notif.isRead && (
                                    <span className="w-2.5 h-2.5 bg-violet-600 rounded-full"></span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notif._id);
                                    }}
                                    className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors lg:opacity-0 lg:group-hover:opacity-100"
                                    title="Delete notification"
                                  >
                                    <FiTrash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/dashboard"
                className="hidden lg:flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-full shadow-lg shadow-violet-500/25 transition-all active:scale-95 border border-violet-500/50"
              >
                <FiEdit3 size={16} /> Write
              </Link>

              <div ref={dropRef} className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:bg-zinc-800 transition-colors"
                >
                  <img src={getImageUrl(userInfo.avatar, userInfo.name)} onError={handleImgError(userInfo.name)} alt="avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-violet-500/30" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-300 font-medium max-w-[72px] truncate">{userInfo.name?.split(' ')[0]}</span>
                  <FiChevronDown size={13} className={`text-zinc-400 dark:text-zinc-500 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">{userInfo.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{userInfo.email}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <Link to="/dashboard" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors">
                          <FiGrid size={14} /> Dashboard
                        </Link>
                        <Link to="/dashboard" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors">
                          <FiSettings size={14} /> Settings
                        </Link>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-1 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                          <FiLogOut size={14} /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors font-semibold">Sign in</Link>
              <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full transition-colors shadow-lg">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700"
          >
            {theme === 'dark' ? <FiSun size={17} /> : <FiMoon size={17} />}
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300 dark:border-zinc-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={17} /> : <FiMenu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden bg-slate-100 dark:bg-zinc-950/98 border-t border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-5 py-5 space-y-1">
              {[
                { path: '/', label: 'Home' },
                { path: '/blogs', label: 'Articles' },
                { path: userInfo ? '/dashboard' : '/login', label: 'Dashboard' },
                { path: '/#contact', label: 'Contact' },
              ].map(({ path, label }) => {
                const linkProps = {
                  key: path,
                  onClick: () => setMobileOpen(false),
                  className: `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(path) ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:bg-zinc-800'
                  }`
                };
                return path.startsWith('/#')
                  ? <a href={path} {...linkProps} onClick={(e) => {
                      if (location.pathname === '/') {
                        e.preventDefault();
                        const element = document.getElementById(path.substring(2));
                        if (element) {
                          const y = element.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({ top: y, behavior: 'smooth' });
                        }
                      }
                      linkProps.onClick();
                    }}>{label}</a>
                  : <Link to={path} {...linkProps} onClick={(e) => {
                      if (location.pathname === path) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                      linkProps.onClick();
                    }}>{label}</Link>;
              })}

              <form onSubmit={handleSearch} className="flex gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search..." className="input-field flex-1 text-sm" />
                <button type="submit" className="btn-primary px-4">
                  <FiSearch size={15} />
                </button>
              </form>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                {userInfo ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl">
                      <img src={getImageUrl(userInfo.avatar, userInfo.name)} onError={handleImgError(userInfo.name)} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/30" />
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{userInfo.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">{userInfo.email}</p>
                      </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors">
                      <FiEdit3 size={14} /> Write Article
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                      <FiLogOut size={14} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium">Sign in</Link>
                    <Link to="/register" className="block px-4 py-3 text-center text-sm bg-violet-600 hover:bg-violet-500 text-zinc-900 dark:text-white rounded-xl font-semibold transition-colors">Get Started Free</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
