import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Shield, Search, Sparkles, Sliders, BarChart3, Database, 
  Terminal, Save, RefreshCw, Layers, Check, CheckCircle, 
  ExternalLink, Code, Activity, AlertCircle, Copy, Play
} from 'lucide-react';
import { useSeoAds, SeoLanguageSettings } from '../context/SeoAdsContext';
import { useLanguage, LanguageType } from '../context/LanguageContext';

interface SeoAdsAdminProps {
  onClose: () => void;
}

export function SeoAdsAdmin({ onClose }: SeoAdsAdminProps) {
  const { config, updateConfig, resetToDefault, logs, clearLogs, triggerConversion, addLog } = useSeoAds();
  const { language } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'google-ads' | 'schema' | 'logs'>('overview');
  
  // SEO tab states (separate localized edits)
  const [seoLangTab, setSeoLangTab] = useState<LanguageType>('id');
  const [seoTitle, setSeoTitle] = useState(config.seo[seoLangTab].title);
  const [seoDesc, setSeoDesc] = useState(config.seo[seoLangTab].description);
  const [seoKeywords, setSeoKeywords] = useState(config.seo[seoLangTab].keywords);
  
  // Global SEO items
  const [canonical, setCanonical] = useState(config.seo.canonicalUrl);
  const [robots, setRobots] = useState(config.seo.robots);
  const [schemaText, setSchemaText] = useState(config.seo.jsonLdSchema);
  
  // Google Ads states
  const [gAdsEnabled, setGAdsEnabled] = useState(config.googleAds.enabled);
  const [gAdsId, setGAdsId] = useState(config.googleAds.conversionId);
  const [gAdsLabel, setGAdsLabel] = useState(config.googleAds.conversionLabel);
  const [gtmId, setGtmId] = useState(config.googleAds.gtmId);
  const [remarketingEnabled, setRemarketingEnabled] = useState(config.googleAds.remarketingEnabled);

  // General state
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Handle local config changes for SEO language sub-tab
  const handleLangChange = (lang: LanguageType) => {
    // Save current values first to make edit flow natural
    setSeoLangTab(lang);
    setSeoTitle(config.seo[lang].title);
    setSeoDesc(config.seo[lang].description);
    setSeoKeywords(config.seo[lang].keywords);
  };

  const handleSaveSeo = () => {
    updateConfig((prev) => {
      const updatedSeo = { ...prev.seo };
      updatedSeo[seoLangTab] = {
        title: seoTitle,
        description: seoDesc,
        keywords: seoKeywords
      };
      updatedSeo.canonicalUrl = canonical;
      updatedSeo.robots = robots;
      
      return {
        ...prev,
        seo: updatedSeo
      };
    });

    addLog(
      'Konfigurasi SEO Disimpan',
      'seo_update',
      `Bahasa: ${seoLangTab.toUpperCase()} | Suffix: /${seoLangTab}. Metadata diinjeksikan secara real-time ke Document Head.`,
      'updated'
    );
    triggerSuccessFeedback();
  };

  const handleSaveSchema = () => {
    try {
      JSON.parse(schemaText); // Validate JSON format
      setSchemaError(null);
      
      updateConfig((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          jsonLdSchema: schemaText
        }
      }));

      addLog(
        'JSON-LD Schema Disimpan',
        'seo_update',
        'Struktur metadata JSON-LD berhasil diperbarui dan diterapkan ke elemen <script type="application/ld+json">.',
        'updated'
      );
      triggerSuccessFeedback();
    } catch (e: any) {
      setSchemaError(`Format JSON Tidak Valid: ${e.message}`);
    }
  };

  const handleSaveGoogleAds = () => {
    updateConfig((prev) => ({
      ...prev,
      googleAds: {
        enabled: gAdsEnabled,
        conversionId: gAdsId,
        conversionLabel: gAdsLabel,
        gtmId: gtmId,
        remarketingEnabled: remarketingEnabled
      }
    }));

    addLog(
      'Google Ads Diperbarui',
      'gtag_config',
      `Status: ${gAdsEnabled ? 'AKTIF' : 'NONAKTIF'}, Google Ads Conversion ID: ${gAdsId}, Label: ${gAdsLabel}`,
      'updated'
    );
    triggerSuccessFeedback();
  };

  const triggerSuccessFeedback = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin memulihkan semua setelan SEO & Google Ads ke konfigurasi standard?')) {
      resetToDefault();
      // Reload states from context
      setTimeout(() => {
        setSeoTitle(config.seo[seoLangTab].title);
        setSeoDesc(config.seo[seoLangTab].description);
        setSeoKeywords(config.seo[seoLangTab].keywords);
        setCanonical(config.seo.canonicalUrl);
        setRobots(config.seo.robots);
        setSchemaText(config.seo.jsonLdSchema);
        
        setGAdsEnabled(config.googleAds.enabled);
        setGAdsId(config.googleAds.conversionId);
        setGAdsLabel(config.googleAds.conversionLabel);
        setGtmId(config.googleAds.gtmId);
        setRemarketingEnabled(config.googleAds.remarketingEnabled);
      }, 100);
    }
  };

  // Fast test conversion event triggers
  const handleTestTrigger = () => {
    triggerConversion(
      'Dedy Kurniawan (Simulated)',
      'dedy.exporters@charcoalhub.com',
      'Arang Shisha Premium (Shisha Briquette)'
    );
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full min-h-screen bg-[#090a0d] flex flex-col flex-1"
      >
        {/* Admin Header Panel */}
        <div className="bg-gradient-to-r from-orange-600/10 via-amber-600/5 to-zinc-950 px-6 py-5 border-b border-zinc-850 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-white tracking-wide text-lg">Pusat Integrasi & Pengelolaan SEO / Google Ads</h2>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Control Panel</span>
              </div>
              <p className="text-xs text-zinc-400 font-light mt-0.5">Konfigurasi optimasi mesin pencari global dan sinkronisasi tracking digital terpadu.</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold uppercase text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span>Kembali ke Website</span>
            <X className="h-3.5 w-3.5 text-orange-500" />
          </button>
        </div>

        {/* Outer Layout Frame */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Left Navigation Rails Panel */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 bg-[#07070a] p-4 flex flex-col justify-between">
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-2 block mb-3 font-mono">Modul Utama</span>
              
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'overview' 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/15' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>Ringkasan Panel</span>
              </button>

              <button 
                onClick={() => setActiveTab('seo')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'seo' 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/15' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Pengaturan SEO</span>
              </button>

              <button 
                onClick={() => setActiveTab('google-ads')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'google-ads' 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/15' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Google Ads</span>
              </button>

              <button 
                onClick={() => setActiveTab('schema')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'schema' 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/15' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>JSON-LD Schema</span>
              </button>

              <button 
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeTab === 'logs' 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/15' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4" />
                  <span>Log Aktivitas</span>
                </div>
                {logs.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${activeTab === 'logs' ? 'bg-white text-orange-600' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
                    {logs.length}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Actions at bottom */}
            <div className="pt-4 border-t border-zinc-900 space-y-2 mt-4 md:mt-0 text-left">
              <button 
                onClick={handleTestTrigger}
                className="w-full flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl border border-dashed border-orange-500/20 hover:border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10 text-orange-400 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Tes Trigger Konversi</span>
              </button>
              
              <button 
                onClick={handleReset}
                className="w-full flex items-center gap-2 justify-center px-3 py-2 bg-transparent hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Setelan</span>
              </button>
            </div>
          </div>

          {/* Right Main Editor Panel */}
          <div className="flex-1 bg-zinc-950/45 p-6 overflow-y-auto md:max-h-[calc(100vh-80px)] min-h-[550px]">
            
            <AnimatePresence mode="wait">
              {/* SAVE SUCCESS BANNER */}
              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Konfigurasi berhasil disimpan! Modifikasi telah diterapkan ke DOM dan disimpan ke penyimpanan lokal.</span>
                </motion.div>
              )}

              {/* TAB 1: OVERVIEW PANEL */}
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-6 text-left"
                >
                  <div className="bg-gradient-to-r from-orange-500/5 via-[#0e0f12] to-transparent p-6 rounded-2xl border border-zinc-900">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-500">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-medium text-white text-base">Dashboard Monitoring SEO & Google Ads</h3>
                        <p className="text-zinc-400 text-xs font-light mt-1 max-w-2xl leading-relaxed">
                          Nusantara Charcoal SEO-Ads core terhubung langsung dengan Google Tag Manager dan merekam trigger interaksi secara real-time. Anda dapat melihat aktivitas naskah pelacakan, status indeksasi halaman, dan mengukur performa Google Ads dari panel ini.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Card 1: Google Ads Status */}
                    <div className="bg-[#0b0c0f] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Pelacak Google Ads</span>
                        <div className={`h-2.5 w-2.5 rounded-full ${config.googleAds.enabled && config.googleAds.conversionId ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold font-display text-white">{config.googleAds.enabled ? 'Sistem Aktif' : 'Nonaktif'}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">AW ID: {config.googleAds.conversionId || 'Belum Diatur'}</p>
                      </div>
                    </div>

                    {/* Card 2: SEO Indexing */}
                    <div className="bg-[#0b0c0f] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Metode Robots</span>
                        <Code className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold font-display text-white">{config.seo.robots}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">Canonical: {config.seo.canonicalUrl}</p>
                      </div>
                    </div>

                    {/* Card 3: Live Logs Counts */}
                    <div className="bg-[#0b0c0f] border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Jumlah Log Tersimpan</span>
                        <Terminal className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold font-display text-white">{logs.length} Perubahan</p>
                        <p className="text-[10px] text-zinc-400 mt-1 font-mono">Menampung aktivitas live audit.</p>
                      </div>
                    </div>

                  </div>

                  {/* Section: Live Integration Map */}
                  <div className="bg-[#0c0d10] border border-zinc-900 rounded-2xl p-6">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Alur Kerja Tag Otomatis (DOM Injection Flow)</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-center relative">
                        <div className="flex justify-center text-orange-500 mb-2">
                          <Sliders className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-white uppercase">1. Simpan Sesi</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-light">Setelan ditulis ke enkripsi LocalStorage browser.</p>
                      </div>

                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-center relative">
                        <div className="flex justify-center text-orange-500 mb-2">
                          <Search className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-white uppercase">2. Render Head Tag</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-light">Meta Title, Description, & JSON-LD disuntik langsung ke HTML Head.</p>
                      </div>

                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-center relative">
                        <div className="flex justify-center text-orange-500 mb-2">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-white uppercase">3. Muat Gtag Ads</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-light">Gtag.js Async ditambahkan otomatis jika status diaktifkan.</p>
                      </div>

                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 text-center relative">
                        <div className="flex justify-center text-orange-500 mb-2">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-white uppercase">4. Lacak Formulir</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-light">Submit di halaman Kontak otomatis meluncurkan sinyal gads.</p>
                      </div>
                    </div>
                  </div>

                  {/* Section: Dynamic Meta Test Tools */}
                  <div className="bg-[#0c0d10] border border-zinc-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-white text-sm font-bold">Uji Coba Script Gtag</h4>
                      <p className="text-xs text-zinc-400 font-light mt-1">Anda bisa mengisi formulir Kontak di bawah halaman utama untuk menyimulasikan konversi Leads secara real-time, atau gunakan tombol cepat.</p>
                    </div>
                    <button 
                      onClick={handleTestTrigger}
                      className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-600/10 shrink-0 cursor-pointer"
                    >
                      Kirim Simulasi Transaksi Leads
                    </button>
                  </div>

                </motion.div>
              )}

              {/* TAB 2: SEO CONFIGURATOR */}
              {activeTab === 'seo' && (
                <motion.div 
                  key="seo"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div>
                      <h3 className="font-display font-medium text-white text-base">Metadata & Optimasi Mesin Pencari</h3>
                      <p className="text-xs text-zinc-400 mt-1">Modifikasi tag-head HTML secara dinamis. Anda bisa mengganti metadata spesifik sesuai bahasa pengunjung.</p>
                    </div>
                    
                    {/* Local Language Tabs */}
                    <div className="flex bg-zinc-950 border border-zinc-850 p-1 rounded-full shrink-0">
                      {(['id', 'en', 'ar'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => handleLangChange(lang)}
                          className={`px-3 py-1.5 text-xs font-display font-bold rounded-full uppercase transition-all cursor-pointer ${
                            seoLangTab === lang 
                              ? 'bg-orange-600 text-white shadow' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form SEO Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Meta Title Tag (Bahasa {seoLangTab.toUpperCase()})</label>
                      <input 
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-sans"
                        placeholder="Masukkan judul SEO halaman..."
                      />
                      <span className="text-[10px] text-zinc-500 font-light mt-1.5 block">Disarankan: Di bawah 60 karakter agar tidak terpotong di Google. Panjang saat ini: <strong className="text-zinc-400 font-mono">{seoTitle.length}</strong> karakter.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Meta Description Tag (Bahasa {seoLangTab.toUpperCase()})</label>
                      <textarea 
                        value={seoDesc}
                        onChange={(e) => setSeoDesc(e.target.value)}
                        rows={3}
                        className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-sans"
                        placeholder="Masukkan deskripsi SEO halaman..."
                      />
                      <span className="text-[10px] text-zinc-500 font-light mt-1.5 block">Disarankan: Antara 120-160 karakter untuk deskripsi ideal. Panjang saat ini: <strong className="text-zinc-400 font-mono">{seoDesc.length}</strong> karakter.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Meta Keywords (Bahasa {seoLangTab.toUpperCase()})</label>
                      <input 
                        type="text"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                        placeholder="Masukkan kata kunci dipisahkan dengan koma..."
                      />
                    </div>

                    {/* Shared Global SEO */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Canonical Link URL (Global)</label>
                        <input 
                          type="text"
                          value={canonical}
                          onChange={(e) => setCanonical(e.target.value)}
                          className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                          placeholder="https://nusantaracharcoal.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Robots Meta Directives</label>
                        <select 
                          value={robots}
                          onChange={(e: any) => setRobots(e.target.value)}
                          className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                        >
                          <option value="index, follow">index, follow (Standard, dapat diindeks)</option>
                          <option value="noindex, nofollow">noindex, nofollow (Privat murni, tidak diindeks)</option>
                          <option value="noindex, follow">noindex, follow (Sembunyikan halaman utama tapi ikuti link)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* LIVE GOOGLE SEARCH ENGINE RESULTS PAGE (SERP) PREVIEW */}
                  <div className="bg-[#0b0c0f] border border-zinc-900 rounded-2xl p-5 mt-6">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-3 font-mono flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-orange-500 animate-pulse" /> Mock Tampilan Google Search (SERP) Preview ({seoLangTab.toUpperCase()})
                    </span>
                    
                    <div className="bg-white text-zinc-900 p-5 rounded-xl border border-zinc-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-6 w-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600">N</div>
                        <div className="text-left leading-none">
                          <p className="text-xs font-semibold text-zinc-800">Nusantara Charcoal</p>
                          <span className="text-[9px] text-zinc-400 font-mono leading-none">{canonical}</span>
                        </div>
                      </div>
                      
                      {/* Title preview */}
                      <p className="text-[19px] leading-tight text-[#1a0dab] hover:underline cursor-pointer font-medium mb-1 truncate text-left">
                        {seoTitle || 'Nusantara Charcoal Premium Supplier'}
                      </p>
                      
                      {/* Description preview */}
                      <p className="text-xs text-[#4d5156] leading-relaxed text-left font-light line-clamp-2">
                        {seoDesc || 'Deskripsi halaman optimasi Anda akan ditampilkan di sini oleh mesin telusur Google.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleSaveSeo}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-600/10 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Simpan Setelan SEO</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: GOOGLE ADS CONFIG */}
              {activeTab === 'google-ads' && (
                <motion.div 
                  key="google-ads"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-6 text-left"
                >
                  <div>
                    <h3 className="font-display font-medium text-white text-base">Integrasi Google Ads & Conversion Tracking</h3>
                    <p className="text-xs text-zinc-400 mt-1">Gunakan tab ini untuk merekatkan Conversion Pelacakan Google Ads Anda agar konversi prospek dicatat secara akurat.</p>
                  </div>

                  <div className="bg-[#0c0d10] border border-zinc-900 rounded-2xl p-6 space-y-6">
                    {/* Toggle switch */}
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
                      <div>
                        <p className="text-white text-sm font-bold">Status Pelacak Google Ads</p>
                        <p className="text-zinc-500 text-xs font-light mt-0.5">Aktifkan script global site tag (gtag.js) ke dalam markup web.</p>
                      </div>
                      <button 
                        onClick={() => setGAdsEnabled(!gAdsEnabled)}
                        className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-orange-500 ${gAdsEnabled ? 'bg-orange-600' : 'bg-zinc-800'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${gAdsEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Conversion ID Google Ads (ctag/gtag)</label>
                        <input 
                          type="text"
                          value={gAdsId}
                          onChange={(e) => setGAdsId(e.target.value)}
                          className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                          placeholder="AW-XXXXXXXXX"
                          disabled={!gAdsEnabled}
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">Contoh format: AW-1123456789 atau G-XXXXXX</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Conversion Label Pelacak Leads</label>
                        <input 
                          type="text"
                          value={gAdsLabel}
                          onChange={(e) => setGAdsLabel(e.target.value)}
                          className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                          placeholder="gAdS_CoNv_XXXXXXXXX"
                          disabled={!gAdsEnabled}
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">Label spesifik yang dipicu saat formulir kontak disubmit.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900/50">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Google Tag Manager ID (Optional)</label>
                        <input 
                          type="text"
                          value={gtmId}
                          onChange={(e) => setGtmId(e.target.value)}
                          className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-3 px-4 text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                          placeholder="GTM-XXXXXXX"
                          disabled={!gAdsEnabled}
                        />
                      </div>

                      <div className="flex items-center justify-between bg-zinc-950 border border-zinc-900 rounded-xl p-4">
                        <div>
                          <p className="text-white text-xs font-bold uppercase">Google Ads Remarketing</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Sertakan target audiens pemasaran ulang Google Ads.</p>
                        </div>
                        <button 
                          onClick={() => setRemarketingEnabled(!remarketingEnabled)}
                          disabled={!gAdsEnabled}
                          className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-orange-500 ${remarketingEnabled && gAdsEnabled ? 'bg-orange-600' : 'bg-zinc-800'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${remarketingEnabled && gAdsEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Dynamic instruction text */}
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-400 text-xs font-light flex gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Saat diaktifkan, program ini secara cerdas akan menyuntikkan script resmi <code>gtag.js</code> langsung ke template HTML Head, melakukan inisialisasi aman (sandboxed), dan siap menangkap log transaksi secara menyeluruh.
                      </p>
                    </div>

                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleSaveGoogleAds}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-600/10 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Simpan Setelan Google Ads</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: JSON-LD SCHEMA */}
              {activeTab === 'schema' && (
                <motion.div 
                  key="schema"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-medium text-white text-base">Schema.org Structured Data (LD+JSON)</h3>
                      <p className="text-xs text-zinc-400 mt-1">Struktur data mikro data yang membantu Google mengenali perusahaan Anda, detail kontak, dan portofolio produk ekspor secara optimal.</p>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 px-3 py-1 bg-zinc-900 border border-zinc-850 rounded-lg">
                      Format: JSON-LD Script
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 font-mono">Edit Raw JSON-LD Schema Code</label>
                      <textarea 
                        value={schemaText}
                        onChange={(e) => setSchemaText(e.target.value)}
                        rows={11}
                        className="block w-full bg-zinc-950 border border-zinc-850 rounded-xl py-4 px-4 text-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-mono leading-relaxed"
                        style={{ tabSize: 2 }}
                      />
                      
                      {schemaError ? (
                        <div className="text-red-400 text-xs font-mono mt-2 bg-red-400/5 p-3 rounded-lg border border-red-400/15 flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{schemaError}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-light mt-1.5 block">Format metadata harus berpedoman pada struktur sah schema.org. Validasi otomatis dilakukan saat Anda menekan tombol simpan.</span>
                      )}
                    </div>
                  </div>

                  {/* Schema testing preview tools */}
                  <div className="p-4 bg-[#0e0f12] border border-zinc-900 rounded-xl">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase block mb-2 font-mono flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-zinc-500" /> Demo Tampilan Output Metadata Google Rich Snippet
                    </span>
                    <p className="text-xs text-zinc-500 leading-normal font-light">
                      Data kaya yang dimasukkan akan membuat Google memunculkan rincian kontak korporat, jam operasional, dan logo Anda langsung di panel samping sebelah kanan hasil Google Search (Knowledge Graph / Rich Result).
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleSaveSchema}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-600/10 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Simpan & Terapkan Schema</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: AUDIT LOGS STREAM TERMINAL */}
              {activeTab === 'logs' && (
                <motion.div 
                  key="logs"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-4 gap-4">
                    <div>
                      <h3 className="font-display font-medium text-white text-base">Log Event Pelacakan & Konversi</h3>
                      <p className="text-xs text-zinc-400 mt-1">Pantau trigger Google Ads dan metadata SEO yang ditembakkan secara dinamis saat web berinteraksi.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleTestTrigger}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Simulasikan Leads Form</span>
                      </button>
                      <button 
                        onClick={clearLogs}
                        className="px-3 py-1.5 bg-transparent border border-zinc-850 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Bersihkan Monitor
                      </button>
                    </div>
                  </div>

                  {/* Terminal Log Console */}
                  <div className="bg-black border border-zinc-900 rounded-2xl p-5 relative overflow-hidden shadow-inner flex flex-col h-96 min-h-[300px]">
                    <div className="absolute top-0 inset-x-0 h-10 bg-zinc-950 border-b border-zinc-900 px-4 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-2 uppercase tracking-widest">
                        <Terminal className="h-3.5 w-3.5 text-orange-500 animate-pulse" /> bash - arang-seo-tracking-monitor.sh
                      </span>
                      <span className="text-zinc-600 font-light">Status: Listening to events...</span>
                    </div>

                    <div className="flex-1 overflow-y-auto mt-7 pt-2 font-mono text-xs space-y-4 pr-2">
                      {logs.length === 0 ? (
                        <div className="text-zinc-650 h-full flex items-center justify-center italic font-light">
                          -- Belum ada rekaman trigger baru. Coba kirim simulasi kontak --
                        </div>
                      ) : (
                        logs.map((log) => (
                          <div key={log.id} className="border-l-2 border-zinc-850 pl-3 py-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-zinc-500 text-[10px] font-mono">{log.timestamp}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                                log.type === 'google_ads_conversion' ? 'bg-orange-600/20 text-orange-400 border border-orange-600/20' :
                                log.type === 'gtag_config' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' :
                                log.type === 'seo_update' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                                'bg-zinc-800 text-zinc-300'
                              }`}>
                                {log.type.replace('_', ' ')}
                              </span>
                              <span className="text-zinc-100 font-bold tracking-wide">{log.eventName}</span>
                              <span className={`text-[10px] font-semibold italic ${log.status === 'fired' ? 'text-green-400' : 'text-zinc-400'}`}>
                                ({log.status.toUpperCase()})
                              </span>
                            </div>
                            <p className="text-zinc-400 mt-1.5 text-[11.5px] leading-relaxed font-light">{log.details}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0a0a0d] border border-zinc-900 text-zinc-550 text-xs leading-normal">
                    <p className="font-light">
                      <strong className="text-zinc-400 font-medium">Informasi Integrasi:</strong> Terminal Audit di atas merekam trigger secara dinamis. Anda dapat beralih ke halaman utama Nusantara Charcoal di latar belakang, mengisi formulir Kontak, menekan "Hubungi Kami (Kirim)", dan kembali ke tab ini untuk meneliti hasil pemicu log Google Ads Leads yang baru saja terjadi.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
