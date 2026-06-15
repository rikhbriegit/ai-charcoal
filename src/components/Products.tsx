import { motion } from 'motion/react';
import { ArrowLeftRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import imgBbq from '../assets/images/arang_bbq_premium_1781099214559.png';
import imgShisha from '../assets/images/arang_shisha_premium_1781099230205.png';
import imgHexagonal from '../assets/images/arang_hexagonal_1781099245194.png';
import imgBriket from '../assets/images/arang_briket_premium_1781099259500.png';
import { useLanguage } from '../context/LanguageContext';

export function Products() {
  const { t, isRtl } = useLanguage();

  const products = [
    {
      id: 1,
      name: t('prod_name_bbq'),
      spec: t('prod_spec_bbq'),
      price: 'Rp 35.000',
      unit: t('prod_unit_2kg'),
      image: imgBbq,
    },
    {
      id: 2,
      name: t('prod_name_shisha'),
      spec: t('prod_spec_shisha'),
      price: 'Rp 30.000',
      unit: t('prod_unit_1kg'),
      image: imgShisha,
    },
    {
      id: 3,
      name: t('prod_name_hex'),
      spec: t('prod_spec_hex'),
      price: 'Rp 45.000',
      unit: t('prod_unit_2kg'),
      image: imgHexagonal,
    },
    {
      id: 4,
      name: t('prod_name_briquet'),
      spec: t('prod_spec_briquet'),
      price: 'Rp 32.000',
      unit: t('prod_unit_2kg'),
      image: imgBriket,
    },
  ];

  return (
    <div id="products" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper Grid Layout: Info Left, Catalog Cards right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Header left (col-span-3) */}
          <div className="lg:col-span-3 lg:sticky lg:top-28 text-left">
            <span className="text-orange-500 font-display font-bold text-xs tracking-[0.2em] uppercase">
              {t('prod_sub')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight mt-3">
              {t('prod_title')}
            </h2>
            <p className="mt-4 text-sm text-zinc-400 font-light leading-relaxed">
              {t('prod_desc')}
            </p>
            
            <a
              href="#contact"
              className="inline-flex mt-8 items-center px-5 py-3 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900 text-xs font-semibold rounded-lg text-white transition-all gap-2"
            >
              <span>{t('prod_view_all')}</span>
              <ArrowRight className={`h-3.5 w-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </a>
          </div>

          {/* Cards Right (col-span-9) */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {products.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-[#0e0f12] rounded-2xl overflow-hidden border border-zinc-900 hover:border-zinc-800 transition-all duration-300 flex flex-col"
              >
                {/* Image Showcase */}
                <div className="aspect-[4/3] bg-zinc-950 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-transparent to-transparent z-10" />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-display font-bold text-base text-zinc-100 group-hover:text-orange-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 font-light">
                      {item.spec}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-orange-500 font-display font-black text-base sm:text-lg">
                        {item.price}
                      </span>
                      <span className="text-zinc-500 text-[10px]">
                        {item.unit}
                      </span>
                    </div>

                    <a
                      href="#contact"
                      className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 group-hover:bg-orange-600 group-hover:border-transparent text-zinc-400 group-hover:text-white flex items-center justify-center transition-all shadow-sm"
                    >
                      <ArrowUpRight className={`h-4 w-4 ${isRtl ? 'rotate-270' : ''}`} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

