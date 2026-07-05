import { useState } from 'react';
import { motion } from 'motion/react';
import { Ship, Globe, FileText, CheckCircle, Compass, Anchor, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function ExportLogistics() {
  const { t, language, isRtl } = useLanguage();
  const [activePort, setActivePort] = useState(0);

  // language-keyed value with English fallback (covers fa/tr which have no
  // bespoke string here — English is the primary language, never Indonesian).
  const L = (ar: string, en: string, id: string) =>
    language === 'ar' ? ar : language === 'id' ? id : en;

  const destinations = [
    {
      region: L('الشرق الأوسط', 'Middle East', 'Timur Tengah'),
      port: 'Jeddah Islamic Port',
      time: L('١٨ يوماً', '18 Days', '18 Hari'),
      vol: L('١٢٠+ حاوية / شهرياً', '120+ Containers / Mo', '120+ Kontainer / Bln'),
      docs: 'SGS Audit, Certificate of Origin, Phytosanitary, MSDS',
    },
    {
      region: L('شمال أوروبا', 'North Europe', 'Eropa Utara'),
      port: 'Port of Rotterdam',
      time: L('٢٦ يوماً', '26 Days', '26 Hari'),
      vol: L('٨٠+ حاوية / شهرياً', '80+ Containers / Mo', '80+ Kontainer / Bln'),
      docs: 'MSDS, REACH Registration, V-Legal Timber Certificate',
    },
    {
      region: L('شرق آسيا', 'East Asia', 'Asia Timur'),
      port: 'Tokyo Bay Port',
      time: L('٩ أيام', '9 Days', '9 Hari'),
      vol: L('١٥٠+ حاوية / شهرياً', '150+ Containers / Mo', '150+ Kontainer / Bln'),
      docs: 'Phytosanitary Certificate, Custom Clearance approval',
    },
    {
      region: L('أمريكا الشمالية', 'North America', 'Amerika Utara'),
      port: 'Los Angeles Port',
      time: L('٢٤ يوماً', '24 Days', '24 Hari'),
      vol: L('٦٠+ حاوية / شهرياً', '60+ Containers / Mo', '60+ Kontainer / Bln'),
      docs: 'Fumigation Certificate, Ocean Bill of Lading, MSDS',
    },
  ];

  return (
    <section className="py-24 bg-[#050507] border-t border-zinc-900 relative overflow-hidden">
      
      {/* Dynamic ambient grid decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Dynamic header container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 text-left">
          <div className="lg:col-span-8">
            <span className="text-orange-500 font-display font-bold text-xs tracking-[0.25em] uppercase">
              {t('log_sub')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white mt-4 leading-tight">
              {t('log_title')}
            </h2>
          </div>
          <div className="lg:col-span-4 col-start-1">
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              {t('log_desc')}
            </p>
          </div>
        </div>

        {/* Global Hubs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Ports Navigation column (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1 px-1">
              {t('log_frequent_port')}
            </span>
            {destinations.map((dest, idx) => (
              <button
                key={dest.port}
                onClick={() => setActivePort(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                  activePort === idx
                    ? 'bg-[#0f1014] border-orange-500/30 text-white shadow-xl shadow-orange-500/5'
                    : 'bg-transparent border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white'
                }`}
                style={{ direction: 'ltr' }} // keep ports aligned cleanly for international reading
              >
                <div>
                  <p className="text-xs font-bold text-orange-500 tracking-wider uppercase">{dest.region}</p>
                  <p className="text-base font-display font-semibold mt-1 group-hover:translate-x-1 transition-transform">{dest.port}</p>
                </div>
                <Anchor className={`h-5 w-5 transition-transform shrink-0 ${activePort === idx ? 'text-orange-500 rotate-45' : 'text-zinc-600'}`} />
              </button>
            ))}
          </div>

          {/* Interactive Routing Detail Board (Col 8) */}
          <div className="lg:col-span-8 bg-[#0c0d10] border border-zinc-900 rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 p-8 text-orange-500/5 pointer-events-none">
              <Globe className="h-64 w-64 animate-spin-slow" />
            </div>

            <div className="relative z-10">
              
              {/* Header inside detail */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 mb-8 gap-4 text-left">
                <div>
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">{t('log_peta')}</span>
                  <p className="text-2xl font-display font-bold text-white mt-1">
                    Jakarta (JKT) <ArrowRight className="inline h-5 w-5 text-orange-500 mx-2" /> {destinations[activePort].port}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-4 py-2 rounded-full justify-center">
                  <Ship className="h-4 w-4" />
                  {t('log_transit_estimate')}: {destinations[activePort].time}
                </div>
              </div>

              {/* Information body grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* Volume & Load specs */}
                <div className="space-y-6">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase font-semibold block">{t('log_recurrent_volume')}</span>
                    <p className="text-2xl font-display font-bold text-white mt-1">{destinations[activePort].vol}</p>
                    <p className="text-xs text-zinc-400 mt-2 font-light">{t('log_recurrent_desc')}</p>
                  </div>

                  <div>
                    <span className="text-xs text-zinc-500 uppercase font-semibold block">{t('log_vessel_type')}</span>
                    <p className="text-[13px] text-zinc-300 mt-1 font-semibold">20ft Dry Cargo Container / 40ft High Cube Container</p>
                    <p className="text-xs text-zinc-400 mt-1 font-light">{t('log_vessel_desc')}</p>
                  </div>
                </div>

                {/* Certificates specs checklist */}
                <div className="bg-zinc-950/70 p-6 rounded-2xl border border-zinc-900">
                  <span className="text-xs text-orange-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4" /> {t('log_docs_cleanclear')}
                  </span>
                  
                  <div className="space-y-3">
                    {destinations[activePort].docs.split(', ').map((doc) => (
                      <div key={doc} className="flex items-start gap-2.5 text-xs text-zinc-300 justify-start">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-tight font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-900 text-[11px] text-zinc-500 leading-relaxed font-light">
                    {t('log_non_dg_remark')}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom corporate quote guarantee */}
            <div className="mt-8 pt-6 border-t border-zinc-900 text-xs text-zinc-500 flex items-center gap-2 font-mono justify-start">
              <Compass className="h-4 w-4 text-orange-500" />
              <span>{t('log_guarantee')}</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
