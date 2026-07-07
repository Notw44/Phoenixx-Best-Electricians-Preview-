import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand = "Scroll to Enter Site",
  children,
}: ScrollExpandMediaProps) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'entering' | 'entered'>('idle');
  const touchStartY = useRef<number>(0);
  const hasEnteredOnce = useRef<boolean>(false);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const triggerEnter = () => {
    if (status !== 'idle') return;
    setStatus('entering');
    hasEnteredOnce.current = true;
    setTimeout(() => {
      setStatus('entered');
    }, 900); // match card zoom duration (900ms)
  };

  const triggerExit = () => {
    if (status !== 'entered') return;
    setStatus('entering'); // Keep card full-screen, but trigger viewport slide-down
    setTimeout(() => {
      setStatus('idle'); // Once viewport has completely covered the screen, shrink the card back
    }, 800); // match viewport slide-down duration (800ms)
  };

  // Listeners for entering the site (scrolling down / swiping up while in 'idle')
  useEffect(() => {
    if (status !== 'idle') return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 5) {
        triggerEnter();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchEndY = e.touches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      if (diff > 35) { // Swiped up / scrolled down (deliberate motion)
        triggerEnter();
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;
        if (diff > 35) {
          triggerEnter();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        triggerEnter();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status]);

  // Listeners for exiting the site (scrolling up / swiping down while at the top of the page in 'entered')
  useEffect(() => {
    if (status !== 'entered') return;

    let touchStartScrollY = -99999;

    const getScrollTop = () => {
      return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    };

    const handleWheel = (e: WheelEvent) => {
      if (getScrollTop() <= 10 && e.deltaY < -10) {
        triggerExit();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (getScrollTop() <= 15) {
        touchStartScrollY = e.touches[0].clientY;
      } else {
        touchStartScrollY = -99999;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const scrollTop = getScrollTop();
      if (scrollTop <= 15) {
        const currentY = e.touches[0].clientY;
        if (touchStartScrollY === -99999) {
          // Continuous scrolling reached the top; establish a fresh baseline
          touchStartScrollY = currentY;
          return;
        }
        const diff = currentY - touchStartScrollY;
        if (diff > 45) { // Deliberate swipe down once at the top
          triggerExit();
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      } else {
        // Scrolling elsewhere on the page invalidates the baseline
        touchStartScrollY = -99999;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const scrollTop = getScrollTop();
      if (scrollTop <= 15 && touchStartScrollY !== -99999 && e.changedTouches && e.changedTouches[0]) {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchEndY - touchStartScrollY;
        if (diff > 45) {
          triggerExit();
        }
      }
      touchStartScrollY = -99999;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (getScrollTop() <= 15 && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
        triggerExit();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status]);

  // Lock page scrolling while the user is in the interactive intro screen
  useEffect(() => {
    if (status !== 'entered') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [status]);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div className='relative w-full bg-[#0C0C0C] min-h-screen overflow-visible'>
      {/* 
        Persistent intro-viewport avoids unmounting, preserving layout-states for 100% fluid transitions.
        It slides cleanly up/down via y offsets and passes mouse/touch interactions to underlying site when entered.
      */}
      <motion.div
        key="intro-viewport"
        className={`fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-neutral-950 flex items-center justify-center select-none ${
          status === 'entered' ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        animate={{
          y: status === 'entered' ? '-100vh' : '0vh'
        }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Background image behind card - fades out as card expands */}
        <motion.div
          className='absolute inset-0 z-0 h-full'
          initial={{ opacity: 1 }}
          animate={{ opacity: (status === 'entering' || status === 'entered') ? 0 : 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={bgImageSrc}
            alt='Background'
            className='w-screen h-screen object-cover object-center filter blur-[6px] brightness-[0.35]'
            referrerPolicy="no-referrer"
          />
          <div className='absolute inset-0 bg-black/40' />
        </motion.div>

        {/* Central zooming card - interactive trigger */}
        <motion.div
          className='relative z-10 overflow-hidden flex items-center justify-center shadow-[0_30px_70px_rgba(0,0,0,0.95)] cursor-pointer'
          onClick={triggerEnter}
          initial={false}
          animate={{
            width: (status === 'entering' || status === 'entered') ? '100vw' : (isMobile ? '85vw' : '45vw'),
            height: (status === 'entering' || status === 'entered') ? '100vh' : (isMobile ? '65vh' : '75vh'),
            borderRadius: (status === 'entering' || status === 'entered') ? '0px' : '24px',
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {mediaType === 'video' ? (
            mediaSrc.includes('youtube.com') ? (
              <div className='absolute inset-0 w-full h-full pointer-events-none z-0'>
                <iframe
                  width='100%'
                  height='100%'
                  src={
                    mediaSrc.includes('embed')
                      ? mediaSrc +
                        (mediaSrc.includes('?') ? '&' : '?') +
                        'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                      : mediaSrc.replace('watch?v=', 'embed/') +
                        '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                        mediaSrc.split('v=')[1]
                  }
                  className='w-full h-full border-0 scale-105'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
              </div>
            ) : (
              <div className='absolute inset-0 w-full h-full pointer-events-none z-0'>
                <video
                  src={mediaSrc}
                  poster={posterSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload='auto'
                  className='w-full h-full object-cover'
                  controls={false}
                  disablePictureInPicture
                  disableRemotePlayback
                />
              </div>
            )
          ) : (
            <div className='absolute inset-0 w-full h-full z-0'>
              <img
                src={mediaSrc}
                alt={title || 'Media content'}
                className='w-full h-full object-cover'
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Ambient Dark Overlay over media for contrast */}
          <motion.div
            className='absolute inset-0 bg-black z-10 pointer-events-none'
            animate={{ opacity: (status === 'entering' || status === 'entered') ? 0.25 : 0.65 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />

        </motion.div>

        {/* Typography Overlay centered OVER the card */}
        <div 
          className='absolute inset-0 z-20 flex flex-col justify-between items-center text-center pointer-events-none select-none p-6 sm:p-12 overflow-visible'
        >
          {/* Top: Date / Brand Note */}
          <div className='pt-8 sm:pt-14'>
            {date && (
              <motion.p
                className='text-xs sm:text-sm font-mono tracking-[0.35em] uppercase text-[#FDE047] font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] whitespace-nowrap'
                animate={{ x: (status === 'entering' || status === 'entered') ? '-100vw' : '0vw', opacity: (status === 'entering' || status === 'entered') ? 0 : 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {date}
              </motion.p>
            )}
          </div>

          {/* Middle: Title text - ELITE CRAFTSMANSHIP */}
          <div className='flex flex-col items-center justify-center gap-2 sm:gap-4 py-4 w-full overflow-visible'>
            <motion.h2
              className='font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light uppercase tracking-[0.4em] text-white/95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] whitespace-nowrap'
              animate={{ x: (status === 'entering' || status === 'entered') ? '-100vw' : '0vw', opacity: (status === 'entering' || status === 'entered') ? 0 : 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {firstWord}
            </motion.h2>
            <motion.h2
              className='font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-[0.2em] text-[#FDE047] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] whitespace-nowrap -mr-[0.2em]'
              animate={{ x: (status === 'entering' || status === 'entered') ? '100vw' : '0vw', opacity: (status === 'entering' || status === 'entered') ? 0 : 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {restOfTitle}
            </motion.h2>
          </div>

          {/* Bottom: Action Hint (Fades out quickly) */}
          <div className='pb-8 sm:pb-14 pointer-events-auto'>
            {scrollToExpand && (
              <motion.button
                onClick={triggerEnter}
                className='text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] whitespace-nowrap flex flex-col items-center gap-2 cursor-pointer'
                animate={{ opacity: (status === 'entering' || status === 'entered') ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <span>{scrollToExpand}</span>
                <motion.span 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-base text-[#FDE047]"
                >
                  ↓
                </motion.span>
              </motion.button>
            )}
          </div>

        </div>

      </motion.div>

      {/* Main site content rendered naturally with entering transition */}
      <motion.div 
        className="relative z-30 w-full bg-[#0C0C0C]"
        initial={{ opacity: 0 }}
        animate={{ opacity: status === 'entered' ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {children}
      </motion.div>

    </div>
  );
};

export default ScrollExpandMedia;
