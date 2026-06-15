import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Flame, Scale, Thermometer, Award, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LabAnalysis() {
  const { t, language } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState<'shisha' | 'bbq' | 'hexagonal'>('shisha');

  const productReports = {
    bbq: {
      name: t('prod_name_bbq'),
      fixedCarbon: 76.4,
      ashContent: 3.2,
      moisture: 6.8,
      volatile: 13.6,
      calorific: '7,200 Kcal/kg',
      burnTime: language === 'ar' ? '٣ - ٤ ساعات' : (language === 'en' ? '3 - 4 Hours' : '3 - 4 Jam'),
      certifiedBy: 'SGS Indonesia S.A.',
    },
    shisha: {
      name: t('prod_name_shisha'),
      fixedCarbon: 82.5,
      ashContent: 1.9,
      moisture: 4.5,
      volatile: 11.1,
      calorific: '7,800 Kcal/kg',
      burnTime: language === 'ar' ? '٢.٥ ساعة (بدون دخان)' : (language === 'en' ? '2.5 Hours (Smokeless)' : '2.5 Jam (Tanpa Asap)'),
      certifiedBy: 'TÜV Rheinland Group',
    },
    hexagonal: {
      name: t('prod_name_hex'),
      fixedCarbon: 84.1,
      ashContent: 2.5,
      moisture: 4.0,
      volatile: 9.4,
      calorific: '8,100 Kcal/kg',
      burnTime: language === 'ar' ? '٤ - ٥ ساعات' : (language === 'en' ? '4 - 5 Hours' : '4 - 5 Jam'),
      certifiedBy: 'PT. Sucofindo (Persero)',
    },
  };

  const report = productReports[selectedProduct];

  const tabLabels = {
    shisha: 'Shisha',
    bbq: 'BBQ',
    hexagonal: 'Hexagonal',
  };

  return (
    <section className="py-24 bg-[#070709] border-t border-zinc-900 overflow-hidden relative">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Modern section headers */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-orange-500 font-display font-bold text-xs tracking-[0.25em] uppercase px-3 py-1 bg-orange-500/5 border border-orange-500/10 rounded-full">
            {t('lab_sub')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mt-6 leading-tight">
            {t('lab_title')}
          </h2>
          <p className="mt-4 text-zinc-400 font-light leading-relaxed">
            {t('lab_desc')}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-12 max-w-md mx-auto p-1.5 bg-[#0e0f12] border border-zinc-800 rounded-full">
          {(Object.keys(tabLabels) as Array<keyof typeof tabLabels>).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedProduct(key)}
              className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                selectedProduct === key
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              {tabLabels[key]}
            </button>
          ))}
        </div>

        {/* Certificate Deck Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Certificate Specifications (Left Col-7) */}
          <div className="lg:col-span-7 bg-[#0b0c0f] border border-zinc-900 rounded-3xl p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-7 w-7 text-green-500" />
                  <div className="text-left">
                    <h3 className="font-display font-bold text-lg text-white">{t('lab_proximate')}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{t('lab_cert_id')}{selectedProduct.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded bg-zinc-900 font-mono tracking-wider uppercase">
                    {t('lab_original_approved')}
                  </span>
                </div>
              </div>

              {/* Specs bars with custom animations */}
              <div className="space-y-6 text-left">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" /> {t('lab_fixed_carbon')}
                    </span>
                    <span className="font-bold text-white font-mono">{report.fixedCarbon}%</span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
                    <motion.div
                      key={selectedProduct + '_fc'}
                      initial={{ width: 0 }}
                      animate={{ width: `${report.fixedCarbon}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-orange-600 to-amber-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-zinc-500" /> {t('lab_ash_content')}
                    </span>
                    <span className="font-bold text-white font-mono">{report.ashContent}%</span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
                    <motion.div
                      key={selectedProduct + '_ac'}
                      initial={{ width: 0 }}
                      animate={{ width: `${report.ashContent * 10}%` }} // Adjusted visualization for low values
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" /> {t('lab_moisture')}
                    </span>
                    <span className="font-bold text-white font-mono">{report.moisture}%</span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
                    <motion.div
                      key={selectedProduct + '_m'}
                      initial={{ width: 0 }}
                      animate={{ width: `${report.moisture * 10}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-orange-400 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" /> {t('lab_volatile')}
                    </span>
                    <span className="font-bold text-white font-mono">{report.volatile}%</span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
                    <motion.div
                      key={selectedProduct + '_v'}
                      initial={{ width: 0 }}
                      animate={{ width: `${report.volatile * 3}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Footer Stamp */}
            <div className="border-t border-zinc-900 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-orange-500" />
                <span className="text-left">{t('lab_certified_by')}: <strong className="text-zinc-300 font-semibold">{report.certifiedBy}</strong></span>
              </div>
              <div className="text-zinc-400 flex items-center gap-1.5 font-semibold text-xs border border-green-500/30 bg-green-500/5 px-3 py-1.5 rounded-full text-green-400">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                {t('lab_global_passed')}
              </div>
            </div>

          </div>

          {/* Core Technical Highlights Cards right (Col-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between text-left">
            
            {/* Box 1: Calorific Value Card */}
            <div className="bg-[#0b0c0f] border border-zinc-900 rounded-3xl p-8 flex-1 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/20 transition-all">
              <div className="absolute top-0 right-0 p-8 h-20 w-20 text-orange-500/10 pointer-events-none group-hover:scale-110 transition-transform">
                <Flame className="h-full w-full" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{t('lab_calorific_title')}</span>
                <p className="mt-4 text-4xl sm:text-5xl font-display font-black text-white">{report.calorific}</p>
              </div>
              <p className="mt-4 text-sm text-zinc-400 font-light leading-relaxed">
                {t('lab_calorific_desc')}
              </p>
            </div>

            {/* Box 2: Long Combustion time Card */}
            <div className="bg-[#0b0c0f] border border-zinc-900 rounded-3xl p-8 flex-1 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/20 transition-all">
              <div className="absolute top-0 right-0 p-8 h-20 w-20 text-orange-500/10 pointer-events-none group-hover:scale-110 transition-transform">
                <Thermometer className="h-full w-full" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{t('lab_burntime_title')}</span>
                <p className="mt-4 text-4xl sm:text-5xl font-display font-black text-orange-500">{report.burnTime}</p>
              </div>
              <p className="mt-4 text-sm text-zinc-400 font-light leading-relaxed">
                {t('lab_burntime_desc')}
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
