import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini with server-side API Key
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  let useFallback = false;
  let fallbackReason = "";

  // Convert client-sent format into standard Gemini multi-turn format
  const contents = [];
  if (history && Array.isArray(history)) {
    for (const h of history) {
      if (h.role === 'user' || h.role === 'model') {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    }
  }

  // Add current message
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const systemInstruction = `You are "NusaBot", the official AI customer support assistant for Nusantara Charcoal. 
Your goal is to answer client questions about our high-quality charcoal products, our production process, certifications, and help them with their orders.

Our Premium Products:
1. Arang BBQ Premium (Rp 35.000 / 2kg pack, size 3–5 cm): Recommended for barbeques, steady heat, low ash.
2. Arang Shisha Premium (Rp 30.000 / 1kg pack, size 2–3 cm): Made from 100% natural coconut charcoal briket with super-low ash and zero dangerous chemicals, perfect for shisha.
3. Arang Hexagonal (Rp 45.000 / 2kg pack, size 5–7 cm): Hollow core hexagonal log cylinder, creates a chimney effect for clean and extreme long-lasting burning (up to 8+ hours).
4. Arang Briket Premium (Rp 32.000 / 2kg pack, size 4x4x4 cm): Uniform charcoal block cube, high fixed carbon.

Our Headquarters & Contact:
- Address: Jl. Industri No. 45, Surabaya, Jawa Timur 60221, Indonesia.
- Loading/shipping point: Tanjung Perak Port (Surabaya), East Java. We export worldwide with complete documents (Non-DG cert, SADT certificate).
- Website has interactive 3D simulators of charcoal to check shapes, which is awesome!

When a client wishes to place an order, you MUST collect the following information:
1. Client's Full Name
2. Choice of product(s) and quantitative amount (e.g., 50 packs, or multi-container volume for exports)
3. Delivery address (or Destination Sea Port for exports)

If some of the information is missing, ask them politely.
Once they provide all this information, summarize their order details clearly and say exactly:
"Pesanan Anda telah kami catat dalam antrean konsultasi tim menteri miring ekspor kami. Tim menteri miring atau sales specialist kami akan segera memverifikasi pesanan Anda melalui telepon atau email!" (Always provide this exact message at the end of their order completion).

Use a friendly, standard, professional tone. If the user speaks English, you can answer in English. If they speak Indonesian, answer in Indonesian. If Arabic, answer in Arabic. Always format output beautifully with Markdown formatting. Be helpful and kind.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    if (response && response.text) {
      return res.json({ reply: response.text });
    } else {
      throw new Error("Empty response text from Gemini API.");
    }
  } catch (err: any) {
    console.warn("Gemini API Error, falling back to offline companion engine. Reason:", err.message || err);
    useFallback = true;
    fallbackReason = err.message || "Quota/Billing limitation";
  }

  // If Gemini failed or is not configured, compute a rich native fallback response
  if (useFallback) {
    let reply = handleFallbackChat(message, history || []);

    // Append a friendly, informative developer and user notification banner to explain the exact state 
    let note = "\n\n*(NusaBot Note: Active in Smart Backup Mode - Google AI Studio Prepayment credits are depleted. Please top up billing to restore full Gemini AI capabilities).*";
    if (/[\u0600-\u06FF]/.test(message)) {
      note = "\n\n*(ملاحظة نوسابوت: المساعد يعمل في الوضع الاحتياطي الذكي - يرجى شحن الرصيد لتفعيل الخدمة الكاملة).*";
    } else if (/pesan|beli|arang|bbq|shisha|alamat|harga|briket|tanya|halo/i.test(message)) {
      note = "\n\n*(Catatan NusaBot: Berjalan dalam Mode Cadangan Pintar - Saldo/kredit prabayar API Key di Google AI Studio habis. Silakan top-up billing untuk memulihkan kecerdasan AI penuh).*";
    }
    
    reply += note;
    return res.json({ reply });
  }
});

// Smart Offline Dialog Manager & Knowledge Base Fallback
function handleFallbackChat(message: string, history: any[]): string {
  const text = message.toLowerCase();
  
  // Combine all historical user inputs for cumulative memory extraction
  const allUserTexts = history.filter(h => h.role === 'user').map(h => h.text);
  allUserTexts.push(message);

  // Check if ordering is triggered
  let hasTriggeredOrder = false;
  for (const t of allUserTexts) {
    const lower = t.toLowerCase();
    if (/pesan|beli|order|booking|purchase|purchase|shutup|طلب|شراء/i.test(lower)) {
      hasTriggeredOrder = true;
    }
  }

  // Detect and extract charcoal product choices
  let productDetected = "";
  for (const t of allUserTexts) {
    const lower = t.toLowerCase();
    if (lower.includes("bbq")) {
      productDetected = "Arang BBQ Premium";
    } else if (lower.includes("shisha") || lower.includes("sisha")) {
      productDetected = "Arang Shisha Premium";
    } else if (lower.includes("hexagonal") || lower.includes("heksagonal")) {
      productDetected = "Arang Hexagonal";
    } else if (lower.includes("briket") || lower.includes("briquette") || lower.includes("cube")) {
      productDetected = "Arang Briket Premium";
    }
  }

  // Detect and extract quantity/amount
  let quantityDetected = "";
  for (const t of allUserTexts) {
    const match = t.match(/(\d+)\s*(pack|kg|box|ton|kontainer|sak|pcs|bks|buah|karton|qnty|qty)?/i);
    if (match) {
      quantityDetected = match[0];
    }
  }

  // Extract customer name
  let nameDetected = "";
  // Check if chatbot asked for Name previously
  for (let i = 0; i < history.length; i++) {
    const histText = history[i].text ? history[i].text.toLowerCase() : "";
    if (history[i].role === 'model' && /nama lengkap|full name|siapa nama/i.test(histText)) {
      if (i + 1 < history.length && history[i+1].role === 'user') {
        nameDetected = history[i+1].text;
      }
    }
  }
  // Try to find structural name declarations
  for (const t of allUserTexts) {
    const nameMatch = t.match(/(?:nama saya|nama|my name is|im|i'm|saya)\s+([A-Za-z0-9\s\\.]{2,25})/i);
    if (nameMatch) {
      nameDetected = nameMatch[1].trim();
    }
  }

  // Extract delivery address / target port
  let addressDetected = "";
  for (let i = 0; i < history.length; i++) {
    const histText = history[i].text ? history[i].text.toLowerCase() : "";
    if (history[i].role === 'model' && /alamat pengiriman|alamat lengkap|alamat Anda|delivery address|destination port|tujuan/i.test(histText)) {
      if (i + 1 < history.length && history[i+1].role === 'user') {
        addressDetected = history[i+1].text;
      }
    }
  }
  for (const t of allUserTexts) {
    if (/jalan|jl\.|alamat|kecamatan|kabupaten|destination|shipping to|port of|kirim ke/i.test(t.toLowerCase())) {
      addressDetected = t;
    }
  }

  // Check language contexts
  const isArabic = /[\u0600-\u06FF]/.test(text);
  const isEnglish = !isArabic && (/product|price|address|order|factory|hello|hey|help|thank/i.test(text));

  // Chatbot flow logic for Ordering
  if (hasTriggeredOrder) {
    if (!nameDetected) {
      if (isArabic) {
        return "حسناً، يرجى كتابة **اسمك الكامل** لمتابعة إجراءات الطلب:";
      } else if (isEnglish) {
        return "Process started. Please provide your **Full Name** to register your booking:";
      } else {
        return "Baik! Untuk memproses pesanan, silakan sebutkan atau ketik **Nama Lengkap** Anda:";
      }
    }

    if (!productDetected || !quantityDetected) {
      if (isArabic) {
        return `مرحباً ${nameDetected}، ما هي **المنتجات والكمية** التي ترغب بطلبها؟ 
تفاصيل المنتجات المتوفرة:
1. **فحم شواء ممتاز (BBQ)**
2. **فحم شيشة فاخر (Shisha)**
3. **فحم سداسي طويل الأمد (Hexagonal)**
4. **قوالب فحم متميزة (Briket)**`;
      } else if (isEnglish) {
        return `Hi **${nameDetected}**, which **charcoal product and what quantity** (e.g., 50 packs, 2 tons) would you like to buy?
Available selections:
1. **Premium BBQ Charcoal**
2. **Premium Shisha Charcoal**
3. **Hexagonal Charcoal**
4. **Premium Briquette Charcoal**`;
      } else {
        return `Halo Kak **${nameDetected}**, mohon tuliskan **nama produk arang dan kuantitasnya** (Contoh: "BBQ 10 pack" atau "Shisha 5 kontainer") yang ingin dipesan:
Pilihan produk unggulan Nusantara Charcoal:
1. **Arang BBQ Premium**
2. **Arang Shisha Premium**
3. **Arang Hexagonal**
4. **Arang Briket Premium**`;
      }
    }

    if (!addressDetected) {
      if (isArabic) {
        return `تم التقاط التفاصيل بنجاح. يرجى كتابة **عنوان التوصيل الكامل** (أو ميناء التصدير المستهدف):`;
      } else if (isEnglish) {
        return `Thank you. Please provide your **complete Delivery Address** (or Destination Sea Port for exports):`;
      } else {
        return `Baik Kak **${nameDetected}** untuk pesanan **${quantityDetected} ${productDetected}**. Terakhir, mohon ketik **Alamat Pengiriman lengkap** (atau Pelabuhan Tujuan Ekspor jika ingin dikirim ke luar negeri):`;
      }
    }

    // Complete Checkout Flow trigger
    if (isArabic) {
      return `### تم تسجيل تفاصيل الطلب بنجاح!
* **اسم العميل**: ${nameDetected}
* **المنتج والكمية**: ${quantityDetected} ${productDetected}
* **العنوان / الميناء**: ${addressDetected}

"Pesanan Anda telah kami catat dalam antrean konsultasi tim menteri miring ekspor kami. Tim menteri miring atau sales specialist kami akan segera memverifikasi pesanan Anda melalui telepon atau email!"`;
    } else if (isEnglish) {
      return `### Order Details Confirmed & Recorded!
* **Client Name**: ${nameDetected}
* **Selected Product**: ${quantityDetected} ${productDetected}
* **Shipping Target**: ${addressDetected}

"Pesanan Anda telah kami catat dalam antrean konsultasi tim menteri miring ekspor kami. Tim menteri miring atau sales specialist kami akan segera memverifikasi pesanan Anda melalui telepon atau email!"`;
    } else {
      return `### Detail Pesanan Anda Berhasil Dicatat!
* **Nama Pemesan**: ${nameDetected}
* **Jenis & Jumlah**: ${quantityDetected} ${productDetected}
* **Alamat Pengantaran**: ${addressDetected}

"Pesanan Anda telah kami catat dalam antrean konsultasi tim menteri miring ekspor kami. Tim menteri miring atau sales specialist kami akan segera memverifikasi pesanan Anda melalui telepon atau email!"`;
    }
  }

  // Handle locations / general addresses
  if (/alamat|kantor|lokasi|surabaya|pabrik|jalan|industri|jl|address|location|headquarters|factory|lokas/i.test(text)) {
    if (isArabic) {
      return `يقع مقر شركة **Nusantara Charcoal** في:
- **العنوان**: شارع إندستري رقم 45، سورابايا، جاوة الشرقية 60221، إندونيسيا.
- **ميناء الشحن**: ميناء تانجونغ بيراك (Surabaya). نشحن عالمياً مع تزويد العميل بكامل الوثائق الرسمية والموافقات الأمنية.`;
    } else if (isEnglish) {
      return `Nusantara Charcoal factory and headquarters are located at:
- **Office/Factory**: Jl. Industri No. 45, Surabaya, East Java 60221, Indonesia.
- **Logistics Center**: Tanjung Perak Sea Port, Surabaya. We ship globally with complete cargo documentation (Non-DG certification, MSDS, SADT certificates).`;
    } else {
      return `Kantor pusat dan pabrik produksi **Nusantara Charcoal** berlokasi di:
* **Alamat Pabrik**: Jl. Industri No. 45, Surabaya, Jawa Timur 60221, Indonesia.
* **Pelabuhan Muat**: Pelabuhan Tanjung Perak, Surabaya, Jawa Timur. Kami melayani pengapalan kargo domestik & ekspor internasional lengkap dengan dokumen legalitas utama seperti Non-DG cert, MSDS, dan sertifikat SADT.`;
    }
  }

  // Handle 3D Visualizer FAQs
  if (/3d|simulasi|simulator|bentuk|shape|lihat/i.test(text)) {
    if (isArabic) {
      return `شركة Nusantara توفر **محاكاة تفاعلية ثلاثية الأبعاد (3D Simulator)** على موقعنا! يمكنك التحقق من شكل الفحم بالتفصيل وتدوير الموديل بزاوية 360 درجة لتفقد تفاصيل فحم الشواء وفحم الشيشة والفحم السداسي قبل إتمام طلبك.`;
    } else if (isEnglish) {
      return `We provide an interactive **3D Charcoal Simulator** on our website page! You can rotate the 3D model, examine the chimney ventilation holes, and inspect exact physical shapes of our BBQ, Shisha, or Hexagonal charcoal directly in your browser. Feel free to click the "3D Simulator" buttons at our home banner.`;
    } else {
      return `Kami menghadirkan fitur **Simulator Arang 3D Interaktif** di website kami! Anda bisa memutar arang 360°, memeriksa bentuk presisi, serta lubang rongga briket kami (BBQ, Cube Shisha, Hexagonal) langsung dari browser Anda tanpa aplikasi tambahan. Silakan klik tombol "Visualizer 3D" di bagian atas halaman utama!`;
    }
  }

  // Handle general Products / Prices list
  if (/produk|harga|price|spesifikasi|spec|tipe|jenis|bbq|shisha|sisha|hexagonal|briket|سعر|منتج|مواصفات|jual/i.test(text)) {
    if (isArabic) {
      return `إليك تفاصيل المنتجات الفاخرة لأسعار الفحم الممتاز وحجمه:
1. **فحم شواء ممتاز (Premium BBQ)**: (35.000 روبية / عبوة 2 كجم، حجم 3-5 سم) حرارة عالية، رماد منخفض، يدوم طويلاً.
2. **فحم شيشة فاخر (Premium Shisha)**: (30.000 روبية / عبوة 1 كجم، حجم 2-3 سم) فحم جوز هند طبيعي 100%، بدون مواد كيميائية، مثالي للشيشة والفلتر.
3. **فحم سداسي الشكل (Hexagonal)**: (45.000 روبية / عبوة 2 كجم، حجم 5-7 سم) مجوف من الداخل لإنتاج تأثير المدخنة لقضاء أطول فترة اشتعال (تصل إلى +8 ساعات).
4. **قوالب فحم مكعبات (Premium Briquette)**: (32.000 روبية / عبوة 2 كجم) مكعبات منتظمة هندسياً بتركيز كربوني ثابت.`;
    } else if (isEnglish) {
      return `Here are our best-selling organic premium products & price list:
1. **Premium BBQ Charcoal**: (IDR 35,000 / 2kg pack, size 3-5 cm) Steady heat, low ash generation. Recommended for home/restaurant grilling.
2. **Premium Shisha Charcoal**: (IDR 30,000 / 1kg pack, size 2-3 cm) 100% organic coconut shell briquettes, zero harmful chemical additives. Clean burning.
3. **Hexagonal Charcoal**: (IDR 45,000 / 2kg pack, size 5-7 cm) Hollow-core hexagonal rods providing incredible air ventilation & continuous 8+ hours burn-time!
4. **Premium Briquette Cube**: (IDR 32,000 / 2kg pack, size 4x4x4 cm) Uniform cubes, high raw fixed carbon contents.`;
    } else {
      return `Berikut adalah daftar produk arang premium Nusantara Charcoal beserta harganya:
1. **Arang BBQ Premium**: (Rp 35.000 / pack 2kg, ukuran 3–5 cm) Panas stabil, menghasilkan abu yang sangat sedikit. Sangat cocok untuk pesta barbeque.
2. **Arang Shisha Premium**: (Rp 30.000 / pack 1kg, ukuran 2–3 cm) Briket tempurung kelapa asli 100% premium tanpa bahan kimia tambahan, sangat jernih dan awet untuk hookah/shisha.
3. **Arang Hexagonal**: (Rp 45.000 / pack 2kg, ukuran 5–7 cm) Memiliki rongga tengah (silinder heksagonal) untuk menghasilkan efek cerobong asap dan waktu membara lama hingga 8+ jam.
4. **Arang Briket Premium**: (Rp 32.000 / pack 2kg, ukuran 4x4x4 cm) Potongan briket boks/kubus seragam dengan kadar karbon tetap yang tinggi.`;
    }
  }

  // Default fallback welcome / instructions
  if (isArabic) {
    return `أهلاً بك! أنا مساعد نوسابوت الاحتياطي. يمكنك سؤالي عن:
* أسعار الفحم ومواصفاته التفصيلية
* مكان مصنعنا وميناء التصدير تانجونج بيراك في سورابايا
* كيفية مشاهدة محاكاة الأشكال الثلاثية الأبعاد 3D
* **تقديم طلبات الشراء المتنوعة**: يرجى كتابة "أريد شراء..." لتسجيل طلبك!`;
  } else if (isEnglish) {
    return `Hi, I am **NusaBot Offline Assistant**! You can ask me about:
* Accurate prices and specifications of our 4 charcoal categories
* Export shipping details via Tanjung Perak Port Surabaya
* Finding and rotating the interactive 3D particle models
* **Ordering products**: Just say *"I want to buy charcoal"* and I will note down details for you!`;
  } else {
    return `Selamat datang di Nusantara Charcoal! Saya **NusaBot**, asisten virtual Anda yang siap membantu membimbing Anda mengenai:
* **Detail & Harga Produk**: Spesifikasi lengkap varian arang BBQ, Shisha, Hexagonal, dan Cube Briket.
* **Informasi Pabrik & Pengapalan**: Ekspor global melalui Pelabuhan Tanjung Perak, Surabaya.
* **Visualisasi Simulator 3D**: Bentuk fisik briket interaktif di halaman utama.
* **Pemesanan Arang**: Silakan ketik *"Saya mau pesan"* untuk langsung merekam informasi pemesanan Anda di sistem antrean kami!`;
  }
}

// Vite middleware setup
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupServer();
