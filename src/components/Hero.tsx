import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Play, Leaf, ShieldAlert, Flame, Sparkles, X } from 'lucide-react';
// Hero background = the main product (Premium Block Briquette).
// To revert to the original charcoal bg: swap back to premium_charcoal_bg_1781161967608.png (copied to /backups).
import premiumCharcoalBg from '../assets/images/arang_briket_premium_1781099259500.webp';
import { useLanguage } from '../context/LanguageContext';
// Lazy — pulls in three.js only when the 3D simulator modal is opened.
const CharcoalCanvas3D = lazy(() => import('./CharcoalCanvas3D').then((m) => ({ default: m.CharcoalCanvas3D })));

export function Hero() {
  const { t, isRtl, language } = useLanguage();
  const [is3DOpen, setIs3DOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const simulatorLabel = 
    language === 'ar' ? 'استعراض مجسم ثلاثي الأبعاد' : 
    language === 'en' ? 'Interactive 3D Simulator' : 
    'Simulasi Arang 3D Interaktif';

  return (
    <div id="home" className="relative bg-[#030303] min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      
      {/* Full-Screen Immersive Parallax Charcoal Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          className="w-full h-full relative will-change-transform"
          style={{
            transform: `translateY(${scrollY * 0.32}px) scale(1.12)`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={premiumCharcoalBg}
            alt="Arang Premium Full Screen Background"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Warm ember glow so the product still reads as lit/burning. */}
        <div
          className="absolute inset-0 z-[6] pointer-events-none"
          style={{ background: 'radial-gradient(120% 85% at 50% 100%, rgba(234,88,12,0.42), rgba(150,35,0,0.14) 40%, transparent 66%)' }}
        />
        {/* Advanced Multi-Layer Gradient Overlays for Luxury look and pristine readability */}
        <div className={`absolute inset-y-0 ${isRtl ? 'right-0 bg-gradient-to-l lg:left-auto' : 'left-0 bg-gradient-to-r lg:right-auto'} w-full lg:w-[48%] from-[#030303] via-[#030303]/80 to-transparent z-10 hidden md:block`} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303] z-10" />
        <div className="absolute inset-0 bg-black/55 md:hidden block z-10" /> {/* Extra dark overlay on mobile for impeccable readability */}
        
        {/* Interactive Aesthetic Floating Ember Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {[...Array(12)].map((_, i) => {
            const delay = i * 0.7;
            const size = Math.max(2, (i % 3) * 2 + 1);
            const leftPos = `${15 + (i * 7.5)}%`;
            return (
              <motion.div
                key={i}
                initial={{ y: '105vh', opacity: 0, x: 0 }}
                animate={{
                  y: '-10vh',
                  opacity: [0, 0.75, 0.75, 0],
                  x: [0, (i % 2 === 0 ? 30 : -30), (i % 2 === 0 ? -15 : 15)],
                }}
                transition={{
                  duration: 8 + (i % 4) * 2,
                  repeat: Infinity,
                  delay: delay,
                  ease: 'linear',
                }}
                className="absolute rounded-full bg-gradient-to-t from-orange-600 to-amber-400 blur-[0.5px]"
                style={{
                  left: leftPos,
                  width: `${size}px`,
                  height: `${size}px`,
                  boxShadow: '0 0 10px rgba(234, 88, 12, 0.8)',
                }}
              />
            );
          })}
        </div>

        {/* Subtle warming glow around the text container area */}
        <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none z-10 animate-pulse duration-5000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-orange-500 font-sans font-extrabold text-[9px] sm:text-[10px] tracking-[0.3em] uppercase mb-6"
            >
              {t('hero_sub')}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-col gap-0.5"
            >
              <h1 className="text-5xl sm:text-[64px] lg:text-[80px] font-display font-[900] tracking-tighter text-white leading-[0.85]">
                {t('hero_title_1')}
              </h1>
              <h1 className="text-5xl sm:text-[64px] lg:text-[80px] font-display font-[900] tracking-tighter text-orange-500 leading-[0.85] bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t('hero_title_2')}
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-zinc-300 text-[13px] sm:text-[14px] max-w-xl leading-relaxed font-light"
            >
              {t('hero_desc')}
            </motion.p>
            
            {/* Action Buttons Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4 items-center"
            >
              <a
                href="#products"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-xs font-bold rounded-xl text-white bg-orange-600 hover:bg-orange-500 transition-all duration-300 shadow-[0_0_30px_rgba(234,88,12,0.35)] hover:shadow-[0_0_40px_rgba(234,88,12,0.55)]"
              >
                {t('hero_btn_products')} <ArrowRight className={`ml-2 h-4.5 w-4.5 ${isRtl ? 'rotate-180' : ''}`} />
              </a>

              <button
                onClick={() => setIs3DOpen(true)}
                className="inline-flex items-center justify-center px-6 py-3.5 border border-orange-500/30 text-xs font-bold rounded-xl text-orange-400 bg-orange-500/10 hover:bg-orange-600 hover:text-white hover:border-orange-500 transition-all duration-300 shadow-[0_0_20px_rgba(234,88,12,0.1)] hover:shadow-[0_0_30px_rgba(234,88,12,0.25)] cursor-pointer"
              >
                <Sparkles className="mr-2.5 h-4 w-4 text-orange-400 group-hover:text-white animate-pulse" /> {simulatorLabel}
              </button>
              
              <button
                className="inline-flex items-center justify-center px-6 py-3.5 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 bg-zinc-950/40 backdrop-blur-md hover:bg-zinc-900 hover:text-white hover:border-zinc-700 transition-all duration-300"
              >
                <Play className="mr-2.5 h-4 w-4 fill-current text-white" /> {t('hero_btn_video')}
              </button>
            </motion.div>

            {/* Unique horizontal badges with animated flame traversing the divider line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-14 pt-8 relative flex flex-wrap gap-x-10 gap-y-6 text-zinc-400"
            >
              {/* Elegant fire-colored divider line with a localized fire effect traveling across */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-orange-600/10 via-orange-500/45 to-orange-600/10 overflow-visible">
                <motion.div
                  initial={{ left: '-15%' }}
                  animate={{ left: '115%' }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-1/2 -translate-y-1/2 w-24 h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent flex items-center justify-center"
                >
                  {/* Outer glowing flame atmosphere */}
                  <div className="absolute w-12 h-12 rounded-full bg-orange-600/40 blur-lg" />
                  <div className="absolute w-4 h-4 rounded-full bg-amber-500/70 blur-md animate-pulse" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-white blur-[1px]" />
                  
                  {/* Flame micro-indicator */}
                  <div className="absolute -top-4 flex flex-col items-center">
                    <Flame className="h-4.5 w-4.5 text-orange-400 fill-orange-600/80 filter drop-shadow-[0_0_5px_rgba(234,88,12,0.8)] animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full blur-[1px] animate-ping" />
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">{t('hero_badge_env')}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-light">{t('hero_badge_env_sub')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">{t('hero_badge_burn')}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-light">{t('hero_badge_burn_sub')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">{t('hero_badge_guar')}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 font-light">{t('hero_badge_guar_sub')}</p>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Area is Empty of major columns to let the full background render clearly */}
          <div className="lg:col-span-5 relative self-stretch h-full hidden lg:block" />

        </div>
      </div>


      {/* 3D Simulation Popup Modal */}
      <AnimatePresence>
        {is3DOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIs3DOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg z-10"
            >
              <Suspense fallback={<div className="grid h-64 w-full place-items-center text-xs text-zinc-500">Memuat 3D…</div>}>
                <CharcoalCanvas3D onClose={() => setIs3DOpen(false)} />
              </Suspense>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

