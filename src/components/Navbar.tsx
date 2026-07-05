import { motion } from 'motion/react';
import { Menu, X, Flame, Search, ShoppingCart, ChevronDown, ArrowRight, Languages, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onOpenAdmin?: () => void;
}

export function Navbar({ onOpenAdmin }: NavbarProps) {
  const { language, setLanguage, isRtl, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('nav_home');
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { key: 'nav_home', name: t('nav_home'), href: '#home' },
    { key: 'nav_about', name: t('nav_about'), href: '#about' },
    { key: 'nav_products', name: t('nav_products'), href: '#products', hasDropdown: true },
    { key: 'nav_analysis', name: t('nav_analysis'), href: '#about' },
    { key: 'nav_contact', name: t('nav_contact'), href: '#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'py-0.5 shadow-md shadow-zinc-200/50 bg-white/95 border-b border-zinc-200/80 backdrop-blur-xl' : 'py-0 bg-[#030303]/80 border-b border-white/[0.04] backdrop-blur-xl'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-11' : 'h-13'}`}>
          
          {/* Logo Brand exactly like in the picture */}
          <div className={`flex-shrink-0 flex items-center transition-all duration-300 ${isScrolled ? 'gap-1.5' : 'gap-3'} group cursor-pointer`} onClick={() => { setActiveLink('nav_home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-md group-hover:scale-125 transition-transform duration-500" />
              <Flame className={`text-orange-500 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 animate-pulse ${isScrolled ? 'h-4.5 w-4.5' : 'h-6.5 w-6.5'}`} />
            </div>
            <div className="flex flex-col select-none">
              <span className={`font-display font-black tracking-wider leading-none transition-all duration-300 ${isScrolled ? 'text-zinc-900 text-[14px]' : 'text-white text-[18px]'}`}>
                PREMIUM
              </span>
              <span className={`font-sans font-bold text-orange-500 tracking-[0.3em] leading-none uppercase mt-0.5 transition-all duration-300 ${isScrolled ? 'text-[6.5px] mt-0.25' : 'text-[10px]'}`}>
                CHARCOAL
              </span>
            </div>
          </div>
          
          {/* Desktop Menu with Gorgeous Hover Capsules */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  onClick={() => setActiveLink(link.key)}
                  onMouseEnter={() => setHoveredLink(link.key)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative flex items-center gap-1 transition-all duration-300 ${
                    isScrolled ? 'px-2 py-1 text-[12.5px]' : 'px-3 py-1.5 text-[13px]'
                  } font-display font-medium tracking-wide transition-colors duration-300 ${
                    activeLink === link.key 
                      ? (isScrolled ? 'text-orange-600 font-semibold' : 'text-orange-500 font-semibold') 
                      : (isScrolled ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-400 hover:text-white')
                  }`}
                >
                  {/* Underlay Hover Capsule */}
                  {hoveredLink === link.key && (
                    <motion.div
                      layoutId="hoverCapsule"
                      className={`absolute inset-0 rounded-xl -z-10 ${isScrolled ? 'bg-zinc-100' : 'bg-white/[0.03]'}`}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  
                  <span>{link.name}</span>
                  {link.hasDropdown && <ChevronDown className={`opacity-70 transition-all duration-300 ${isScrolled ? 'h-3 w-3' : 'h-4 w-4'}`} />}
                  
                  {activeLink === link.key && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className={`absolute left-3 right-3 h-[2px] bg-gradient-to-r from-orange-600 to-amber-500 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.4)] transition-all duration-300 ${isScrolled ? 'bottom-[-1px]' : 'bottom-[-4px]'}`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right Controls: Language Toggle, Search, Cart, Pesan button */}
          <div className={`hidden md:flex items-center transition-all duration-300 ${isScrolled ? 'gap-1.5' : 'gap-2.5'}`}>
            
            {/* Premium Language Segmented Switcher */}
            <div className={`flex items-center rounded-full select-none transition-all duration-300 ${isScrolled ? 'bg-zinc-100 border border-zinc-200 p-0.25 font-normal' : 'bg-zinc-950/80 border border-zinc-800/80 p-0.75'} ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className={`transition-all duration-300 ${isScrolled ? 'text-zinc-400 p-0.5' : 'text-zinc-500 p-1.5'}`}>
                <Languages className={`transition-all duration-300 ${isScrolled ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'}`} />
              </span>
              {(['en', 'ar', 'fa', 'tr', 'id'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`font-display font-bold rounded-full transition-all duration-300 uppercase ${
                    isScrolled
                      ? 'px-1.5 py-0.25 text-[8px]'
                      : 'px-2.5 py-1 text-[10px] sm:text-xs'
                  } ${
                    language === lang
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20'
                      : (isScrolled ? 'text-zinc-500 hover:text-zinc-800' : 'text-zinc-500 hover:text-zinc-300')
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button className={`transition-colors rounded-full flex items-center justify-center transition-all duration-300 ${
              isScrolled 
                ? 'p-1 text-zinc-600 hover:text-orange-600 hover:bg-zinc-100' 
                : 'p-2 text-zinc-400 hover:text-orange-500 hover:bg-white/[0.03]'
            }`}>
              <Search className={`transition-all duration-300 ${isScrolled ? 'h-3 w-3' : 'h-4.5 w-4.5'}`} />
            </button>
            
            <button className={`relative transition-colors rounded-full flex items-center justify-center transition-all duration-300 ${
              isScrolled 
                ? 'p-1 text-zinc-600 hover:text-orange-600 hover:bg-zinc-100' 
                : 'p-2 text-zinc-400 hover:text-orange-500 hover:bg-white/[0.03]'
            }`}>
              <ShoppingCart className={`transition-all duration-300 ${isScrolled ? 'h-3 w-3' : 'h-4.5 w-4.5'}`} />
              <span className={`absolute bg-orange-600 text-white font-display font-black rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_10px_rgba(234,88,12,0.4)] ${
                isScrolled ? 'top-0 right-0 text-[7px] h-3 w-3' : 'top-0.5 right-0.5 text-[9px] h-4 w-4'
              }`}>
                2
              </span>
            </button>

            {onOpenAdmin && (
              <button 
                onClick={onOpenAdmin} 
                className={`transition-colors rounded-full cursor-pointer flex items-center justify-center transition-all duration-300 ${
                  isScrolled 
                    ? 'p-1 text-zinc-600 hover:text-orange-600 hover:bg-zinc-100' 
                    : 'p-2 text-zinc-400 hover:text-orange-500 hover:bg-white/[0.03]'
                }`}
                title="Admin SEO & Ads"
              >
                <Shield className={`text-orange-500 animate-pulse transition-all duration-300 ${isScrolled ? 'h-3 w-3' : 'h-4.5 w-4.5'}`} />
              </button>
            )}
            
            <a
              href="#contact"
              className={`relative overflow-hidden group bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-display font-black tracking-widest uppercase flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(234,88,12,0.25)] hover:shadow-[0_0_35px_rgba(234,88,12,0.55)] active:scale-95 ${
                isScrolled ? 'px-3 py-1.5 text-[9px]' : 'px-6 py-3 text-xs'
              }`}
            >
              <span className="relative z-10">{t('nav_order_now')}</span>
              <ArrowRight className={`relative z-10 transition-transform duration-300 ${isScrolled ? 'h-3 w-3' : 'h-4 w-4'} ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            </a>
          </div>
          
          {/* Mobile menu button and cart/search */}
          <div className="lg:hidden flex items-center gap-4">
            
            {/* Language switch on mobile directly on bar */}
            <div className={`flex items-center p-0.5 rounded-full transition-colors border ${isScrolled ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-950/80 border-zinc-850'}`}>
              {(['en', 'ar', 'fa', 'tr', 'id'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 text-[9px] font-display font-black rounded-full transition-all ${
                    language === lang
                      ? 'bg-orange-600 text-white shadow-sm'
                      : (isScrolled ? 'text-zinc-600 hover:text-zinc-950' : 'text-zinc-500 hover:text-zinc-300')
                  } uppercase`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button className={`relative p-2 rounded-full transition-colors ${isScrolled ? 'text-zinc-620 hover:text-orange-600 hover:bg-zinc-100' : 'text-zinc-400 hover:bg-white/[0.03]'}`}>
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 bg-orange-600 text-white font-display font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-xl focus:outline-none transition-colors ${
                isScrolled 
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-[#0a0a0d] border-b border-zinc-900"
        >
          <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => {
                  setIsOpen(false);
                  setActiveLink(link.key);
                }}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-display font-bold tracking-wider uppercase transition-all ${
                  activeLink === link.key ? 'text-orange-500 bg-orange-500/5 border border-orange-500/10' : 'text-zinc-300 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <span>{link.name}</span>
                {link.hasDropdown && <ChevronDown className="h-4 w-4 opacity-75" />}
              </a>
            ))}
            <div className="pt-4 px-4 border-t border-zinc-900 flex flex-col gap-4">
              <div className="flex gap-4 justify-between items-center">
                <button className="flex items-center gap-2.5 text-zinc-400 py-2">
                  <Search className="h-4.5 w-4.5 text-orange-500" />
                  <span className="text-xs uppercase font-display tracking-widest font-bold">{t('nav_search')}</span>
                </button>

                {onOpenAdmin && (
                  <button 
                    onClick={() => { setIsOpen(false); onOpenAdmin(); }}
                    className="flex items-center gap-2 text-orange-500 hover:text-white py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Shield className="h-4 w-4 animate-pulse animate-duration-1000" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>
              
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="bg-orange-600 hover:bg-orange-500 text-white py-3.5 px-4 rounded-xl text-xs font-display font-black tracking-widest uppercase text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.25)]"
              >
                <span>{t('nav_order_now')}</span>
                <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

