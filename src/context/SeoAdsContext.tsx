import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export interface SeoLanguageSettings {
  title: string;
  description: string;
  keywords: string;
}

export interface SeoAdsConfig {
  seo: {
    id: SeoLanguageSettings;
    en: SeoLanguageSettings;
    ar: SeoLanguageSettings;
    canonicalUrl: string;
    robots: 'index, follow' | 'noindex, nofollow' | 'noindex, follow';
    jsonLdSchema: string;
  };
  googleAds: {
    enabled: boolean;
    conversionId: string;
    conversionLabel: string;
    gtmId: string;
    remarketingEnabled: boolean;
  };
}

export interface TrackingEvent {
  id: string;
  timestamp: string;
  eventName: string;
  type: 'google_ads_conversion' | 'gtag_config' | 'remarketing_pixel' | 'seo_update';
  status: 'fired' | 'debug_simulated' | 'updated';
  details: string;
}

interface SeoAdsContextProps {
  config: SeoAdsConfig;
  updateConfig: (updater: (prev: SeoAdsConfig) => SeoAdsConfig) => void;
  resetToDefault: () => void;
  logs: TrackingEvent[];
  addLog: (eventName: string, type: TrackingEvent['type'], details: string, status?: TrackingEvent['status']) => void;
  clearLogs: () => void;
  triggerConversion: (formName: string, email: string, product: string) => void;
}

const defaultJsonLd = `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Nusantara Charcoal",
  "url": "https://nusantaracharcoal.com",
  "logo": "https://nusantaracharcoal.com/assets/logo.png",
  "sameAs": [
    "https://facebook.com/nusantaracharcoal",
    "https://instagram.com/nusantaracharcoal"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+6281100000000",
    "contactType": "sales",
    "areaServed": "Worldwide",
    "availableLanguage": ["Indonesian", "English", "Arabic"]
  }
}`;

const defaultSettings: SeoAdsConfig = {
  seo: {
    id: {
      title: 'Nusantara Charcoal - Produsen Arang Kelapa & Kayu Ekspor Terbaik',
      description: 'Eksportir arang premium dari Indonesia. Memproduksi briket shisha batok kelapa, arang briket BBQ berkualitas tinggi, awet, panas stabil, bersertifikasi Sucofindo & SGS.',
      keywords: 'arang kelapa, briket shisha, arang bbq, ekspor arang indonesia, sawdust hexagonal, briket kelapa premium, nusantara charcoal'
    },
    en: {
      title: 'Nusantara Charcoal - Top Coconut Shell & Wood Charcoal Exporter',
      description: 'Premium Indonesian charcoal exporter. Supplying premium coconut shell shisha briquettes and high-grade BBQ charcoal. Long-lasting, high heat, certified by SGS & Sucofindo.',
      keywords: 'coconut charcoal, shisha briquette, bbq charcoal, charcoal export indonesia, hexagonal charcoal, nusantara charcoal'
    },
    ar: {
      title: 'فحم نوسانتارا - مصنع ومصدر فحم جوز الهند الطبيعي للشيشة والشواء',
      description: 'مصدر الفحم الإندونيسي الفاخر ومكعبات فحم شيشة جوز الهند الطبيعي وفحم الشواء عالي الجودة. حرارة ثابتة تدوم طويلا ومعتمد دولياً وسيرتيفايد.',
      keywords: 'فحم جوز الهند، فحم شيشة، فحم شواء، تصدير الفحم إندونيسيا، فحم سداسي، فحم نوسانتارا'
    },
    canonicalUrl: 'https://nusantaracharcoal.com',
    robots: 'index, follow',
    jsonLdSchema: defaultJsonLd
  },
  googleAds: {
    enabled: true,
    conversionId: 'AW-1123456789',
    conversionLabel: 'gAdS_CoNv_LeAd_1234',
    gtmId: 'GTM-N6CHAR',
    remarketingEnabled: true
  }
};

const SeoAdsContext = createContext<SeoAdsContextProps | undefined>(undefined);

export const SeoAdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [config, setConfigState] = useState<SeoAdsConfig>(() => {
    try {
      const saved = localStorage.getItem('seo_ads_management_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved config', e);
    }
    return defaultSettings;
  });

  const [logs, setLogs] = useState<TrackingEvent[]>(() => {
    try {
      const savedLogs = localStorage.getItem('seo_ads_tracking_logs');
      if (savedLogs) return JSON.parse(savedLogs);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: '1',
        timestamp: new Date().toLocaleTimeString(),
        eventName: 'Inisialisasi Sistem SEO & Ads',
        type: 'seo_update',
        status: 'updated',
        details: 'Mesin SEO dan Google Ads dimuat dengan konfigurasi tersimpan.'
      }
    ];
  });

  // Save config to local storage
  const updateConfig = (updater: (prev: SeoAdsConfig) => SeoAdsConfig) => {
    setConfigState((prev) => {
      const next = updater(prev);
      localStorage.setItem('seo_ads_management_config', JSON.stringify(next));
      return next;
    });
  };

  const resetToDefault = () => {
    setConfigState(defaultSettings);
    localStorage.setItem('seo_ads_management_config', JSON.stringify(defaultSettings));
    addLog('Reset Konfigurasi', 'seo_update', 'Semua pengaturan direset ke setelan standar pabrik.', 'updated');
  };

  const addLog = (
    eventName: string,
    type: TrackingEvent['type'],
    details: string,
    status: TrackingEvent['status'] = 'fired'
  ) => {
    const newLog: TrackingEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      eventName,
      type,
      status,
      details
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 50); // keep last 50 logs
      localStorage.setItem('seo_ads_tracking_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('seo_ads_tracking_logs');
  };

  // Actual Application of SEO head tags based on language
  useEffect(() => {
    const langConfig = config.seo[language] || config.seo['id'];
    
    // 1. Update document title
    document.title = langConfig.title;

    // 2. Head Description Tag
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', langConfig.description);

    // 3. Head Keywords Tag
    let keywordsTag = document.querySelector('meta[name="keywords"]');
    if (!keywordsTag) {
      keywordsTag = document.createElement('meta');
      keywordsTag.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsTag);
    }
    keywordsTag.setAttribute('content', langConfig.keywords);

    // 4. Head Robots Tag
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', config.seo.robots);

    // 5. Head Canonical Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', config.seo.canonicalUrl);

    // 6. JSON-LD Schema Script
    let schemaScript = document.getElementById('seo-jsonld-schema');
    if (schemaScript) {
      schemaScript.innerHTML = config.seo.jsonLdSchema;
    } else {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('id', 'seo-jsonld-schema');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.innerHTML = config.seo.jsonLdSchema;
      document.head.appendChild(schemaScript);
    }

    addLog(
      'Metadata SEO Diperbarui',
      'seo_update',
      `Bahasa aktif: ${language.toUpperCase()}, Title: "${langConfig.title.substring(0, 40)}..."`,
      'updated'
    );
  }, [language, config.seo]);

  // Actual Application of Google Ads tracking scripts if enabled
  useEffect(() => {
    if (!config.googleAds.enabled) {
      // Remove existing gtag script nodes if any
      const existingScript = document.getElementById('gtag-ads-script');
      const existingConfig = document.getElementById('gtag-ads-config-node');
      if (existingScript) existingScript.remove();
      if (existingConfig) existingConfig.remove();
      return;
    }

    const { conversionId, remarketingEnabled } = config.googleAds;
    if (!conversionId) return;

    // Remove old scripts
    const oldScr = document.getElementById('gtag-ads-script');
    const oldConf = document.getElementById('gtag-ads-config-node');
    if (oldScr) oldScr.remove();
    if (oldConf) oldConf.remove();

    // Inject Google site tag (gtag.js) script element
    const script = document.createElement('script');
    script.id = 'gtag-ads-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
    document.head.appendChild(script);

    // Inject custom config node inside document head
    const configNode = document.createElement('script');
    configNode.id = 'gtag-ads-config-node';
    configNode.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${conversionId}', {
        'send_page_view': true,
        'remarketing_only': ${remarketingEnabled}
      });
    `;
    document.head.appendChild(configNode);

    // Update global gtag function so it can be invoked by event handlers in sandbox preview
    (window as any).gtag = (window as any).gtag || function() {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(arguments);
    };

    addLog(
      'Script Google Ads Diinjeksi ke DOM',
      'gtag_config',
      `Script gtag.js berhasil dimuat di Head dengan ID: ${conversionId}. Fitur Remarketing: ${remarketingEnabled ? 'AKTIF' : 'NONAKTIF'}`,
      'fired'
    );
  }, [config.googleAds.enabled, config.googleAds.conversionId, config.googleAds.remarketingEnabled]);

  // Handle Simulated Conversions
  const triggerConversion = (formName: string, email: string, product: string) => {
    const { enabled, conversionId, conversionLabel } = config.googleAds;
    const time = new Date().toLocaleTimeString();

    if (enabled && conversionId && conversionLabel) {
      // Call actual global gtag function to record real lead convert event
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'conversion', {
          'send_to': `${conversionId}/${conversionLabel}`,
          'value': 150.0,
          'currency': 'USD',
          'event_callback': () => {
            console.log('Google Ads event_callback executed successfully.');
          }
        });
      }

      // Add to logs stream
      addLog(
        'Google Ads Lead Conversion Fired',
        'google_ads_conversion',
        `Lead Form "${formName}" (${email}) memilih produk: "${product}". Mengirimkan konversi ke Google Ads ID: ${conversionId} dengan Label: ${conversionLabel}.`,
        'fired'
      );
    } else {
      addLog(
        'Simulasi Konversi Dibatalkan',
        'google_ads_conversion',
        `Lead disubmit dari ${email} namun Google Ads dinonaktifkan atau ID kosong.`,
        'debug_simulated'
      );
    }
  };

  return (
    <SeoAdsContext.Provider
      value={{
        config,
        updateConfig,
        resetToDefault,
        logs,
        addLog,
        clearLogs,
        triggerConversion
      }}
    >
      {children}
    </SeoAdsContext.Provider>
  );
};

export const useSeoAds = () => {
  const context = useContext(SeoAdsContext);
  if (!context) {
    throw new Error('useSeoAds must be used within a SeoAdsProvider');
  }
  return context;
};
