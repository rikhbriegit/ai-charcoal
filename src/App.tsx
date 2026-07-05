/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { About } from './components/About';
import { LabAnalysis } from './components/LabAnalysis';
import { Products } from './components/Products';
import { ExportLogistics } from './components/ExportLogistics';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { SeoAdsProvider } from './context/SeoAdsContext';
import { SeoAdsAdmin } from './components/SeoAdsAdmin';
import { AiChatWidget } from './components/AiChatWidget';

function AppContent() {
  const { isRtl } = useLanguage();
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');

  const navigateTo = (view: 'landing' | 'admin') => {
    // Gate the admin panel behind a password. It only writes to the visitor's own
    // localStorage (no server privilege), so a client-side gate is proportionate.
    if (view === 'admin') {
      const expected = (import.meta as any).env?.VITE_ADMIN_PASSWORD;
      // No password configured at build → admin disabled entirely. We NEVER ship a
      // usable hard-coded default (it would be readable in the JS bundle).
      if (!expected) {
        window.alert('Panel admin dinonaktifkan (VITE_ADMIN_PASSWORD belum di-set saat build).');
        return;
      }
      const okUntil = Number(sessionStorage.getItem('admin_ok_until') || 0);
      if (Date.now() > okUntil) {
        const entered = window.prompt('Masukkan password admin:');
        if (entered !== expected) {
          if (entered !== null) window.alert('Password salah.');
          return;
        }
        // Session valid for 30 minutes, then re-prompt.
        sessionStorage.setItem('admin_ok_until', String(Date.now() + 30 * 60 * 1000));
      }
    }
    setCurrentView(view);
    window.scrollTo({ top: 0 });
  };

  // PowerPoint-style arrow-key section transitions
  useEffect(() => {
    if (currentView !== 'landing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if user is actively typing in inputs, textareas, or contenteditables
      const activeEl = document.activeElement;
      if (activeEl) {
        const tagName = activeEl.tagName.toLowerCase();
        const contentEditable = activeEl.getAttribute('contenteditable');
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          contentEditable === 'true' ||
          contentEditable === ''
        ) {
          return;
        }
      }

      // PowerPoint next and prev navigation triggers
      const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown';
      const isPrev = e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp';

      if (!isNext && !isPrev) return;

      // Intercept original browser scroll jump
      e.preventDefault();

      const slides = Array.from(document.querySelectorAll('[data-slide="true"]')) as HTMLElement[];
      if (slides.length === 0) return;

      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const currentScrollY = window.scrollY;

      // Identify the current slide based on nearest viewport top position
      let currentActiveIndex = 0;
      let minDistance = Infinity;

      slides.forEach((slide, index) => {
        const slideY = slide.getBoundingClientRect().top + window.scrollY;
        const dist = Math.abs(slideY - currentScrollY - navbarHeight);
        if (dist < minDistance) {
          minDistance = dist;
          currentActiveIndex = index;
        }
      });

      // Target section calculation matching slides transition boundaries
      let targetIndex = currentActiveIndex;

      if (isNext) {
        const currentSlideY = slides[currentActiveIndex].getBoundingClientRect().top + window.scrollY;
        // If we are currently scrolled above the start of the current closest section, target it
        if (currentScrollY + navbarHeight + 15 < currentSlideY) {
          targetIndex = currentActiveIndex;
        } else if (currentActiveIndex < slides.length - 1) {
          targetIndex = currentActiveIndex + 1;
        }
      } else if (isPrev) {
        const currentSlideY = slides[currentActiveIndex].getBoundingClientRect().top + window.scrollY;
        // If we are currently scrolled below the start of the current closest section, align back to its start first
        if (currentScrollY + navbarHeight - 15 > currentSlideY) {
          targetIndex = currentActiveIndex;
        } else if (currentActiveIndex > 0) {
          targetIndex = currentActiveIndex - 1;
        }
      }

      // Elegant smooth scroll scroll placement
      const targetSlide = slides[targetIndex];
      const targetSlideY = targetSlide.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: Math.max(0, targetSlideY - navbarHeight + 1),
        behavior: 'smooth'
      });
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);
  
  if (currentView === 'admin') {
    return (
      <div 
        className="min-h-screen bg-zinc-950 font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden" 
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <SeoAdsAdmin onClose={() => navigateTo('landing')} />
      </div>
    );
  }

  return (
    <div 
       className="min-h-screen bg-zinc-950 font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden" 
       dir={isRtl ? 'rtl' : 'ltr'}
    >
      <Navbar onOpenAdmin={() => navigateTo('admin')} />
      <main>
        <div data-slide="true" id="home"><Hero /></div>
        <div data-slide="true" id="stats"><Stats /></div>
        <div data-slide="true" id="about"><About /></div>
        <div data-slide="true" id="lab"><LabAnalysis /></div>
        <div data-slide="true" id="products"><Products /></div>
        <div data-slide="true" id="logistics"><ExportLogistics /></div>
        <div data-slide="true" id="contact"><Contact /></div>
      </main>
      <Footer onOpenAdmin={() => navigateTo('admin')} />
      <AiChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SeoAdsProvider>
        <AppContent />
      </SeoAdsProvider>
    </LanguageProvider>
  );
}
