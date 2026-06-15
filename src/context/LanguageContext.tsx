import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageType = 'id' | 'en' | 'ar';

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
    about_desc_1: 'Didirikan dengan visi mengangkat keunggulan agrikultur nusantara ke pangsa ekspor dunia, Nusantara Charcoal memproduksi dan memasok arang kelapa serta kayu bermutu tinggi yang ramah lingkungan. Kami meminimalkan jejak karbon dengan mengoptimalkan produk sampingan agraris agar tidak terbuang sia-sia.',
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
    lab_desc: 'Nusantara Charcoal berkomitmen penuh pada transparansi kualitas ekspor. Setiap batch produksi melewati pengujian ketat laboratorium pihak ketiga internasional.',
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
    log_desc: 'Memiliki jaringan pelayaran kuat dari Pelabuhan Tanjung Perak (Surabaya) untuk menjangkau pusat grosir arang internasional secara terjadwal.',
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
    contact_address: 'Jl. Industri No. 45\nSurabaya, Jawa Timur 60221\nIndonesia',
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
    about_desc_1: 'Founded with a vision to elevate natural Indonesian agriculture to the global export market, Nusantara Charcoal produces and supplies high-grade coconut shell & wood charcoal. We minimize our carbon footprint by turning agricultural side-products into sustainable energy.',
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
    lab_desc: 'Nusantara Charcoal is fully committed to absolute transparency. Every production batch passes stringent testing by international third-party laboratories.',
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
    log_desc: 'Operating high-frequency cargo connections from the Port of Tanjung Perak (Surabaya) to international logistics hubs regularly.',
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
    contact_address: 'Jl. Industri No. 45\nSurabaya, East Java 60221\nIndonesia',
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
    log_desc: 'تدار عملياتنا البحرية مباشرة من ميناء تانجونغ بيراك (سورابايا) لضمان توفير خطوط نقل عالية الانتظام ومجدولة للوجهات العالمية.',
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
    contact_address: 'طريق الصناعة، رقم ٤٥\nسورابايا، جاوة الشرقية ٦٠٢٢١\nإندونيسيا',
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
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    // Default to 'id' or read from localStorage
    const saved = localStorage.getItem('arang_lang');
    return (saved === 'id' || saved === 'en' || saved === 'ar') ? saved : 'id';
  });

  const [isRtl, setIsRtl] = useState<boolean>(language === 'ar');

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem('arang_lang', lang);
  };

  useEffect(() => {
    setIsRtl(language === 'ar');
    // Also set document attributes gracefully
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
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
