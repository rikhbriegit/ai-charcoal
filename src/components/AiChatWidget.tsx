import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, RefreshCw, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  full?: string; // when set, `text` is typed out char-by-char toward `full` (typewriter effect)
}

export function AiChatWidget() {
  const { language, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── CRM lead capture (SPEC §8.3): when a conversation ends, send the full
  // transcript to the CRM once for a separate server-side extraction pass. ────
  const conversationIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c_${Date.now()}`
  );
  const submittedRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const submitTranscript = () => {
    if (submittedRef.current) return;
    const msgs = messagesRef.current;
    if (!msgs.some((m) => m.role === 'user')) return; // only if the visitor actually engaged
    submittedRef.current = true;
    try {
      fetch('/crm/api/chat-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true, // survive tab close / navigation
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          history: msgs.map((m) => ({ role: m.role, text: m.text })),
        }),
      }).catch(() => {});
    } catch (_) { /* never disrupt the visitor */ }
  };

  // Submit when the chat panel closes (open → closed transition).
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) submitTranscript();
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  // Backup triggers: tab hidden / page unload.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') submitTranscript(); };
    window.addEventListener('pagehide', submitTranscript);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', submitTranscript);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  // Multilingual Strings
  const strings = {
    id: {
      botName: 'PremiumCharcoal Assistant',
      headerDesc: 'Tanya produk & pesan arang premium',
      placeholder: 'Ada yang bisa dibantu? Ketik di sini...',
      tooltip: 'Butuh bantuan? Tanya PremiumCharcoal di sini!',
      welcome: `Halo! Saya **PremiumCharcoal**, AI Asisten resmi Bricket Charcoal Indonesia. 
Ada yang bisa saya bantu hari ini? 
* Anda bisa **bertanya tentang jenis produk & harga** arang kami.
* Anda bisa **memesan produk** kami secara langsung. 
Silakan ketik pertanyaan Anda!`,
      askProducts: 'Tanya Produk & Spesifikasi',
      howToOrder: 'Cara memesan disini?',
      orderBbq: 'Pesan Arang BBQ Premium',
      orderShisha: 'Pesan Arang Shisha Premium',
      errorMsg: 'Ada kendala koneksi ke PremiumCharcoal. Silakan coba sesaat lagi.',
      resetConfirm: 'Reset percakapan?',
    },
    en: {
      botName: 'PremiumCharcoal Assistant',
      headerDesc: 'Ask about products & order premium charcoal',
      placeholder: 'Let us help you... Type message...',
      tooltip: 'Need help? Ask PremiumCharcoal here!',
      welcome: `Hello! I am **PremiumCharcoal**, the official AI Assistant of Bricket Charcoal Indonesia. 
How can I help you today? 
* You can **ask about our charcoal products & prices**.
* You can **place an order** directly with me.
Please type your inquiries below!`,
      askProducts: 'Ask Products & Specs',
      howToOrder: 'How to order here?',
      orderBbq: 'Order Premium BBQ Charcoal',
      orderShisha: 'Order Premium Shisha Charcoal',
      errorMsg: 'Connection error. Please try again in a moment.',
      resetConfirm: 'Reset chat history?',
    },
    ar: {
      botName: 'PremiumCharcoal Assistant',
      headerDesc: 'استفسار عن المنتجات وطلب فحم فاخر',
      placeholder: 'كيف يمكنني مساعدتك؟ اكتب هنا...',
      tooltip: 'مساعدة؟ اسأل PremiumCharcoal هنا!',
      welcome: `مرحباً بك! أنا **PremiumCharcoal**، المساعد الذكي لشركة Bricket Charcoal Indonesia.
كيف يمكنني مساعدتك اليوم؟
* يمكنك **الاستفسار عن أنواع الفحم المتاحة وأسعارها**.
* يمكنك **تقديم طلب مباشرة لشراء الفحم**.
تفضل بكتابة استفسارك هنا!`,
      askProducts: 'منتجاتنا ومواصفاتها',
      howToOrder: 'كيف يمكنني تقديم طلب؟',
      orderBbq: 'طلب فحم شواء ممتاز',
      orderShisha: 'طلب فحم شيشة فاخر',
      errorMsg: 'فشل الاتصال بمساعد الذكاء الاصطناعي. الرجاء المحاولة مجدداً.',
      resetConfirm: 'إعادة تعيين المحادثة؟',
    },
    fa: {
      botName: 'PremiumCharcoal Assistant',
      headerDesc: 'پرسش درباره محصولات و سفارش زغال ممتاز',
      placeholder: 'چطور می‌توانم کمکتان کنم؟ اینجا بنویسید...',
      tooltip: 'کمک می‌خواهید؟ همین‌جا از PremiumCharcoal بپرسید!',
      welcome: `سلام! من **PremiumCharcoal** هستم، دستیار هوش مصنوعی رسمی Bricket Charcoal Indonesia.
امروز چطور می‌توانم کمکتان کنم؟
* می‌توانید **درباره انواع زغال و قیمت‌ها** بپرسید.
* می‌توانید مستقیماً **سفارش ثبت کنید**.
لطفاً سؤالتان را بنویسید!`,
      askProducts: 'محصولات و مشخصات',
      howToOrder: 'چگونه سفارش دهم؟',
      orderBbq: 'سفارش زغال باربیکیو ممتاز',
      orderShisha: 'سفارش زغال قلیان ممتاز',
      errorMsg: 'خطا در اتصال. لطفاً لحظاتی بعد دوباره تلاش کنید.',
      resetConfirm: 'گفتگو از نو شروع شود؟',
    },
    tr: {
      botName: 'PremiumCharcoal Assistant',
      headerDesc: 'Ürünleri sorun & premium kömür sipariş edin',
      placeholder: 'Size nasıl yardımcı olabiliriz? Buraya yazın...',
      tooltip: 'Yardım mı lazım? PremiumCharcoal\'a buradan sorun!',
      welcome: `Merhaba! Ben **PremiumCharcoal**, Bricket Charcoal Indonesia'nın resmi yapay zeka asistanıyım.
Bugün size nasıl yardımcı olabilirim?
* **Kömür ürünlerimiz ve fiyatları** hakkında soru sorabilirsiniz.
* Doğrudan benimle **sipariş verebilirsiniz**.
Lütfen sorunuzu aşağıya yazın!`,
      askProducts: 'Ürünler & Özellikler',
      howToOrder: 'Nasıl sipariş verilir?',
      orderBbq: 'Premium Mangal Kömürü Sipariş Et',
      orderShisha: 'Premium Nargile Kömürü Sipariş Et',
      errorMsg: 'Bağlantı hatası. Lütfen birazdan tekrar deneyin.',
      resetConfirm: 'Sohbet sıfırlansın mı?',
    },
  }[language] || {
    botName: 'PremiumCharcoal Assistant',
    headerDesc: 'Ask about products & order premium charcoal',
    placeholder: 'Type message...',
    tooltip: 'Need help? Ask PremiumCharcoal here!',
    welcome: 'Hello! How can I help you today?',
    askProducts: 'Ask Products',
    howToOrder: 'How to Order?',
    orderBbq: 'Order BBQ',
    orderShisha: 'Order Shisha',
    errorMsg: 'Something went wrong.',
    resetConfirm: 'Reset chat?',
  };

  // Delayed Tooltip trigger on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize with a fresh welcome message. We intentionally DO NOT persist or
  // restore chat history — every page load starts clean so the panel never piles
  // up old conversations. (Purge any leftover from earlier versions.)
  useEffect(() => {
    // Show the welcome in the CURRENT site language, and refresh it if the visitor
    // toggles language BEFORE typing anything. Once they've sent a message we leave
    // the conversation intact — their replies auto-detect the language they write in.
    const hasUserMsg = messages.some((m) => m.role === 'user');
    if (hasUserMsg) return;
    try { sessionStorage.removeItem('rang_chat_history'); } catch (_) {}
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages([
      {
        role: 'model',
        text: strings.welcome,
        timestamp: now,
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Typewriter effect: reveal the last bot message ONE WORD at a time at a calm,
  // human pace with slight jitter (~90–150ms/word) so it reads like a real person
  // composing a reply, not an instant data dump.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'model' || last.full === undefined) return;
    const fullWords = last.full.split(' ');
    const shownWords = last.text.length === 0 ? 0 : last.text.split(' ').length;
    if (shownWords >= fullWords.length) return;

    const timer = setTimeout(() => {
      setMessages((prev) => {
        const copy = [...prev];
        const i = copy.length - 1;
        const m = copy[i];
        if (!m || m.full === undefined) return prev;
        const words = m.full.split(' ');
        const cur = m.text.length === 0 ? 0 : m.text.split(' ').length;
        if (cur >= words.length) return prev;
        copy[i] = { ...m, text: words.slice(0, cur + 1).join(' ') };
        return copy;
      });
    }, 90 + Math.random() * 60);
    return () => clearTimeout(timer);
  }, [messages]);

  // Auto-scroll to bot output bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const trimmedMsg = textToSend.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add User Message
    const userMessage: Message = {
      role: 'user',
      text: trimmedMsg,
      timestamp: now,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Map message structure to historical backend structure
      // Format history: Array of { role: 'user' | 'model', text: string }
      const backendHistory = updatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMsg,
          history: backendHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const replyText = data.reply || strings.welcome;

      // Push the reply with an empty visible body + `full` target so it types out
      // gradually (like a real person composing a reply), not dumped instantly.
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: '',
          full: replyText,
          timestamp: replyTime,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: strings.errorMsg,
          timestamp: replyTime,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm(strings.resetConfirm)) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const initial: Message[] = [
        {
          role: 'model',
          text: strings.welcome,
          timestamp: now,
        },
      ];
      setMessages(initial);
      try { sessionStorage.removeItem('rang_chat_history'); } catch (_) {}
    }
  };

  // Split a markdown table row "| a | b |" into ["a","b"].
  const splitRow = (l: string) =>
    l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

  // Inline markdown renderer: bold, headings, bullets, ordered lists AND tables.
  const renderMessageText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const out: React.ReactNode[] = [];
    const isRow = (l: string) => l.includes('|') && l.trim().startsWith('|');
    const isSep = (l: string) => /-/.test(l) && /^[\s|:-]+$/.test(l.trim());
    let i = 0;

    while (i < lines.length) {
      const raw = lines[i];
      const trimmed = raw.trim();

      // Markdown table: header row + separator row (---) + body rows.
      if (isRow(raw) && i + 1 < lines.length && isSep(lines[i + 1])) {
        const header = splitRow(raw);
        const rows: string[][] = [];
        let j = i + 2;
        while (j < lines.length && isRow(lines[j])) { rows.push(splitRow(lines[j])); j++; }
        out.push(
          <div key={i} className="overflow-x-auto my-1 rounded-lg border border-zinc-800">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr>
                  {header.map((h, k) => (
                    <th key={k} className="border-b border-zinc-700 bg-zinc-800/60 px-2 py-1 text-left font-semibold text-orange-300 whitespace-nowrap">{parseBoldContent(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={ri} className="odd:bg-zinc-900/30">
                    {r.map((c, ci) => (
                      <td key={ci} className="border-t border-zinc-800/70 px-2 py-1 text-zinc-300 align-top">{parseBoldContent(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        i = j;
        continue;
      }

      if (!trimmed) { out.push(<div key={i} className="h-1.5" />); i++; continue; }

      // Headings (#, ##, ###…) → styled heading (strip the # marks).
      const head = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (head) {
        out.push(<div key={i} className="font-bold text-zinc-100 text-[12.5px] mt-1">{parseBoldContent(head[2])}</div>);
        i++; continue;
      }

      // Bullets ( - , * , • ) — require a space so **bold** at line start isn't caught.
      const bullet = trimmed.match(/^([-*•])\s+(.*)$/);
      if (bullet) {
        out.push(
          <div key={i} className="flex items-start gap-1.5 pl-1.5">
            <span className="text-orange-500 mt-2 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
            <span>{parseBoldContent(bullet[2])}</span>
          </div>
        );
        i++; continue;
      }

      // Numbered list.
      const num = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (num) {
        out.push(
          <div key={i} className="flex items-start gap-1.5 pl-1.5">
            <span className="text-orange-500 font-bold shrink-0 text-xs mt-0.5">{num[1]}.</span>
            <span>{parseBoldContent(num[2])}</span>
          </div>
        );
        i++; continue;
      }

      // Paragraph.
      out.push(<p key={i}>{parseBoldContent(trimmed)}</p>);
      i++;
    }

    return <div className="space-y-1.5 text-xs leading-relaxed font-light">{out}</div>;
  };

  const parseBoldContent = (text: string) => {
    // Handles **bold** and *italic* so no raw * asterisks leak into the chat.
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      if (match[1] !== undefined) {
        parts.push(
          <strong key={match.index} className="font-semibold text-orange-400">{match[1]}</strong>
        );
      } else {
        parts.push(
          <em key={match.index} className="italic text-zinc-200">{match[2]}</em>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Chips suggestions content. The prompt is sent in the CURRENT UI language so
  // the AI (which auto-detects the message language) replies in that language.
  const quickPrompts = {
    id: {
      askProducts: 'Tolong jelaskan produk arang Bricket Charcoal Indonesia dan spesifikasinya.',
      howToOrder: 'Bagaimana cara pemesanan arang di Bricket Charcoal Indonesia?',
      orderBbq: 'Halo, saya ingin memesan Arang BBQ Premium.',
      orderShisha: 'Pesan Arang Shisha Premium.',
    },
    ar: {
      askProducts: 'أرجو شرح أنواع الفحم ومواصفاتها بالتفصيل.',
      howToOrder: 'كيف يمكنني تقديم طلب شراء؟',
      orderBbq: 'مرحباً، أود تقديم طلب لشراء فحم الشواء الممتاز.',
      orderShisha: 'أود طلب فحم الشيشة الفاخر من فضلكم.',
    },
    fa: {
      askProducts: 'لطفاً انواع زغال Bricket Charcoal Indonesia و مشخصات آن‌ها را توضیح دهید.',
      howToOrder: 'چگونه می‌توانم سفارش ثبت کنم؟',
      orderBbq: 'سلام، می‌خواهم زغال باربیکیو ممتاز سفارش دهم.',
      orderShisha: 'می‌خواهم زغال قلیان ممتاز سفارش دهم.',
    },
    tr: {
      askProducts: 'Lütfen Bricket Charcoal Indonesia ürünlerini ve özelliklerini açıklayın.',
      howToOrder: 'Nasıl sipariş verebilirim?',
      orderBbq: 'Merhaba, Premium Mangal Kömürü sipariş etmek istiyorum.',
      orderShisha: 'Premium Nargile Kömürü sipariş etmek istiyorum.',
    },
    en: {
      askProducts: 'Please explain Bricket Charcoal Indonesia products and their detailed specifications.',
      howToOrder: 'How can I place an order for your charcoal?',
      orderBbq: 'Hello, I want to place an order for Premium BBQ Charcoal.',
      orderShisha: 'Order Premium Shisha Charcoal.',
    },
  }[language] || {
    askProducts: 'Please explain Bricket Charcoal Indonesia products and their detailed specifications.',
    howToOrder: 'How can I place an order for your charcoal?',
    orderBbq: 'Hello, I want to place an order for Premium BBQ Charcoal.',
    orderShisha: 'Order Premium Shisha Charcoal.',
  };
  const suggestions = [
    { text: strings.askProducts, prompt: quickPrompts.askProducts },
    { text: strings.howToOrder, prompt: quickPrompts.howToOrder },
    { text: strings.orderBbq, prompt: quickPrompts.orderBbq },
    { text: strings.orderShisha, prompt: quickPrompts.orderShisha },
  ];

  return (
    <>
      {/* Blurred backdrop behind the open chat panel (click to close). */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md sm:backdrop-blur-lg"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    <div
      className="fixed bottom-6 z-[60] flex flex-col items-end"
      style={{
        right: isRtl ? 'auto' : '1.5rem',
        left: isRtl ? '1.5rem' : 'auto',
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
      }}
      id="ai-customer-chat"
    >
      <AnimatePresence>
        {/* Help Tooltip Box (Automatic preview) */}
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute bottom-20 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs px-3.5 py-2.5 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex items-center gap-3 w-64 ${
              isRtl ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'
            }`}
          >
            <Bot className="h-4 w-4 text-orange-500 shrink-0" />
            <span className="leading-tight font-light">{strings.tooltip}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
              id="close-chat-tooltip"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}

        {/* Chat Window Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`w-[calc(100vw-2rem)] sm:w-[750px] max-w-[calc(100vw-2rem)] h-[calc(100dvh-4rem)] sm:h-[620px] bg-[#0c0d10] border border-zinc-800 sm:rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden mb-4`}
          >
            {/* Header */}
            <div className="p-4 bg-[#111317] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#111317]" />
                </div>
                <div className="text-left font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white tracking-wide">{strings.botName}</span>
                    <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-light block mt-0.5">{strings.headerDesc}</span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearChat}
                  title="Clear Conversation"
                  aria-label="Restart Conversation"
                  className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-colors border border-transparent"
                  id="reset-chat-history"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Chatbox"
                  className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-colors border border-transparent"
                  id="close-chat-widget"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0d] custom-scrollbar scroll-smooth">
              {messages.map((msg, index) => {
                const isModel = msg.role === 'model';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}
                  >
                    {/* Bot Avatar */}
                    {isModel && (
                      <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-orange-500 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* Chat Bubble content */}
                    <div className="flex flex-col max-w-[82%]">
                      <div
                        className={`px-4 py-3 rounded-2xl text-left border ${
                          isModel
                            ? 'bg-zinc-900 border-zinc-800/80 text-zinc-100 rounded-tl-sm'
                            : 'bg-orange-600/90 border-transparent text-white rounded-tr-sm font-normal'
                        }`}
                      >
                        {renderMessageText(msg.text)}
                      </div>
                      <span className={`text-[9px] text-zinc-500 font-light mt-1 ${isModel ? 'text-left pl-1' : 'text-right pr-1'}`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* User Avatar */}
                    {!isModel && (
                      <div className="h-7 w-7 rounded-full bg-orange-600 flex items-center justify-center shrink-0 text-white mt-0.5 text-xs font-semibold">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bot Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-orange-500">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-900 text-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
                    <span className="text-xs text-zinc-500 font-light">PremiumCharcoal is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions Chips Wrapper */}
            <div className="p-3 bg-[#0a0a0d] border-t border-zinc-900 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar scroll-smooth">
              {suggestions.map((s, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(s.prompt)}
                  className="bg-zinc-900 hover:bg-zinc-800 hover:border-orange-500/50 border border-zinc-800 text-zinc-300 text-xs py-1.5 px-3 rounded-full transition-all shrink-0 font-light tracking-wide cursor-pointer"
                  id={`chat-suggest-chip-${index}`}
                >
                  {s.text}
                </button>
              ))}
            </div>

            {/* Send Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-[#111317] border-t border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={strings.placeholder}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
                disabled={isLoading}
                id="ai-chat-input-field"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="h-[38px] w-[38px] rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-orange-600 shrink-0 cursor-pointer"
                id="submit-ai-chat-msg"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="h-14 w-14 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.4)] relative cursor-pointer group"
        aria-label="Toggle Customer AI Assistant Chat"
        id="trigger-ai-chat-widget"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full flex items-center justify-center border border-orange-600">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
    </>
  );
}
