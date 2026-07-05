import { Flame, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="bg-zinc-950 py-12 border-t border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="font-display font-black text-lg tracking-wider text-white">
              ARANG<span className="text-orange-500 font-sans text-xs font-semibold tracking-widest uppercase ml-1">PREMIUM</span>
            </span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#home" className="text-zinc-500 hover:text-white text-sm px-2">{t('nav_home')}</a>
            <a href="#about" className="text-zinc-500 hover:text-white text-sm px-2">{t('nav_about')}</a>
            <a href="#products" className="text-zinc-500 hover:text-white text-sm px-2">{t('nav_products')}</a>
            <a href="#contact" className="text-zinc-500 hover:text-white text-sm px-2">{t('nav_contact')}</a>
            {onOpenAdmin && (
              <button 
                onClick={onOpenAdmin}
                className="text-zinc-500 hover:text-orange-500 text-sm px-2 flex items-center gap-1 cursor-pointer transition-colors"
                id="footer-admin-btn"
              >
                <Shield className="h-3 w-3 text-orange-500" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-8 border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Bricket Charcoal Indonesia. {t('footer_rights')}.</p>
          <p className="mt-2 md:mt-0 font-light">{t('footer_tagline')}</p>
        </div>
      </div>
    </footer>
  );
}

