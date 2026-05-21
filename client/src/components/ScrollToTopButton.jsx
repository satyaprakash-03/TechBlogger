import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const show = window.scrollY > 300;
      setIsVisible((prev) => {
        if (prev !== show) return show;
        return prev;
      });
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 p-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-xl shadow-blue-500/30 transition-all z-50 hover:-translate-y-1 active:scale-95"
    >
      <FiArrowUp size={22} />
    </button>
  );
};

export default ScrollToTopButton;
