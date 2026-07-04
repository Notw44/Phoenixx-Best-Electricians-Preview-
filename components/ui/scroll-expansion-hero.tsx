import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent,
  WheelEvent,
} from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  
  // High performance animation tracking refs to prevent constant re-binding of event listeners on scroll ticks
  const progressRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const mediaFullyExpandedRef = useRef<boolean>(false);

  // Create a Framer Motion motion value for progress
  const progressValue = useMotionValue(0);

  // Smooth out the scroll progress using a spring configured for a highly luxurious feel (higher damping, lower stiffness)
  const smoothProgress = useSpring(progressValue, {
    damping: 40,
    stiffness: 110,
    mass: 1.0,
  });

  useEffect(() => {
    progressRef.current = 0;
    progressValue.set(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
    mediaFullyExpandedRef.current = false;
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpandedRef.current && e.deltaY < 0 && window.scrollY <= 5) {
        mediaFullyExpandedRef.current = false;
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpandedRef.current) {
        e.preventDefault();
        // Lower sensitivity delta multiplier for smooth, deliberate wheel tracking
        const scrollDelta = e.deltaY * 0.0006;
        const newProgress = Math.min(
          Math.max(progressRef.current + scrollDelta, 0),
          1
        );
        progressRef.current = newProgress;
        progressValue.set(newProgress);

        if (newProgress >= 1) {
          mediaFullyExpandedRef.current = true;
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartYRef.current) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchY;

      if (mediaFullyExpandedRef.current && deltaY < -20 && window.scrollY <= 5) {
        mediaFullyExpandedRef.current = false;
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpandedRef.current) {
        e.preventDefault();
        // Custom deliberate scroll response speeds for mobile touch tracking
        const scrollFactor = deltaY < 0 ? 0.005 : 0.003;
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(progressRef.current + scrollDelta, 0),
          1
        );
        progressRef.current = newProgress;
        progressValue.set(newProgress);

        if (newProgress >= 1) {
          mediaFullyExpandedRef.current = true;
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        touchStartYRef.current = touchY;
      }
    };

    const handleTouchEnd = (): void => {
      touchStartYRef.current = 0;
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpandedRef.current) {
        if (window.scrollY > 10) {
          progressRef.current = 1;
          progressValue.set(1);
          mediaFullyExpandedRef.current = true;
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else {
          window.scrollTo(0, 0);
        }
      }
    };

    window.addEventListener('wheel', handleWheel as unknown as EventListener, {
      passive: false,
    });
    window.addEventListener('scroll', handleScroll as EventListener);
    window.addEventListener(
      'touchstart',
      handleTouchStart as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener(
      'touchmove',
      handleTouchMove as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      window.removeEventListener(
        'wheel',
        handleWheel as unknown as EventListener
      );
      window.removeEventListener('scroll', handleScroll as EventListener);
      window.removeEventListener(
        'touchstart',
        handleTouchStart as unknown as EventListener
      );
      window.removeEventListener(
        'touchmove',
        handleTouchMove as unknown as EventListener
      );
      window.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, []);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Transform width and height of the thermostat container dynamically & smoothly
  const mediaWidth = useTransform(
    smoothProgress,
    [0, 1],
    [320, isMobileState ? 900 : 1400]
  );
  
  const mediaHeight = useTransform(
    smoothProgress,
    [0, 1],
    [420, isMobileState ? 600 : 800]
  );

  // Animated text horizontal slide (fly-out animation)
  const translateXLeft = useTransform(
    smoothProgress,
    [0, 1],
    ['0vw', `-${isMobileState ? 120 : 100}vw`]
  );
  
  const translateXRight = useTransform(
    smoothProgress,
    [0, 1],
    ['0vw', `${isMobileState ? 120 : 100}vw`]
  );

  // Fade out ambient background image smoothly
  const bgOpacity = useTransform(smoothProgress, [0, 1], [1, 0]);

  // Subtly lighten black overlay as the card expands
  const overlayOpacity = useTransform(smoothProgress, [0, 1], [0.65, 0.25]);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden'
    >
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full'
            style={{ opacity: bgOpacity }}
          >
            <img
              src={bgImageSrc}
              alt='Background'
              className='w-screen h-screen object-cover object-center'
              referrerPolicy="no-referrer"
            />
            <div className='absolute inset-0 bg-black/10' />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              
              {/* Thermostat / Media Container */}
              <motion.div
                className='absolute left-1/2 top-1/2 rounded-2xl overflow-hidden'
                style={{
                  width: mediaWidth,
                  height: mediaHeight,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 25px 60px rgba(0, 0, 0, 0.6)',
                  x: '-50%',
                  y: '-50%',
                }}
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
                        className='w-full h-full border-0'
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
                  style={{ opacity: overlayOpacity }}
                />

              </motion.div>

              {/* Typography Overlay centered OVER the thermostat but allowed to overflow horizontally so letters don't get clipped */}
              <div 
                className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col justify-between items-center text-center pointer-events-none select-none w-screen p-4 sm:p-6 md:p-12 overflow-visible'
                style={{
                  height: mediaHeight,
                  maxHeight: '85vh',
                }}
              >
                
                {/* Top: Date / Brand Note */}
                <div className='overflow-visible py-1'>
                  {date && (
                    <motion.p
                      className='text-xs sm:text-sm font-mono tracking-[0.35em] uppercase text-[#FDE047] font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] whitespace-nowrap'
                      style={{ x: translateXLeft }}
                    >
                      {date}
                    </motion.p>
                  )}
                </div>

                {/* Middle: Title text - ELITE CRAFTSMANSHIP */}
                <div className='flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 py-4 w-full overflow-visible'>
                  <motion.h2
                    className='font-sans text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light uppercase tracking-[0.4em] text-white/95 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] whitespace-nowrap'
                    style={{ x: translateXLeft }}
                  >
                    {firstWord}
                  </motion.h2>
                  <motion.h2
                    className='font-sans text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.2em] text-[#FDE047] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] whitespace-nowrap -mr-[0.2em]'
                    style={{ x: translateXRight }}
                  >
                    {restOfTitle}
                  </motion.h2>
                </div>

                {/* Bottom: Action Hint */}
                <div className='overflow-visible py-1'>
                  {scrollToExpand && (
                    <motion.p
                      className='text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase text-white/60 font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] whitespace-nowrap'
                      style={{ x: translateXRight }}
                    >
                      {scrollToExpand}
                    </motion.p>
                  )}
                </div>

              </div>

            </div>

            {/* Site Content (Fades in once media is expanded) */}
            <motion.section
              className='flex flex-col w-full'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              style={{ pointerEvents: showContent ? 'auto' : 'none' }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
