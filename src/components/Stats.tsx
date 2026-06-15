import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Award, Clock, Users, Leaf, Flame, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ActiveParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

function StatCard({ item, index }: { item: any; index: number; key?: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });
  
  const [displayValue, setDisplayValue] = useState('0');
  const [isHovered, setIsHovered] = useState(false);
  const [hoverParticles, setHoverParticles] = useState<ActiveParticle[]>([]);

  // Smooth Count-Up Animater
  useEffect(() => {
    if (!isInView) return;

    // Parse the raw number and suffix from string
    // e.g. "100%" -> raw: 100, suffix: "%"
    // e.g. "8+ Jam" o r "8+ Hours" -> raw: 8, prefix/suffix
    // e.g. "1,000+" or "1000+" -> raw: 1000, suffix: "+"
    const valueStr = item.value;
    
    // Check if it's purely textual (e.g. "Eco Friendly")
    const hasDigits = /\d+/.test(valueStr);
    if (!hasDigits) {
      setDisplayValue(valueStr);
      return;
    }

    // Extract digits
    const cleanedNumStr = valueStr.replace(/[^0-9]/g, '');
    const targetNum = parseInt(cleanedNumStr, 10) || 0;
    
    // Remake suffix (everything after/around the digits)
    const suffix = valueStr.replace(/[0-9,]/g, '');

    let current = 0;
    const duration = 1600; // milliseconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      current = Math.round(easeProgress * targetNum);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplayValue(valueStr); // finalize with precise translated label
      } else {
        // Format with comma if target is >= 1000
        const formattedNum = targetNum >= 1000 
          ? current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          : current.toString();
        setDisplayValue(`${formattedNum}${suffix}`);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [isInView, item.value]);

  // Periodic particle spawner when hovered
  useEffect(() => {
    if (!isHovered) {
      setHoverParticles([]);
      return;
    }

    const interval = setInterval(() => {
      setHoverParticles((prev) => {
        const id = Math.random();
        const newParticle: ActiveParticle = {
          id,
          x: 10 + Math.random() * 80, // percentage of card width
          y: 90, // starts near bottom
          size: 2 + Math.random() * 4,
          duration: 1.5 + Math.random() * 1.5,
        };
        // Keep at most 15 active particles for lightweight smooth performance
        return [...prev.slice(-14), newParticle];
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', damping: 20, stiffness: 100, delay: index * 0.12 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-gradient-to-b from-zinc-950/70 to-zinc-950/40 hover:from-zinc-950 hover:to-zinc-900/60 transition-all duration-500 rounded-3xl border border-zinc-900/75 hover:border-orange-500/35 p-6 sm:p-7 overflow-hidden group shadow-[0_10px_35px_-12px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_rgba(234,88,12,0.12)] cursor-pointer"
    >
      {/* Dynamic Animated Ambient Glow inside each card */}
      <div 
        className="absolute inset-0 bg-radial-gradient from-orange-600/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 120%, rgba(234, 88, 12, 0.08) 0%, transparent 65%)'
        }}
      />

      {/* Decorative Golden Corner Accents on Card Hover */}
      <span className="absolute top-0 left-0 w-3 h-[1px] bg-orange-500/0 group-hover:bg-orange-500/60 transition-all duration-500" />
      <span className="absolute top-0 left-0 w-[1px] h-3 bg-orange-500/0 group-hover:bg-orange-500/60 transition-all duration-500" />
      <span className="absolute bottom-0 right-0 w-3 h-[1px] bg-orange-500/0 group-hover:bg-orange-500/60 transition-all duration-500" />
      <span className="absolute bottom-0 right-0 w-[1px] h-3 bg-orange-500/0 group-hover:bg-orange-500/60 transition-all duration-500" />

      {/* Interactive Micro Sparks Rising on Card Hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence>
          {hoverParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: '100%', opacity: 0, x: `${p.x}%` }}
              animate={{ 
                y: '-20%', 
                opacity: [0, 0.9, 0.9, 0],
                x: `${p.x + (Math.sin(p.id * 10) * 10)}%`
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, ease: 'easeOut' }}
              className="absolute rounded-full bg-gradient-to-t from-orange-600 to-amber-400 blur-[0.2px]"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                boxShadow: '0 0 8px rgba(234, 88, 12, 0.7)',
                bottom: '10px',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center sm:items-start sm:text-left h-full justify-between">
        {/* Animated Badge Icon Container */}
        <div className="mb-6 flex-shrink-0 relative">
          <motion.div
            animate={isHovered ? {
              scale: [1, 1.15, 1.1],
              rotate: [0, -5, 5, 0],
            } : {}}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-14 w-14 rounded-2xl border border-zinc-800/80 bg-zinc-950/85 flex items-center justify-center text-orange-500 group-hover:text-white group-hover:border-orange-500/50 group-hover:bg-gradient-to-b group-hover:from-orange-600 group-hover:to-orange-500 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.6)] group-hover:shadow-[0_0_25px_rgba(234,88,12,0.45)]"
          >
            <item.icon className="h-6 w-6 transition-all duration-300" />
          </motion.div>

          {/* Sparkler indicator behind main badge */}
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-orange-600 flex items-center justify-center border border-zinc-950 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Descriptive metadata section */}
        <div className="flex flex-col flex-1 mt-auto">
          {/* Animated counter number */}
          <motion.span 
            className="text-3xl sm:text-4xl font-display font-black text-white leading-none tracking-tight flex items-baseline justify-center sm:justify-start gap-1 font-sans"
            animate={isHovered ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            {displayValue}
          </motion.span>

          {/* Subtitle key name */}
          <span className="text-sm font-bold text-orange-500 mt-2 tracking-wide uppercase group-hover:text-amber-400 transition-colors duration-300">
            {item.title}
          </span>

          {/* Detailed text info line */}
          <p className="text-xs text-zinc-400 mt-2.5 font-light leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
            {item.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Stats() {
  const { t } = useLanguage();

  const statsData = [
    {
      icon: Award,
      value: t('stats_1_val'),
      title: t('stats_1_title'),
      desc: t('stats_1_desc'),
    },
    {
      icon: Clock,
      value: t('stats_2_val'),
      title: t('stats_2_title'),
      desc: t('stats_2_desc'),
    },
    {
      icon: Users,
      value: t('stats_3_val'),
      title: t('stats_3_title'),
      desc: t('stats_3_desc'),
    },
    {
      icon: Leaf,
      value: t('stats_4_val'),
      title: t('stats_4_title'),
      desc: t('stats_4_desc'),
    },
  ];

  return (
    <div className="bg-[#030304] border-y border-zinc-900/60 pt-10 pb-24 sm:pt-12 sm:pb-28 relative overflow-hidden">
      {/* Luxury Cinematic Grid & Ember Background Details */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.035)_0%,transparent_70%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Subtle decorative top tag */}
        <div className="flex justify-center mb-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-600 border border-orange-500 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest font-bold text-white uppercase">PREMIUM COAL PERFORMANCE</span>
          </motion.div>
        </div>

        {/* 4-Bento Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {statsData.map((item, index) => (
            <StatCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

