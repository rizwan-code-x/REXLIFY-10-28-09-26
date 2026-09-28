import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

interface ReadingProgressBarProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  title?: string;
  category?: string;
  estimatedTime?: string;
  showFloatingControls?: boolean;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  targetRef,
  title,
  category,
  estimatedTime,
  showFloatingControls = true
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;

        if (targetRef && targetRef.current) {
          const el = targetRef.current;
          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const totalHeight = el.offsetHeight;
          
          // When element is above or below viewport
          if (rect.top > windowHeight * 0.5) {
            setProgress(prev => prev === 0 ? prev : 0);
            setIsVisible(prev => !prev ? prev : false);
            return;
          }

          setIsVisible(prev => prev ? prev : true);

          const scrollableDistance = totalHeight - windowHeight + 200;
          if (scrollableDistance <= 0) {
            setProgress(prev => prev === 100 ? prev : 100);
            return;
          }

          const currentOffset = Math.max(0, -rect.top + 100);
          const percent = Math.min(100, Math.max(0, Math.round((currentOffset / scrollableDistance) * 100)));
          setProgress(prev => prev === percent ? prev : percent);
        } else {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          if (scrollHeight > 0) {
            const percent = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
            setProgress(prev => prev === percent ? prev : percent);
            const shouldBeVisible = scrollTop > 120;
            setIsVisible(prev => prev === shouldBeVisible ? prev : shouldBeVisible);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [targetRef]);

  const scrollToTop = () => {
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Fixed Progress Bar Line */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 z-[110] bg-white/5 pointer-events-none"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(16,185,129,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Reading Progress Pill & Indicator */}
      <AnimatePresence>
        {showFloatingControls && isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-20 right-4 sm:right-8 z-[100] flex items-center gap-3 bg-[#050505]/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl hover:border-emerald-500/30 transition-all group select-none"
          >
            {/* Circular Progress Ring or Status */}
            <div className="relative flex items-center justify-center h-7 w-7">
              <svg className="h-7 w-7 -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-150 ease-out"
                  strokeDasharray={`${progress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[9px] font-mono font-bold text-white">
                {progress === 100 ? (
                  <CheckCircle2 size={12} className="text-emerald-400" />
                ) : (
                  `${progress}%`
                )}
              </span>
            </div>

            {/* Context Info */}
            <div className="hidden md:flex flex-col text-left pr-2 border-r border-white/10">
              {title && (
                <span className="text-[11px] font-sora font-semibold text-white truncate max-w-[180px]">
                  {title}
                </span>
              )}
              <div className="flex items-center gap-2 text-[9px] font-mono text-gray-400">
                {category && <span className="text-emerald-400 uppercase">{category}</span>}
                {estimatedTime && (
                  <span className="flex items-center gap-1">
                    <Clock size={9} />
                    {progress === 100 ? 'Completed' : estimatedTime}
                  </span>
                )}
              </div>
            </div>

            {/* Scroll to Top Action */}
            <button
              onClick={scrollToTop}
              title="Return to top of article"
              className="p-1 rounded-full text-gray-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ArrowUp size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
