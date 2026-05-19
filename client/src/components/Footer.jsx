import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { FiTwitter, FiGithub, FiLinkedin, FiMail, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative mt-20 border-t border-zinc-800/60 bg-[#09090b] overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <img
                src={logoImg}
                alt="TechBlogger Logo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-bold text-white text-lg tracking-tight">Tech<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Blogger</span></span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">
              TechBlogger is a modern and premium platform for developers, programmers, and tech enthusiasts to write, learn, and grow together by sharing knowledge, innovative ideas, coding experiences, and the latest technology insights with the world.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <FiTwitter size={18} />, href: 'https://x.com/Satyaprakash_56', color: 'hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]', label: "Twitter" },
                { icon: <FiGithub size={18} />, href: 'https://github.com/satyaprakash-03', color: 'hover:bg-white hover:text-black hover:border-white', label: "GitHub" },
                { icon: <FiLinkedin size={18} />, href: 'https://www.linkedin.com/in/satyaprakash-prajapati03/', color: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]', label: "LinkedIn" },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className={`w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 transition-all duration-300 ${s.color}`}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6">Explore</h4>
            <ul className="space-y-4">
              {[
                { label: 'Home', to: '/' },
                { label: 'All Articles', to: '/blogs' },
                { label: 'Categories', to: '/categories' },
                { label: 'Write Article', to: '/dashboard' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-zinc-400 hover:text-violet-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-violet-500 transition-colors"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-6">Topics</h4>
            <ul className="space-y-4">
              {[
                { label: 'Web Development', to: '/blogs?category=Web+Development' },
                { label: 'Data Science', to: '/blogs?category=Data+Science' },
                { label: 'Cloud Computing', to: '/blogs?category=Cloud+Computing' },
                { label: 'Cybersecurity', to: '/blogs?category=Cybersecurity' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-zinc-400 hover:text-violet-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-violet-500 transition-colors"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-white mb-6">Subscribe for Newsletter</h4>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">Get the best articles delivered to your inbox every week.</p>
            {subscribed ? (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">✓</div>
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); if (email.trim()) { setSubscribed(true); setEmail(''); } }} className="space-y-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <FiMail className="text-zinc-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                  </div>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-zinc-200 text-zinc-900 text-sm font-semibold rounded-xl transition-all active:scale-[0.98]">
                  Subscribe <FiArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-zinc-800/80 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} TechBlogger. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(item => (
              <Link key={item} to={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
