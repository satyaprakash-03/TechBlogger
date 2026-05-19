import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiMonitor, FiSmartphone, FiCpu, FiServer, FiPenTool, 
  FiBookOpen, FiCloud, FiShield, FiLink, FiPlayCircle, FiCode 
} from 'react-icons/fi';

const categories = [
  { name: 'Web Development', icon: <FiMonitor size={32} />, color: 'from-blue-500 to-cyan-400', count: 12 },
  { name: 'Mobile Dev', icon: <FiSmartphone size={32} />, color: 'from-emerald-500 to-teal-400', count: 8 },
  { name: 'AI & Machine Learning', icon: <FiCpu size={32} />, color: 'from-purple-500 to-pink-500', count: 15 },
  { name: 'Data Science', icon: <FiBookOpen size={32} />, color: 'from-cyan-500 to-blue-500', count: 10 },
  { name: 'Cloud Computing', icon: <FiCloud size={32} />, color: 'from-sky-500 to-indigo-500', count: 7 },
  { name: 'DevOps', icon: <FiServer size={32} />, color: 'from-orange-500 to-red-500', count: 6 },
  { name: 'UI/UX Design', icon: <FiPenTool size={32} />, color: 'from-indigo-500 to-purple-500', count: 9 },
  { name: 'Cybersecurity', icon: <FiShield size={32} />, color: 'from-red-500 to-rose-500', count: 5 },
  { name: 'Blockchain', icon: <FiLink size={32} />, color: 'from-indigo-500 to-blue-500', count: 4 },
  { name: 'Game Development', icon: <FiPlayCircle size={32} />, color: 'from-lime-500 to-green-500', count: 6 },
  { name: 'Software Engineering', icon: <FiCode size={32} />, color: 'from-teal-500 to-emerald-500', count: 14 },
  { name: 'Embedded Systems', icon: <FiCpu size={32} />, color: 'from-slate-500 to-gray-500', count: 3 },
];

const CategoriesPage = () => {
  return (
    <div className="container mx-auto px-6 md:px-12 py-20 min-h-[80vh]">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">Explore <span className="gradient-text">Categories</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Find exactly what you are looking for by browsing our specialized topics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            key={cat.name}
          >
            <Link to={`/blogs`} className="block glass-card p-8 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${cat.color} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${cat.color} text-zinc-900 dark:text-white shadow-lg`}>
                {cat.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{cat.name}</h2>
              <p className="text-slate-400">{cat.count} Published Articles</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
