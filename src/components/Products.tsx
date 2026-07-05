import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import cocoCube from '../assets/images/coco_cube.webp';
import cocoCubeH from '../assets/images/coco_cubeh.webp';
import cocoCubeHole from '../assets/images/coco_cubehole.webp';
import cocoRectangle from '../assets/images/coco_rectangle.webp';
import cocoHexagon from '../assets/images/coco_hexagon.webp';
import cocoHexFlower from '../assets/images/coco_hexflower.webp';
import cocoHalfFinger from '../assets/images/coco_halffinger.webp';
import { useLanguage } from '../context/LanguageContext';

export function Products() {
  const { t, isRtl, language } = useLanguage();

  // Full catalog from worldthecoco.com/our-product (same company). Product names
  // and sizes are universal; the spec labels follow the site language.
  const L: Record<string, { common: string[]; capLabel: string; capShisha: string; capBbq: string; inquiry: string }> = {
    id: { common: ['Abu 1.9% (maks 2.5%), warna putih', 'Kadar air maks 6%', 'Bakar 60–120 menit', 'Karbon tetap min 80%', 'Bahan: arang batok kelapa murni'], capLabel: 'Kapasitas / kontainer', capShisha: '16 ton (20ft) / 25 ton (40ft)', capBbq: '18 ton (20ft) / 25 ton (40ft)', inquiry: 'Minta penawaran' },
    en: { common: ['Ash 1.9% (max 2.5%), white', 'Moisture max 6%', 'Burns 60–120 minutes', 'Fixed carbon min 80%', 'Material: pure coconut-shell charcoal'], capLabel: 'Capacity / container', capShisha: '16 tons (20ft) / 25 tons (40ft)', capBbq: '18 tons (20ft) / 25 tons (40ft)', inquiry: 'Request a quote' },
    ar: { common: ['رماد 1.9٪ (بحد أقصى 2.5٪)، أبيض', 'رطوبة بحد أقصى 6٪', 'اشتعال 60–120 دقيقة', 'كربون ثابت 80٪ كحد أدنى', 'المادة: فحم قشر جوز الهند النقي'], capLabel: 'السعة / الحاوية', capShisha: '16 طن (20 قدم) / 25 طن (40 قدم)', capBbq: '18 طن (20 قدم) / 25 طن (40 قدم)', inquiry: 'اطلب عرض سعر' },
  };
  const tr = L[language] || L.id;

  const products = [
    { id: 1, cat: 'Shisha', name: 'Cube', size: '2.5 × 2.5 × 2.5 cm', image: cocoCube },
    { id: 2, cat: 'Shisha', name: 'Cube H', size: '2.8 × 2.8 × 2.8 cm', image: cocoCubeH },
    { id: 3, cat: 'Shisha', name: 'Cube with Hole', size: '2.7 × 2.7 × 4.0 cm', image: cocoCubeHole },
    { id: 4, cat: 'Shisha', name: 'Rectangle', size: '2.6 × 2.6 × 4.0 cm', image: cocoRectangle },
    { id: 5, cat: 'Shisha', name: 'Rectangle H', size: '2.6 × 2.6 × 4.0 cm', image: cocoCubeHole },
    { id: 6, cat: 'Shisha', name: 'Rectangle with Hole', size: '2.8 × 2.8 × 2.8 cm', image: cocoCubeH },
    { id: 7, cat: 'Shisha', name: 'Hexagon', size: '2.6 × 2.6 × 5.0 cm', image: cocoHexagon },
    { id: 8, cat: 'Shisha', name: 'Hexagonal Flower', size: '2.6 × 2.6 × 5.0 cm', image: cocoHexFlower },
    { id: 9, cat: 'Shisha', name: 'Half Finger', size: '2.0 × 2.0 × 5.0 cm', image: cocoHalfFinger },
    { id: 10, cat: 'Shisha', name: 'Hexagonal Flower with Hole', size: '2.7 × 2.7 × 5.0 cm', image: cocoHexFlower },
    { id: 11, cat: 'BBQ', name: 'BBQ Cube H', size: '4.0 × 4.0 × 7.0 cm', image: cocoCubeH },
    { id: 12, cat: 'BBQ', name: 'BBQ Hexagonal Flower', size: '5.0 × 5.0 × 9.0 cm', image: cocoHexFlower },
  ];

  return (
    <div id="products" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Header left (sticky) */}
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

          {/* All product cards */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
                className="group relative bg-[#0e0f12] rounded-2xl overflow-hidden border border-zinc-900 hover:border-zinc-800 transition-all duration-300 flex flex-col"
              >
                {/* Image + category badge */}
                <div className="aspect-[4/3] bg-zinc-950 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-transparent to-transparent z-10" />
                  <span className="absolute top-3 left-3 z-20 rounded-full bg-black/50 backdrop-blur px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                    {item.cat}
                  </span>
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Full specs */}
                <div className="p-5 flex-1 flex flex-col text-left">
                  <h3 className="font-display font-bold text-base text-zinc-100 group-hover:text-orange-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-orange-500/90 mt-0.5">{item.size}</p>

                  <ul className="mt-3 space-y-1.5 flex-1">
                    {tr.common.map((s) => (
                      <li key={s} className="flex items-start gap-1.5 text-[11px] text-zinc-400 font-light leading-snug">
                        <Check className="h-3 w-3 text-orange-500/70 mt-0.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-3 border-t border-zinc-900 flex items-end justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-zinc-600">{tr.capLabel}</div>
                      <div className="text-[10px] text-zinc-400">{item.cat === 'BBQ' ? tr.capBbq : tr.capShisha}</div>
                    </div>
                    <a
                      href="#contact"
                      title={tr.inquiry}
                      className="h-9 w-9 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 group-hover:bg-orange-600 group-hover:border-transparent text-zinc-400 group-hover:text-white flex items-center justify-center transition-all"
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
