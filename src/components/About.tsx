import { motion } from 'motion/react';
import { Leaf, Award, ShieldCheck, Waves, ClipboardCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function About() {
  const { t } = useLanguage();

  const productionSteps = [
    {
      num: '01',
      title: t('step_1_title'),
      desc: t('step_1_desc'),
    },
    {
      num: '02',
      title: t('step_2_title'),
      desc: t('step_2_desc'),
    },
    {
      num: '03',
      title: t('step_3_title'),
      desc: t('step_3_desc'),
    },
    {
      num: '04',
      title: t('step_4_title'),
      desc: t('step_4_desc'),
    },
    {
      num: '05',
      title: t('step_5_title'),
      desc: t('step_5_desc'),
    },
  ];

  return (
    <div id="about" className="py-32 bg-[#09090b] relative border-t border-zinc-900">
      
      {/* Decorative side lights */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Superiority and sustainability grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Block: Corporate Story */}
          <div>
            <span className="text-orange-500 font-display font-bold text-xs tracking-[0.25em] uppercase">
              {t('about_sub')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white mt-4 leading-[1.1]">
              {t('about_title')}
            </h2>
            
            <p className="mt-6 text-zinc-400 font-light text-base sm:text-lg leading-relaxed">
              {t('about_desc_1')}
            </p>

            <p className="mt-4 text-zinc-500 font-light text-sm leading-relaxed">
              {t('about_desc_2')}
            </p>

            <div className="grid grid-cols-2 gap-6 mt-12 pt-8 border-t border-zinc-900">
              <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-900">
                <span className="text-orange-500 font-display font-black text-2xl sm:text-3xl">{t('about_stat_1_val')}</span>
                <p className="text-sm font-semibold text-white mt-1">{t('about_stat_1_title')}</p>
                <p className="text-xs text-zinc-500 mt-1">{t('about_stat_1_desc')}</p>
              </div>
              <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-900">
                <span className="text-orange-500 font-display font-black text-2xl sm:text-3xl">{t('about_stat_2_val')}</span>
                <p className="text-sm font-semibold text-white mt-1">{t('about_stat_2_title')}</p>
                <p className="text-xs text-zinc-500 mt-1">{t('about_stat_2_desc')}</p>
              </div>
            </div>
          </div>

          {/* Right Block: Interactive Process Checklist */}
          <div className="bg-[#0c0d10] border border-zinc-900 p-8 sm:p-10 rounded-3xl">
            <span className="text-xs text-zinc-500 uppercase font-black tracking-widest flex items-center gap-2 mb-6">
              <ClipboardCheck className="h-4.5 w-4.5 text-orange-500" /> {t('about_flow_title')}
            </span>
            
            <div className="space-y-6">
              {productionSteps.map((step) => (
                <div key={step.num} className="flex gap-4 group">
                  <div className="font-display font-black text-lg text-orange-500/30 group-hover:text-orange-500 transition-colors shrink-0 mt-0.5 font-mono">
                    {step.num}
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white leading-none">{step.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-semibold text-green-400">
                <Sparkles className="h-4 w-4 animate-pulse" /> {t('about_certified')}
              </span>
              <span>{t('about_audit')}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
