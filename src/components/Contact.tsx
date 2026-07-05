import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import { useSeoAds } from '../context/SeoAdsContext';

export function Contact() {
  const { t } = useLanguage();
  const { triggerConversion } = useSeoAds();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger conversion tracking event with input data
    triggerConversion(name, email, product || t('prod_name_bbq'));
    
    alert(t('language') === 'ar' ? 'تم تقديم النموذج بنجاح!' : (t('language') === 'en' ? 'Form submitted successfully!' : 'Pesan berhasil dikirim!'));
    
    // Reset form fields
    setName('');
    setEmail('');
    setProduct('');
    setMessage('');
  };

  return (
    <div id="contact" className="py-24 bg-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <span className="text-orange-500 font-display font-medium text-xs tracking-[0.2em] uppercase">
              {t('contact_sub')}
            </span>
            <h2 className="text-4xl font-display font-black text-white mt-3 mb-6">{t('contact_title')}</h2>
            <p className="text-zinc-400 text-base leading-relaxed mb-8 font-light">
              {t('contact_desc')}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-[#0c0d10] p-4 rounded-xl text-orange-500 border border-zinc-800">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-bold text-white font-display">Head Office</h3>
                  <p className="mt-1 text-sm text-zinc-400 leading-relaxed font-light">
                    <span className="text-zinc-200 font-semibold">PT. BRIKET CHARCOAL INDONESIA</span><br/>
                    Jl. Raya Kronjo No. 18, Sukamulya,<br/>
                    Balaraja, Tangerang, Indonesia, 15610
                  </p>
                </div>
              </div>

              {/* Professional embedded location map */}
              <div className="overflow-hidden rounded-2xl border border-zinc-800 shadow-lg">
                <iframe
                  title="Lokasi PT. Briket Charcoal Indonesia"
                  src="https://maps.google.com/maps?q=-6.2154,106.4198&z=3&output=embed"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#0c0d10] p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-left"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">{t('contact_label_name')}</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder={t('contact_ph_name')}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">{t('contact_label_email')}</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder={t('contact_ph_email')}
                />
              </div>
              
              <div>
                <label htmlFor="product" className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">{t('contact_label_product')}</label>
                <select
                  id="product"
                  name="product"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="block w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-colors"
                >
                  <option value={t('prod_name_bbq')}>{t('prod_name_bbq')}</option>
                  <option value={t('prod_name_shisha')}>{t('prod_name_shisha')}</option>
                  <option value={t('prod_name_hex')}>{t('prod_name_hex')}</option>
                  <option value={t('prod_name_briquet')}>{t('prod_name_briquet')}</option>
                  <option value={t('contact_other')}>{t('contact_other')}</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">{t('contact_label_message')}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder={t('contact_ph_message')}
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-orange-500 transition-colors shadow-lg cursor-pointer"
              >
                {t('contact_submit')}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

