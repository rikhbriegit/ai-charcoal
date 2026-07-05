import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageType = 'id' | 'en' | 'ar' | 'fa' | 'tr';

// All languages the site ships (SEO + UI). English is the primary/x-default
// because B2B charcoal buyers across the whole Middle East search in English;
// Arabic (Gulf), Persian (Iran) and Turkish (Turkey) cover the local queries.
export const SUPPORTED_LANGS: LanguageType[] = ['id', 'en', 'ar', 'fa', 'tr'];
// Right-to-left scripts: Arabic AND Persian/Farsi.
export const RTL_LANGS: LanguageType[] = ['ar', 'fa'];

export interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const translations: Record<LanguageType, Record<string, string>> = {
  id: {
    // Navbar
    nav_home: 'Beranda',
    nav_about: 'Tentang Kami',
    nav_products: 'Produk',
    nav_features: 'Keunggulan',
    nav_analysis: 'Lab Analisis',
    nav_logistics: 'Logistik',
    nav_contact: 'Kontak',
    nav_order_now: 'Pesan Sekarang',
    nav_search: 'Cari Produk',
    brand_sub: 'PREMIUM',

    // Hero
    hero_sub: 'KUALITAS TERBAIK UNTUK HASIL MAKSIMAL',
    hero_title_1: 'ARANG',
    hero_title_2: 'PREMIUM',
    hero_desc: 'Arang berkualitas tinggi pilihan terbaik untuk pembakaran lebih tahan lama, panas stabil, dan ramah lingkungan.',
    hero_btn_products: 'Lihat Produk',
    hero_btn_video: 'Tonton Video',
    hero_badge_env: 'Environment',
    hero_badge_env_sub: 'Lingkungan',
    hero_badge_burn: 'More Durable',
    hero_badge_burn_sub: 'Lebih Tahan Lama',
    hero_badge_guar: 'Guaranteed',
    hero_badge_guar_sub: 'Terjamin',
    hero_customer_stats: '1000+',
    hero_customer_title: 'Pelanggan Puas',

    // Stats
    stats_1_val: '100%',
    stats_1_title: 'Kualitas Terbaik',
    stats_1_desc: 'Arang pilihan berkualitas tinggi dan teruji.',
    stats_2_val: '8+ Jam',
    stats_2_title: 'Tahan Lebih Lama',
    stats_2_desc: 'Pembakaran stabil dengan panas yang konsisten.',
    stats_3_val: '1000+',
    stats_3_title: 'Pelanggan Puas',
    stats_3_desc: 'Kepercayaan pelanggan adalah prioritas kami.',
    stats_4_val: 'Eco Friendly',
    stats_4_title: 'Ramah Lingkungan',
    stats_4_desc: 'Diproduksi secara alami tanpa merusak lingkungan.',

    // About
    about_sub: 'SIAPA KAMI & KOMITMEN KAMI',
    about_title: 'Penyedia Energi Berkelanjutan dengan Integritas Tinggi',
    about_desc_1: 'Didirikan dengan visi mengangkat keunggulan agrikultur nusantara ke pangsa ekspor dunia, Bricket Charcoal Indonesia memproduksi dan memasok arang kelapa serta kayu bermutu tinggi yang ramah lingkungan. Kami meminimalkan jejak karbon dengan mengoptimalkan produk sampingan agraris agar tidak terbuang sia-sia.',
    about_desc_2: 'Kami bermitra erat dengan ratusan kelompok tani lokal guna menjamin ketersediaan material mentah, sekaligus menggerakkan perekonomian pedesaan secara jujur (fair-trade) dan bermartabat.',
    about_stat_1_val: '0%',
    about_stat_1_title: 'Bahan Kimia',
    about_stat_1_desc: 'Tanpa sulfur pembakar instan berbahaya.',
    about_stat_2_val: '< 2.5%',
    about_stat_2_title: 'Sisa Abu Putih',
    about_stat_2_desc: 'Pembakaran bersih tanpa kotoran menumpuk.',
    about_flow_title: 'ALUR PRODUKSI INTEGRAL',
    about_certified: 'ISO 9001:2015 CERTIFIED',
    about_audit: 'Audit Pabrik Terbuka',

    // Production Steps
    step_1_title: 'Pemanenan Alami (Raw Sourcing)',
    step_1_desc: 'Bahan baku batok kelapa tua pilihan dikumpulkan langsung dari mitra petani lokal di pulau Jawa & Sulawesi.',
    step_2_title: 'Karbonisasi Pirolisis',
    step_2_desc: 'Proses pembakaran terkontrol hampa udara membuang zat-zat menguap menghasilkan arang mentah murni kadar karbon tinggi.',
    step_3_title: 'Penggilingan & Penyaringan',
    step_3_desc: 'Arang digiling menjadi tepung berukuran nano super halus, disaring ketat memastikan bebas campuran tanah atau batu pasir.',
    step_4_title: 'Pencetakan Hidrolik',
    step_4_desc: 'Adonan dicampur perekat organik alami (tepung tapioka pati murni) dan dicetak presisi dengan tekanan tinggi hidrolik.',
    step_5_title: 'Dehidrasi Oven Oven',
    step_5_desc: 'Briket dikeringkan di oven panas stabil selama 48 jam untuk menurunkan kadar air di bawah batas sertifikasi ekspor 5%.',

    // Products
    prod_sub: 'PRODUK KAMI',
    prod_title: 'Pilihan Arang Berkualitas',
    prod_desc: 'Tersedia dalam berbagai ukuran untuk memenuhi kebutuhan Anda, dari rumah tangga hingga bisnis.',
    prod_view_all: 'Lihat Semua Produk',
    prod_unit_2kg: ' / 2kg',
    prod_unit_1kg: ' / 1kg',
    prod_name_bbq: 'Arang BBQ Premium',
    prod_spec_bbq: 'Ukuran 3–5 cm',
    prod_name_shisha: 'Arang Shisha Premium',
    prod_spec_shisha: 'Ukuran 2–3 cm',
    prod_name_hex: 'Arang Hexagonal',
    prod_spec_hex: 'Ukuran 5–7 cm',
    prod_name_briquet: 'Arang Briket Premium',
    prod_spec_briquet: 'Ukuran 4x4x4 cm',

    // Lab Analysis
    lab_sub: 'STANDAR LABORATORIUM INTERNASIONAL',
    lab_title: 'Sertifikasi & Analisis Kimiawi Produk',
    lab_desc: 'Bricket Charcoal Indonesia berkomitmen penuh pada transparansi kualitas ekspor. Setiap batch produksi melewati pengujian ketat laboratorium pihak ketiga internasional.',
    lab_fixed_carbon: 'Karbon Aktif (Fixed Carbon)',
    lab_ash_content: 'Kadar Abu (Ash Content)',
    lab_moisture: 'Kadar Air (Moisture Content)',
    lab_volatile: 'Volatile Matter',
    lab_certified_by: 'Terverifikasi Oleh',
    lab_global_passed: 'STANDAR GLOBAL PASSED',
    lab_proximate: 'Laporan Analisis Proksimat',
    lab_original_approved: 'ORIGINAL APPROVED',
    lab_cert_id: 'Sertifikat Resmi No. NC-OX/',
    lab_calorific_title: 'NILAI KALORI (HEAT STRENGTH)',
    lab_calorific_desc: 'Menghasilkan panas tertinggi di kelasnya dengan pembakaran merata dari luar sampai ke bagian dalam arang secara konstan.',
    lab_burntime_title: 'WAKTU DURASI BARA (BURN TIME)',
    lab_burntime_desc: 'Komposisi briket alami menjamin durabilitas nyala bara tanpa perlu terlalu sering pengisian ulang, hemat energi dan operasional dapur.',

    // Logistics
    log_sub: 'DISTRIBUSI LOGISTIK GLOBAL',
    log_title: 'Konektivitas Jalur Ekspor & Dokumentasi Mutlak',
    log_desc: 'Memiliki jaringan pelayaran kuat dari Pelabuhan Tanjung Priok (Jakarta) untuk menjangkau pusat grosir arang internasional secara terjadwal.',
    log_frequent_port: 'PELABUHAN TUJUAN FREKUEN',
    log_peta: 'PETA EKSPOR HILIR',
    log_transit_estimate: 'Estimasi Transit',
    log_recurrent_volume: 'VOLUME REKUREN BULANAN',
    log_recurrent_desc: 'Kapasitas suplai reguler, melayani kontrak jangka pendek maupun tahunan.',
    log_vessel_type: 'TIPE KAPAL LOGISTIK',
    log_vessel_desc: 'Tersedia pelindung kelembapan silica gel ekstra per kontainer sesuai standar operasional arang.',
    log_docs_cleanclear: 'DOKUMEN CLEAN & CLEAR',
    log_non_dg_remark: 'Semua arang briket diklasifikasikan sebagai *Non-Dangerous Goods* dengan lampiran uji keandalan pemanasan mandiri (SADT certificate).',
    log_guarantee: 'GARANSI PENGIRIMAN AMAN SESUAI STANDAR MARITIM INTERNASIONAL',

    // Contact
    contact_sub: 'REKANAN BISNIS',
    contact_title: 'Hubungi Kami',
    contact_desc: 'Baik Anda memerlukan kontainer penuh briket shisha premium maupun arang kayu berkualitas untuk jaringan restoran Anda, tim analis ekspor kami siap membantu menyusun penawaran terbaik.',
    contact_headquarters: 'Kantor Pusat',
    contact_address: 'PT. Briket Charcoal Indonesia\nJl. Raya Kronjo No. 18, Sukamulya\nBalaraja, Tangerang, Banten 15610\nIndonesia',
    contact_phone: 'Telepon / WhatsApp',
    contact_email: 'Email Ekspor',
    contact_form_name: 'Nama Lengkap',
    contact_form_name_placeholder: 'Nama Lengkap Anda',
    contact_form_email: 'Alamat Email',
    contact_form_email_placeholder: 'anda@email.com',
    contact_form_product: 'Jenis Produk',
    contact_form_msg: 'Pesan atau Kebutuhan Volume',
    contact_form_msg_placeholder: 'Sebutkan volume pemesanan, pelabuhan tujuan, atau spesifikasi khusus...',
    contact_form_submit: 'Kirim Pertanyaan',
    contact_other: 'Lainnya',
    footer_tagline: 'Produksi arang premium terbaik untuk keberlanjutan bumi dan efisiensi energi mutlak.',
    footer_rights: 'Hak Cipta Dilindungi.',

    // SEO (per-language <title> + meta description, injected at runtime)
    seo_title: 'Bricket Charcoal Indonesia — Eksportir Arang Batok Kelapa Premium',
    seo_desc: 'Eksportir arang briket batok kelapa premium dari Indonesia untuk shisha & BBQ. Abu putih 1.9%, karbon 80%+, bakar 60–120 menit. Ekspor ke Timur Tengah & dunia — sample gratis.',
  },
  en: {
    // Navbar
    nav_home: 'Home',
    nav_about: 'About',
    nav_products: 'Products',
    nav_features: 'Superiority',
    nav_analysis: 'Lab Analysis',
    nav_logistics: 'Logistics',
    nav_contact: 'Contact',
    nav_order_now: 'Order Now',
    nav_search: 'Search Products',
    brand_sub: 'PREMIUM',

    // Hero
    hero_sub: 'TOP QUALITY FOR MAXIMUM RESULTS',
    hero_title_1: 'PREMIUM',
    hero_title_2: 'CHARCOAL',
    hero_desc: 'High-quality charcoal, the best choice for longer burning time, stable heat, and environmentally friendly use.',
    hero_btn_products: 'See Products',
    hero_btn_video: 'Watch Video',
    hero_badge_env: 'Environment',
    hero_badge_env_sub: 'Eco-Friendly',
    hero_badge_burn: 'Longer Lasting',
    hero_badge_burn_sub: 'High Endurance',
    hero_badge_guar: 'Guaranteed',
    hero_badge_guar_sub: 'SGS Tested',
    hero_customer_stats: '1,000+',
    hero_customer_title: 'Happy Clients',

    // Stats
    stats_1_val: '100%',
    stats_1_title: 'Premium Quality',
    stats_1_desc: 'Tested and carefully selected high-quality charcoal.',
    stats_2_val: '8+ Hours',
    stats_2_title: 'Longer Lasting',
    stats_2_desc: 'Stable burning with highly consistent heat.',
    stats_3_val: '1,000+',
    stats_3_title: 'Happy Clients',
    stats_3_desc: 'Customer trust and satisfaction are our main priority.',
    stats_4_val: 'Eco Friendly',
    stats_4_title: 'Environment Friendly',
    stats_4_desc: 'Produced naturally without endangering green forests.',

    // About
    about_sub: 'WHO WE ARE & OUR COMMITMENT',
    about_title: 'Sustainable Energy Provider with Solid Integrity',
    about_desc_1: 'Founded with a vision to elevate natural Indonesian agriculture to the global export market, Bricket Charcoal Indonesia produces and supplies high-grade coconut shell & wood charcoal. We minimize our carbon footprint by turning agricultural side-products into sustainable energy.',
    about_desc_2: 'We work closely with hundreds of local farmer cooperatives to secure reliable raw materials while supporting rural economies through fair-trade practices.',
    about_stat_1_val: '0%',
    about_stat_1_title: 'Chemical Sourcing',
    about_stat_1_desc: 'Free from harmful instant-ignition chemical additives.',
    about_stat_2_val: '< 2.5%',
    about_stat_2_title: 'White Ash Residual',
    about_stat_2_desc: 'Clean burns with minimal residue build-up.',
    about_flow_title: 'INTEGRATED PRODUCTION FLOW',
    about_certified: 'ISO 9001:2015 CERTIFIED',
    about_audit: 'Open Factory Audit Policy',

    // Production Steps
    step_1_title: 'Raw Sourcing & Harvesting',
    step_1_desc: 'Mature, selected coconut shells are gathered directly from local smallholders in Java & Sulawesi.',
    step_2_title: 'Pyrolysis Carbonization',
    step_2_desc: 'Oxygen-deprived controlled burning releases volatile gasses, producing dense charcoal with high fixed carbon.',
    step_3_title: 'Grinding & Sieving',
    step_3_desc: 'Charcoal is crushed into nano-fine powder and meticulously sieved to ensure absolute purity from soil or grit.',
    step_4_title: 'Hydraulic Compaction',
    step_4_desc: 'Formulated with organic tapioca binding starch and pressed under huge hydraulic pressure into geometric bricks.',
    step_5_title: 'Oven Drying',
    step_5_desc: 'Briquettes are dried in thermal chambers for 48 hours, bringing moisture well below the 5% export standard.',

    // Products
    prod_sub: 'OUR PRODUCTS',
    prod_title: 'Selected Quality Charcoal',
    prod_desc: 'Available in custom-curated sizes, matching every domestic and industrial utility requirement.',
    prod_view_all: 'View Available Catalog',
    prod_unit_2kg: ' / 2kg',
    prod_unit_1kg: ' / 1kg',
    prod_name_bbq: 'Premium BBQ Charcoal',
    prod_spec_bbq: 'Size 3–5 cm',
    prod_name_shisha: 'Premium Shisha Briquette',
    prod_spec_shisha: 'Size 2–3 cm',
    prod_name_hex: 'Hexagonal Log Charcoal',
    prod_spec_hex: 'Size 5–7 cm',
    prod_name_briquet: 'Premium Block Briquette',
    prod_spec_briquet: 'Size 4x4x4 cm',

    // Lab Analysis
    lab_sub: 'INTERNATIONAL LABORATORY STANDARDS',
    lab_title: 'Certification & Chemical Analysis of Products',
    lab_desc: 'Bricket Charcoal Indonesia is fully committed to absolute transparency. Every production batch passes stringent testing by international third-party laboratories.',
    lab_fixed_carbon: 'Fixed Carbon',
    lab_ash_content: 'Ash Content',
    lab_moisture: 'Moisture Content',
    lab_volatile: 'Volatile Matter',
    lab_certified_by: 'Verified By',
    lab_global_passed: 'GLOBAL STANDARDS MET',
    lab_proximate: 'Proximate Analysis Report',
    lab_original_approved: 'ORIGINAL APPROVED',
    lab_cert_id: 'Official Certificate No. NC-OX/',
    lab_calorific_title: 'CALORIFIC VALUE (HEAT STRENGTH)',
    lab_calorific_desc: 'Generates top-tier heat output with constant, even burning distribution from core to surface.',
    lab_burntime_title: 'COMBUSTION BAR DURATION (BURN TIME)',
    lab_burntime_desc: 'Organic composition ensures extreme glowing endurance without frequent refills, reducing kitchen overhead.',

    // Logistics
    log_sub: 'GLOBAL LOGISTICS DISTRIBUTION',
    log_title: 'Export Shipping Connectivity & Complete Documentation',
    log_desc: 'Operating high-frequency cargo connections from the Port of Tanjung Priok (Jakarta) to international logistics hubs regularly.',
    log_frequent_port: 'FREQUENT DESTINATION PORTS',
    log_peta: 'DOWNSTREAM EXPORT MAP',
    log_transit_estimate: 'Transit Estimate',
    log_recurrent_volume: 'MONTHLY RECURRENT VOLUME',
    log_recurrent_desc: 'Reliable supply lines supporting short-term and multi-year supply agreement contracts.',
    log_vessel_type: 'Vessel Cargo Spec',
    log_vessel_desc: 'Extra high-grade desiccant silica gel packets inserted in every container to neutralize oceanic moisture.',
    log_docs_cleanclear: 'CLEAN & CLEAR DOCUMENTS',
    log_non_dg_remark: 'All briquette lines are officially certified as Non-Dangerous Goods with active SADT test certificates attached.',
    log_guarantee: 'SAFE DELIVERY GUARANTEED UNDER INTERNATIONAL MARITIME STANDARDS',

    // Contact
    contact_sub: 'BUSINESS REGISTRY',
    contact_title: 'Contact Our Team',
    contact_desc: 'Whether you require ocean freight full-containers of shisha briquettes, or wholesale restaurant charcoal, our export team is ready to assist you.',
    contact_headquarters: 'Headquarters',
    contact_address: 'PT. Briket Charcoal Indonesia\nJl. Raya Kronjo No. 18, Sukamulya\nBalaraja, Tangerang, Banten 15610\nIndonesia',
    contact_phone: 'Phone / WhatsApp',
    contact_email: 'Export Inquiry Email',
    contact_form_name: 'Full Name',
    contact_form_name_placeholder: 'Your Full Name',
    contact_form_email: 'Email Address',
    contact_form_email_placeholder: 'you@email.com',
    contact_form_product: 'Product Category',
    contact_form_msg: 'Inquiry or Volume Requirements',
    contact_form_msg_placeholder: 'Specify ocean volume, destination sea port, or customized sizing...',
    contact_form_submit: 'Submit Export Inquiry',
    contact_other: 'Other Option',
    footer_tagline: 'Manufacturing premium charcoal products to power global sustainability and absolute heating efficiency.',
    footer_rights: 'All Rights Reserved.',

    // SEO (per-language <title> + meta description, injected at runtime)
    seo_title: 'Premium Charcoal Briquettes — Coconut Shell Charcoal Exporter | Bricket Charcoal Indonesia',
    seo_desc: 'Premium coconut shell charcoal briquettes for shisha (hookah) & BBQ, exported worldwide from Indonesia. White ash 1.9%, fixed carbon 80%+, 60–120 min burn. Free sample — wholesale, negotiable per container.',
  },
  ar: {
    // Navbar
    nav_home: 'الرئيسية',
    nav_about: 'من نحن',
    nav_products: 'منتجاتنا',
    nav_features: 'ميزاتنا',
    nav_analysis: 'تقارير المختبر',
    nav_logistics: 'الدعم اللوجستي',
    nav_contact: 'اتصل بنا',
    nav_order_now: 'اطلب الآن',
    nav_search: 'البحث عن المنتجات',
    brand_sub: 'فاخر',

    // Hero
    hero_sub: 'جودة مثالية لأفضل النتائج',
    hero_title_1: 'فحم كوكو',
    hero_title_2: 'دولى ممتاز',
    hero_desc: 'فحم ممتاز بأعلى جودة، الخيار الأفضل للحرق الطويل، والحرارة الثابتة، وصديق للبيئة تماماً.',
    hero_btn_products: 'عرض المنتجات',
    hero_btn_video: 'شاهد الفيديو',
    hero_badge_env: 'البيئة والوقود',
    hero_badge_env_sub: 'صديق للبيئة',
    hero_badge_burn: 'مدة أطول بقاءً',
    hero_badge_burn_sub: 'احتراق أطول',
    hero_badge_guar: 'جودة مضمونة',
    hero_badge_guar_sub: 'جودة منتقاة',
    hero_customer_stats: '١٠٠٠+',
    hero_customer_title: 'عميل سعيد',

    // Stats
    stats_1_val: '١٠٠٪',
    stats_1_title: 'جودة ممتازة',
    stats_1_desc: 'فحم منتقى بعناية وخاضع لأرقى معايير الفحص والتدقيق.',
    stats_2_val: '٨+ ساعات',
    stats_2_title: 'اشتعال مستمر',
    stats_2_desc: 'احتراق نقي متوازن مع إنتاج مستمر للحرارة الكثيفة.',
    stats_3_val: '١٠٠٠+',
    stats_3_title: 'عميل مسرور',
    stats_3_desc: 'ثقة عملائنا الكرام وموثوقية منتجنا هي دافعنا الدائم.',
    stats_4_val: 'صديق للبيئة',
    stats_4_title: 'تنمية مستدامة',
    stats_4_desc: 'تصنيع طبيعي متكامل يحافظ على الرئة الخضراء للكوكب.',

    // About
    about_sub: 'من نحن وما نقدمه للعميل الدولي',
    about_title: 'مزود رائد للطاقة المستدامة بنزاهة واحترافية عالية',
    about_desc_1: 'تأسست شركتنا برؤية طموحة تهدف لرفع كفاءة ومستوى المنتجات الزراعية الإندونيسية لتصل لأسواق التصدير العالمية. ننتج ونوفر أجود أنواع الفحم النباتي من جوز الهند والأخشاب بجراية بيئية متكاملة لتقليل البصمة الكربونية واستغلال الموارد بنبل.',
    about_desc_2: 'نتعاون وندعم مئات المجموعات الزراعية المحلية لضمان تدفق المواد الخام وتحفيز الاقتصاد المحلي القروي بنزاهة التجارة العادلة والشفافة.',
    about_stat_1_val: '٠٪',
    about_stat_1_title: 'أثر كيميائي',
    about_stat_1_desc: 'خالٍ تماماً من الكبريت والمواد الكيميائية المسرعة للاشتعال السامة.',
    about_stat_2_val: 'أقل من ٢.٥٪',
    about_stat_2_title: 'معدل الرماد',
    about_stat_2_desc: 'احتراق نظيف جداً يترك خلفه رماداً أبيض ناصعاً وخالٍ من الغبار.',
    about_flow_title: 'خطوط الإنتاج المتكاملة والمغلقة',
    about_certified: 'حاصل على شهادة الجودة العالمية ISO 9001:2015',
    about_audit: 'سياسة المصنع وأبوابه المفتوحة لسيادة المفتشين',

    // Production Steps
    step_1_title: 'تأمين واختيار المواد الخام',
    step_1_desc: 'نقوم بجمع قشور جوز الهند الصلبة من صغار المزارعين في سولاويزي وجاوة بعلاقات تجارية منصفة.',
    step_2_title: 'الحرق بمعزل عن الأكسجين (التحلل الحراري)',
    step_2_desc: 'تطبيق حرارة محكومة وخالية من الأكسجين لطرد الغازات والحصول على كربون نقي صلب.',
    step_3_title: 'السحق والتنقية المتناهية',
    step_3_desc: 'طحن الفحم لمستوى جودة النانو وثم تصفية متناهية لاستبعاد أي شوائب طينية أو حصوية.',
    step_4_title: 'التشكيل الهيدروليكي عالي القوة',
    step_4_desc: 'عجن الشذرات بالنشا الطبيعي الصافي وكبسها بهيدروليكيات جبارة لتحديد أبعاد هندسية صلبة.',
    step_5_title: 'التجفيف في الأفران الحرارية',
    step_5_desc: 'وضع المكعبات في أفران التجفيف المستمر لـ ٤٨ ساعة لخفض مستويات الرطوبة لما دون ٥٪.',

    // Products
    prod_sub: 'كتالوج المنتجات الفاخرة',
    prod_title: 'فحم طبيعي بضمان الجودة والتصدير',
    prod_desc: 'متوفر بمقاسات وأغراض متعددة لتناسب الطقوس المنزلية المتنوعة ومنظومة المطاعم ومحلات الضيافة الكبرى.',
    prod_view_all: 'عرض الكتالوج بالكامل',
    prod_unit_2kg: ' / ٢ كجم',
    prod_unit_1kg: ' / ١ كجم',
    prod_name_bbq: 'فحم شواء سوبر',
    prod_spec_bbq: 'مقاس ٣-٥ سم',
    prod_name_shisha: 'فحم شيشة ذهبي',
    prod_spec_shisha: 'مقاس ٢-٣ سم',
    prod_name_hex: 'سداسي الشكل مطول',
    prod_spec_hex: 'مقاس ٥-٧ سم',
    prod_name_briquet: 'بينات مكعب بكت بارد',
    prod_spec_briquet: 'مقاس ٤×٤×٤ سم',

    // Lab Analysis
    lab_sub: 'المواصفات القياسية والمختبرية العالمية',
    lab_title: 'الشهادات الفنية والتحاليل المخبرية لمنتجاتنا',
    lab_desc: 'نلتزم بالشفافية الكاملة مع شركاء التصدير الدوليين. تمر عيناتنا بأدق تحاليل فحص الكيمياء لدى أطراف مستقلة ومعتمدة.',
    lab_fixed_carbon: 'الكربون الثابت النشط',
    lab_ash_content: 'نسبة الرماد المتبقي',
    lab_moisture: 'معدل الرطوبة التراكمي',
    lab_volatile: 'المواد المتطايرة',
    lab_certified_by: 'تم الفحص والاعتماد بواسطة',
    lab_global_passed: 'مطابق للمواصفات العالمية والتصدير',
    lab_proximate: 'تقرير التحليل التقريبي للمكونات',
    lab_original_approved: 'معتمد ومصدق أصلياً',
    lab_cert_id: 'رقم الفحص الدولي الرسمي NC-OX/',
    lab_calorific_title: 'معدل القوة الحرارية والحرارة الكامنة',
    lab_calorific_desc: 'يولد أعلى طاقة حرارية في فئته بفضل الكثافة الكربونية الشديدة التي تنشر اللهب بصمت وتماسك.',
    lab_burntime_title: 'متوسط دوام اشتعال الفحم ودورانه',
    lab_burntime_desc: 'يعمل التكوين المضغوط بشكل مثالي على بقاء اللهب متقداً بغير انقطاع، مما يوفر الجهد التشغيلي للطهي والضيافة ومصاريف الاستهلاك.',

    // Logistics
    log_sub: 'مركز التوزيع والشحن اللوجستي العابر للقارات',
    log_title: 'طرق الشحن البحري الموثقة وسلامة المستندات',
    log_desc: 'تدار عملياتنا البحرية مباشرة من ميناء تانجونغ بريوك (جاكرتا) لضمان توفير خطوط نقل عالية الانتظام ومجدولة للوجهات العالمية.',
    log_frequent_port: 'الموانئ والمحطات الأكثر تردداً للعملاء',
    log_peta: 'خريطة الشحن البحري باتجاه المصب',
    log_transit_estimate: 'وقت العبور المقدر',
    log_recurrent_volume: 'متوسط شحنات التصدير المستمرة شهرياً',
    log_recurrent_desc: 'قدرت إمداد استباقي مرن، لخدمة عقود الشراء الفورية والعقود الدورية ربع السنوية والسنوية.',
    log_vessel_type: 'سعات وخطوط حاويات الملاحة',
    log_vessel_desc: 'مستوعبات محكمة الإغلاق مزودة بتقنيات عزل رطوبي بحري متقدمة لسلامة الفحم وحمايته طوال الرحلة البحرية.',
    log_docs_cleanclear: 'مستندات التصدير وموافقات الإفراج البيئي',
    log_non_dg_remark: 'جميع شحنات الفحم لدينا مصنفة كسلع غير خطرة بموافقة رسمية وعبر شهادة اختبار الثبات الحراري SADT المعترف بها جمركياً.',
    log_guarantee: 'ضمان الشحن الآمن والوصول في الميعاد وفق قواعد الملاحة الدولية البحرية',

    // Contact
    contact_sub: 'خدمات واتصالات الشركاء التجاريين',
    contact_title: 'تواصل مع الإدارة الدولية وقسم التصدير',
    contact_desc: 'سواء كنت بصدد طلب حاويات تصدير كاملة لفحم الشيشة وجوز الهند، أو تود الحصول على كميات شواء ضخمة لسلاسل الضيافة خاصتكم، الخبراء لدينا بانتظارك.',
    contact_headquarters: 'المكتب الإداري الرئيسي',
    contact_address: 'PT. Briket Charcoal Indonesia\nشارع رايا كرونجو رقم ١٨، سوكامويا\nبالاراجا، تانجيرانج، بانتين ١٥٦١٠\nإندونيسيا',
    contact_phone: 'الهاتف / رقم واتساب الدولي',
    contact_email: 'بوابة مراسلات التصدير والمبيعات',
    contact_form_name: 'الاسم الكريم بالكامل',
    contact_form_name_placeholder: 'أدخل اسمك الكريم بالكامل هنا',
    contact_form_email: 'البريد الإلكتروني المفضل',
    contact_form_email_placeholder: 'yourname@email.com',
    contact_form_product: 'نوع الفحم المطلوب الاستفسار عنه',
    contact_form_msg: 'طلبك الفني أو مقدار الكميات والوزن المستهدف',
    contact_form_msg_placeholder: 'يرجى تحديد حجم الشحنة بالحاويات، ميناء الوصول المطلوب، أو أي تعديل على المقاييس والمواصفات المحددة...',
    contact_form_submit: 'إرسال طلب الاستفسار للتصدير فوراً',
    contact_other: 'آخر',
    footer_tagline: 'تصنيع منتجات فحم طبيعية فاخرة لتمديد استقرار الطاقة المستدامة ودفئها العائلي والأخلاقي على كوكب الأرض.',
    footer_rights: 'جميع الحقوق الفنية والتجارية محفوظة لمؤسستنا.',

    // SEO (per-language <title> + meta description, injected at runtime)
    seo_title: 'فحم شيشة وفحم شواء فاخر من قشر جوز الهند — مصدّر من إندونيسيا | Bricket Charcoal Indonesia',
    seo_desc: 'فحم قوالب فاخر من قشر جوز الهند للشيشة (الأركيلة) والشواء، تصدير عالمي من إندونيسيا. رماد أبيض 1.9%، كربون ثابت 80%+، اشتعال 60–120 دقيقة. عينة مجانية — بالجملة، السعر قابل للتفاوض للحاوية.',
  },
  fa: {
    // Navbar
    nav_home: 'خانه',
    nav_about: 'درباره ما',
    nav_products: 'محصولات',
    nav_features: 'مزایا',
    nav_analysis: 'آنالیز آزمایشگاهی',
    nav_logistics: 'لجستیک',
    nav_contact: 'تماس با ما',
    nav_order_now: 'سفارش دهید',
    nav_search: 'جستجوی محصولات',
    brand_sub: 'ممتاز',

    // Hero
    hero_sub: 'کیفیت برتر برای بهترین نتیجه',
    hero_title_1: 'زغال کوکو',
    hero_title_2: 'ممتاز صادراتی',
    hero_desc: 'زغال با کیفیت بالا، بهترین انتخاب برای سوختن طولانی‌تر، حرارت پایدار و کاملاً سازگار با محیط زیست.',
    hero_btn_products: 'مشاهده محصولات',
    hero_btn_video: 'تماشای ویدیو',
    hero_badge_env: 'محیط زیست',
    hero_badge_env_sub: 'سازگار با طبیعت',
    hero_badge_burn: 'ماندگاری بیشتر',
    hero_badge_burn_sub: 'سوختن طولانی',
    hero_badge_guar: 'تضمین کیفیت',
    hero_badge_guar_sub: 'کیفیت منتخب',
    hero_customer_stats: '+۱۰۰۰',
    hero_customer_title: 'مشتری راضی',

    // Stats
    stats_1_val: '۱۰۰٪',
    stats_1_title: 'کیفیت ممتاز',
    stats_1_desc: 'زغال منتخب و آزمایش‌شده با بالاترین استانداردهای کیفی.',
    stats_2_val: '+۸ ساعت',
    stats_2_title: 'ماندگاری بیشتر',
    stats_2_desc: 'سوختن پایدار با حرارت یکنواخت و مداوم.',
    stats_3_val: '+۱۰۰۰',
    stats_3_title: 'مشتری راضی',
    stats_3_desc: 'اعتماد مشتریان اولویت اصلی ماست.',
    stats_4_val: 'سازگار با محیط زیست',
    stats_4_title: 'دوستدار طبیعت',
    stats_4_desc: 'تولید کاملاً طبیعی بدون آسیب به محیط زیست.',

    // About
    about_sub: 'ما که هستیم و تعهد ما',
    about_title: 'تأمین‌کننده انرژی پایدار با درستکاری کامل',
    about_desc_1: 'شرکت Bricket Charcoal Indonesia با چشم‌اندازی برای رساندن محصولات کشاورزی اندونزی به بازارهای صادراتی جهان تأسیس شد. ما زغال مرغوب پوست نارگیل و چوب تولید و عرضه می‌کنیم و با بهره‌گیری از محصولات جانبی کشاورزی، ردپای کربنی را به حداقل می‌رسانیم.',
    about_desc_2: 'ما با صدها تعاونی کشاورزی محلی همکاری نزدیک داریم تا تأمین پایدار مواد اولیه را تضمین کرده و اقتصاد روستایی را از طریق تجارت منصفانه تقویت کنیم.',
    about_stat_1_val: '۰٪',
    about_stat_1_title: 'افزودنی شیمیایی',
    about_stat_1_desc: 'بدون گوگرد و مواد شیمیایی خطرناک برای اشتعال سریع.',
    about_stat_2_val: 'کمتر از ۲.۵٪',
    about_stat_2_title: 'خاکستر سفید باقی‌مانده',
    about_stat_2_desc: 'سوختن تمیز با کمترین باقی‌مانده و رسوب.',
    about_flow_title: 'خط تولید یکپارچه',
    about_certified: 'دارای گواهی ISO 9001:2015',
    about_audit: 'سیاست بازرسی آزاد کارخانه',

    // Production Steps
    step_1_title: 'تأمین و برداشت مواد اولیه',
    step_1_desc: 'پوست نارگیل رسیده و منتخب مستقیماً از کشاورزان محلی جاوه و سولاوسی جمع‌آوری می‌شود.',
    step_2_title: 'کربن‌سازی با پیرولیز',
    step_2_desc: 'سوزاندن کنترل‌شده و بدون اکسیژن، گازهای فرّار را خارج کرده و زغالی متراکم با کربن ثابت بالا تولید می‌کند.',
    step_3_title: 'آسیاب و الک کردن',
    step_3_desc: 'زغال به پودری بسیار ریز آسیاب و با دقت الک می‌شود تا کاملاً عاری از خاک و شن باشد.',
    step_4_title: 'فشرده‌سازی هیدرولیکی',
    step_4_desc: 'با چسب طبیعی نشاسته تاپیوکا ترکیب و تحت فشار بالای هیدرولیک به قالب‌های هندسی فشرده می‌شود.',
    step_5_title: 'خشک‌کردن در کوره',
    step_5_desc: 'بریکت‌ها به مدت ۴۸ ساعت در کوره حرارتی خشک می‌شوند تا رطوبت به زیر استاندارد صادراتی ۵٪ برسد.',

    // Products
    prod_sub: 'محصولات ما',
    prod_title: 'زغال با کیفیت منتخب',
    prod_desc: 'در اندازه‌های متنوع برای پاسخگویی به نیازهای خانگی تا تجاری و مجموعه‌های پذیرایی.',
    prod_view_all: 'مشاهده کل کاتالوگ',
    prod_unit_2kg: ' / ۲ کیلوگرم',
    prod_unit_1kg: ' / ۱ کیلوگرم',
    prod_name_bbq: 'زغال شواء ممتاز',
    prod_spec_bbq: 'اندازه ۳ تا ۵ سانتی‌متر',
    prod_name_shisha: 'زغال قلیان ممتاز',
    prod_spec_shisha: 'اندازه ۲ تا ۳ سانتی‌متر',
    prod_name_hex: 'زغال شش‌ضلعی',
    prod_spec_hex: 'اندازه ۵ تا ۷ سانتی‌متر',
    prod_name_briquet: 'بریکت قالبی ممتاز',
    prod_spec_briquet: 'اندازه ۴×۴×۴ سانتی‌متر',

    // Lab Analysis
    lab_sub: 'استانداردهای آزمایشگاهی بین‌المللی',
    lab_title: 'گواهی‌نامه‌ها و آنالیز شیمیایی محصولات',
    lab_desc: 'ما به شفافیت کامل با شرکای صادراتی متعهدیم. هر سری تولید توسط آزمایشگاه‌های مستقل بین‌المللی آزمایش می‌شود.',
    lab_fixed_carbon: 'کربن ثابت',
    lab_ash_content: 'میزان خاکستر',
    lab_moisture: 'میزان رطوبت',
    lab_volatile: 'مواد فرّار',
    lab_certified_by: 'تأیید شده توسط',
    lab_global_passed: 'مطابق با استانداردهای جهانی',
    lab_proximate: 'گزارش آنالیز تقریبی',
    lab_original_approved: 'اصل و تأیید‌شده',
    lab_cert_id: 'گواهی رسمی شماره NC-OX/',
    lab_calorific_title: 'ارزش حرارتی (قدرت گرما)',
    lab_calorific_desc: 'به‌لطف تراکم کربنی بالا، بیشترین گرمای کلاس خود را با سوختن یکنواخت از مغز تا سطح تولید می‌کند.',
    lab_burntime_title: 'مدت‌زمان اشتعال',
    lab_burntime_desc: 'ترکیب فشرده و طبیعی، ماندگاری طولانی شعله را بدون نیاز به شارژ مکرر تضمین می‌کند و هزینه عملیاتی را کاهش می‌دهد.',

    // Logistics
    log_sub: 'توزیع لجستیک جهانی',
    log_title: 'اتصال خطوط صادراتی و مستندات کامل',
    log_desc: 'با خطوط باری پرتردد از بندر تانجونگ پریوک (جاکارتا) به‌صورت منظم به مراکز لجستیک بین‌المللی خدمات می‌دهیم.',
    log_frequent_port: 'بنادر مقصد پرتردد',
    log_peta: 'نقشه صادرات',
    log_transit_estimate: 'زمان تقریبی حمل',
    log_recurrent_volume: 'حجم ماهانه مستمر',
    log_recurrent_desc: 'ظرفیت تأمین منظم برای قراردادهای کوتاه‌مدت و سالانه.',
    log_vessel_type: 'مشخصات کانتینر باری',
    log_vessel_desc: 'در هر کانتینر بسته‌های سیلیکاژل مرغوب برای جذب رطوبت دریایی قرار داده می‌شود.',
    log_docs_cleanclear: 'مدارک کامل و شفاف',
    log_non_dg_remark: 'تمام بریکت‌ها به‌عنوان کالای غیرخطرناک (Non-DG) با گواهی آزمون SADT دسته‌بندی و تأیید شده‌اند.',
    log_guarantee: 'تضمین تحویل ایمن مطابق استانداردهای دریایی بین‌المللی',

    // Contact
    contact_sub: 'شرکای تجاری',
    contact_title: 'با ما تماس بگیرید',
    contact_desc: 'چه به کانتینر کامل بریکت قلیان ممتاز نیاز دارید و چه زغال باکیفیت برای زنجیره رستوران‌ها، تیم صادراتی ما آماده ارائه بهترین پیشنهاد است.',
    contact_headquarters: 'دفتر مرکزی',
    contact_address: 'PT. Briket Charcoal Indonesia\nخیابان رایا کرونجو شماره ۱۸، سوکامولیا\nبالاراجا، تانگرانگ، بانتن ۱۵۶۱۰\nاندونزی',
    contact_phone: 'تلفن / واتساپ',
    contact_email: 'ایمیل صادرات',
    contact_form_name: 'نام کامل',
    contact_form_name_placeholder: 'نام کامل شما',
    contact_form_email: 'آدرس ایمیل',
    contact_form_email_placeholder: 'you@email.com',
    contact_form_product: 'نوع محصول',
    contact_form_msg: 'پیام یا میزان سفارش',
    contact_form_msg_placeholder: 'حجم سفارش، بندر مقصد یا مشخصات ویژه را ذکر کنید...',
    contact_form_submit: 'ارسال درخواست',
    contact_other: 'سایر',
    footer_tagline: 'تولید بهترین زغال ممتاز برای پایداری زمین و کارایی مطلق انرژی.',
    footer_rights: 'کلیه حقوق محفوظ است.',

    // SEO (per-language <title> + meta description, injected at runtime)
    seo_title: 'زغال قلیان و باربیکیو ممتاز از پوست نارگیل — صادرات از اندونزی | Bricket Charcoal Indonesia',
    seo_desc: 'بریکت زغال ممتاز پوست نارگیل برای قلیان و باربیکیو، صادرات جهانی از اندونزی. خاکستر سفید ۱.۹٪، کربن ثابت ۸۰٪+، سوختن ۶۰ تا ۱۲۰ دقیقه. نمونه رایگان — عمده، قیمت توافقی برای هر کانتینر.',
  },
  tr: {
    // Navbar
    nav_home: 'Ana Sayfa',
    nav_about: 'Hakkımızda',
    nav_products: 'Ürünler',
    nav_features: 'Avantajlar',
    nav_analysis: 'Laboratuvar Analizi',
    nav_logistics: 'Lojistik',
    nav_contact: 'İletişim',
    nav_order_now: 'Sipariş Ver',
    nav_search: 'Ürün Ara',
    brand_sub: 'PREMIUM',

    // Hero
    hero_sub: 'MAKSIMUM SONUÇ İÇİN EN İYİ KALİTE',
    hero_title_1: 'PREMIUM',
    hero_title_2: 'KÖMÜR',
    hero_desc: 'Yüksek kaliteli kömür; daha uzun yanma süresi, dengeli ısı ve çevre dostu kullanım için en iyi seçim.',
    hero_btn_products: 'Ürünleri Gör',
    hero_btn_video: 'Videoyu İzle',
    hero_badge_env: 'Çevre',
    hero_badge_env_sub: 'Çevre Dostu',
    hero_badge_burn: 'Daha Dayanıklı',
    hero_badge_burn_sub: 'Uzun Yanma',
    hero_badge_guar: 'Garantili',
    hero_badge_guar_sub: 'Test Edilmiş',
    hero_customer_stats: '1.000+',
    hero_customer_title: 'Mutlu Müşteri',

    // Stats
    stats_1_val: '%100',
    stats_1_title: 'Premium Kalite',
    stats_1_desc: 'Test edilmiş, özenle seçilmiş yüksek kaliteli kömür.',
    stats_2_val: '8+ Saat',
    stats_2_title: 'Daha Dayanıklı',
    stats_2_desc: 'Tutarlı ısı ile dengeli yanma.',
    stats_3_val: '1.000+',
    stats_3_title: 'Mutlu Müşteri',
    stats_3_desc: 'Müşteri güveni ve memnuniyeti önceliğimizdir.',
    stats_4_val: 'Çevre Dostu',
    stats_4_title: 'Doğa Dostu',
    stats_4_desc: 'Doğaya zarar vermeden, doğal yöntemlerle üretilir.',

    // About
    about_sub: 'BİZ KİMİZ & TAAHHÜDÜMÜZ',
    about_title: 'Sağlam Dürüstlükle Sürdürülebilir Enerji Sağlayıcısı',
    about_desc_1: 'Bricket Charcoal Indonesia, Endonezya tarımını küresel ihracat pazarına taşıma vizyonuyla kuruldu. Yüksek kaliteli hindistan cevizi kabuğu ve odun kömürü üretip tedarik ediyor, tarımsal yan ürünleri değerlendirerek karbon ayak izini en aza indiriyoruz.',
    about_desc_2: 'Hammadde tedarikini güvence altına almak ve kırsal ekonomiyi adil ticaret ilkeleriyle desteklemek için yüzlerce yerel çiftçi kooperatifiyle yakın çalışıyoruz.',
    about_stat_1_val: '%0',
    about_stat_1_title: 'Kimyasal Katkı',
    about_stat_1_desc: 'Zararlı hızlı tutuşturucu kimyasallar içermez.',
    about_stat_2_val: '< %2,5',
    about_stat_2_title: 'Beyaz Kül Kalıntısı',
    about_stat_2_desc: 'Minimum kalıntı ile temiz yanma.',
    about_flow_title: 'ENTEGRE ÜRETİM AKIŞI',
    about_certified: 'ISO 9001:2015 SERTİFİKALI',
    about_audit: 'Açık Fabrika Denetim Politikası',

    // Production Steps
    step_1_title: 'Hammadde Tedariki & Hasat',
    step_1_desc: 'Olgun, seçilmiş hindistan cevizi kabukları Java ve Sulawesi\'deki yerel üreticilerden doğrudan toplanır.',
    step_2_title: 'Piroliz Karbonizasyon',
    step_2_desc: 'Oksijensiz kontrollü yanma uçucu gazları uzaklaştırır ve yüksek sabit karbonlu yoğun kömür üretir.',
    step_3_title: 'Öğütme & Eleme',
    step_3_desc: 'Kömür nano incelikte toz haline getirilir ve toprak ile kumdan tamamen arındırmak için titizlikle elenir.',
    step_4_title: 'Hidrolik Presleme',
    step_4_desc: 'Organik tapyoka nişastası ile karıştırılıp yüksek hidrolik basınçla geometrik briketlere preslenir.',
    step_5_title: 'Fırında Kurutma',
    step_5_desc: 'Briketler 48 saat termal fırınlarda kurutularak nem %5 ihracat standardının altına indirilir.',

    // Products
    prod_sub: 'ÜRÜNLERİMİZ',
    prod_title: 'Seçkin Kaliteli Kömür',
    prod_desc: 'Evsel kullanımdan endüstriyel ve ağırlama sektörüne kadar her ihtiyaca uygun boyutlarda mevcuttur.',
    prod_view_all: 'Tüm Kataloğu Gör',
    prod_unit_2kg: ' / 2kg',
    prod_unit_1kg: ' / 1kg',
    prod_name_bbq: 'Premium Mangal Kömürü',
    prod_spec_bbq: 'Boyut 3–5 cm',
    prod_name_shisha: 'Premium Nargile Kömürü',
    prod_spec_shisha: 'Boyut 2–3 cm',
    prod_name_hex: 'Altıgen Kömür',
    prod_spec_hex: 'Boyut 5–7 cm',
    prod_name_briquet: 'Premium Blok Briket',
    prod_spec_briquet: 'Boyut 4x4x4 cm',

    // Lab Analysis
    lab_sub: 'ULUSLARARASI LABORATUVAR STANDARTLARI',
    lab_title: 'Ürünlerin Sertifikasyonu & Kimyasal Analizi',
    lab_desc: 'İhracat ortaklarımıza tam şeffaflık taahhüt ediyoruz. Her üretim partisi bağımsız uluslararası laboratuvarlarda titizlikle test edilir.',
    lab_fixed_carbon: 'Sabit Karbon',
    lab_ash_content: 'Kül Oranı',
    lab_moisture: 'Nem Oranı',
    lab_volatile: 'Uçucu Madde',
    lab_certified_by: 'Onaylayan',
    lab_global_passed: 'KÜRESEL STANDARTLAR KARŞILANDI',
    lab_proximate: 'Kısa Analiz Raporu',
    lab_original_approved: 'ORİJİNAL ONAYLI',
    lab_cert_id: 'Resmi Sertifika No. NC-OX/',
    lab_calorific_title: 'KALORİFİK DEĞER (ISI GÜCÜ)',
    lab_calorific_desc: 'Yüksek karbon yoğunluğu sayesinde sınıfının en yüksek ısısını, çekirdekten yüzeye eşit yanmayla üretir.',
    lab_burntime_title: 'YANMA SÜRESİ',
    lab_burntime_desc: 'Doğal ve sıkıştırılmış yapı, sık takviye gerektirmeden uzun süreli köz sağlar ve işletme maliyetini düşürür.',

    // Logistics
    log_sub: 'KÜRESEL LOJİSTİK DAĞITIMI',
    log_title: 'İhracat Sevkiyat Bağlantıları & Eksiksiz Belgeler',
    log_desc: 'Tanjung Priok Limanı\'ndan (Jakarta) uluslararası lojistik merkezlerine düzenli, yüksek frekanslı kargo bağlantıları işletiyoruz.',
    log_frequent_port: 'SIK VARIŞ LİMANLARI',
    log_peta: 'İHRACAT HARİTASI',
    log_transit_estimate: 'Tahmini Transit',
    log_recurrent_volume: 'AYLIK DÜZENLİ HACİM',
    log_recurrent_desc: 'Kısa vadeli ve çok yıllık tedarik sözleşmelerini destekleyen güvenilir arz kapasitesi.',
    log_vessel_type: 'Konteyner Kargo Özelliği',
    log_vessel_desc: 'Deniz nemini nötralize etmek için her konteynere yüksek kaliteli silika jel paketleri yerleştirilir.',
    log_docs_cleanclear: 'TEMİZ & EKSİKSİZ BELGELER',
    log_non_dg_remark: 'Tüm briket hatları, geçerli SADT test sertifikalarıyla Tehlikesiz Madde (Non-DG) olarak resmen belgelendirilmiştir.',
    log_guarantee: 'ULUSLARARASI DENİZCİLİK STANDARTLARINA GÖRE GÜVENLİ TESLİMAT GARANTİSİ',

    // Contact
    contact_sub: 'İŞ ORTAKLIĞI',
    contact_title: 'Bize Ulaşın',
    contact_desc: 'İster tam konteyner premium nargile briketi, ister restoran zinciriniz için toptan kaliteli kömür ihtiyacınız olsun, ihracat ekibimiz size en iyi teklifi sunmaya hazır.',
    contact_headquarters: 'Genel Merkez',
    contact_address: 'PT. Briket Charcoal Indonesia\nJl. Raya Kronjo No. 18, Sukamulya\nBalaraja, Tangerang, Banten 15610\nEndonezya',
    contact_phone: 'Telefon / WhatsApp',
    contact_email: 'İhracat E-postası',
    contact_form_name: 'Ad Soyad',
    contact_form_name_placeholder: 'Adınız ve Soyadınız',
    contact_form_email: 'E-posta Adresi',
    contact_form_email_placeholder: 'siz@email.com',
    contact_form_product: 'Ürün Kategorisi',
    contact_form_msg: 'Mesaj veya Hacim İhtiyacı',
    contact_form_msg_placeholder: 'Sipariş hacmini, varış limanını veya özel spesifikasyonları belirtin...',
    contact_form_submit: 'Talebi Gönder',
    contact_other: 'Diğer',
    footer_tagline: 'Küresel sürdürülebilirlik ve mutlak ısı verimliliği için premium kömür üretimi.',
    footer_rights: 'Tüm Hakları Saklıdır.',

    // SEO (per-language <title> + meta description, injected at runtime)
    seo_title: 'Premium Nargile & Mangal Kömürü — Hindistan Cevizi Kömürü İhracatçısı | Bricket Charcoal Indonesia',
    seo_desc: 'Nargile ve mangal için premium hindistan cevizi kabuğu briket kömürü, Endonezya\'dan dünyaya ihracat. Beyaz kül %1,9, sabit karbon %80+, 60–120 dk yanma. Ücretsiz numune — toptan, konteyner başına pazarlıklı fiyat.',
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Canonical site origin (used for per-language canonical + og:url). Keep in sync
// with index.html / sitemap.xml. ⚠️ Swap to the final domain at deploy time.
const SITE_ORIGIN = 'https://bricketcharcoal.com';
// Map each language to its Open Graph locale + URL path. English lives at root
// (x-default); every other language sits under /<lang>/.
const OG_LOCALE: Record<LanguageType, string> = {
  en: 'en_US', id: 'id_ID', ar: 'ar_SA', fa: 'fa_IR', tr: 'tr_TR',
};
const langPath = (lang: LanguageType) => (lang === 'en' ? '/' : `/${lang}/`);

const isSupported = (v: unknown): v is LanguageType =>
  typeof v === 'string' && (SUPPORTED_LANGS as string[]).includes(v);

// Detect the language embedded in the current URL path (/ar/, /fa/…) — this is
// what makes the per-language prerendered pages resolve to the right language.
const langFromPath = (): LanguageType | null => {
  try {
    const seg = window.location.pathname.split('/').filter(Boolean)[0];
    return isSupported(seg) ? seg : null;
  } catch (_) { return null; }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    // Priority: ?lang= param (deep links) → /<lang>/ path → saved choice →
    // the lang baked into the prerendered <html lang> → English (default/x-default).
    try {
      const p = new URLSearchParams(window.location.search).get('lang');
      if (isSupported(p)) return p;
    } catch (_) {}
    const fromPath = langFromPath();
    if (fromPath) return fromPath;
    try {
      const saved = localStorage.getItem('arang_lang');
      if (isSupported(saved)) return saved;
    } catch (_) {}
    try {
      const docLang = document.documentElement.lang;
      if (isSupported(docLang)) return docLang;
    } catch (_) {}
    return 'en';
  });

  const [isRtl, setIsRtl] = useState<boolean>(RTL_LANGS.includes(language));

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    try { localStorage.setItem('arang_lang', lang); } catch (_) {}
  };

  useEffect(() => {
    const rtl = RTL_LANGS.includes(language);
    setIsRtl(rtl);
    // Document-level attributes (also captured by the prerenderer for crawlers).
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    // ── Per-language SEO meta injection ──────────────────────────────────────
    // Google ranks on the page's actual content + meta. Rewrite title, description,
    // canonical and Open Graph per language so each prerendered page (/, /ar/, /fa/,
    // /tr/, /id/) is a proper self-referencing localized document — not a clone of
    // the English root. hreflang alternates stay static in index.html (same set on
    // every page, which is correct).
    const dict = translations[language];
    const title = dict.seo_title || document.title;
    const desc = dict.seo_desc || '';
    const canonical = SITE_ORIGIN + langPath(language);

    document.title = title;

    const setMeta = (selector: string, attr: 'content', value: string) => {
      const el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:locale"]', 'content', OG_LOCALE[language]);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', desc);

    const linkCanonical = document.head.querySelector('link[rel="canonical"]');
    if (linkCanonical) linkCanonical.setAttribute('href', canonical);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['id'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
