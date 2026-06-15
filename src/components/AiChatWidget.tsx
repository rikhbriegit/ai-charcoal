import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, RefreshCw, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export function AiChatWidget() {
  const { language, isRtl } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Multilingual Strings
  const strings = {
    id: {
      botName: 'NusaBot ASISTEN',
      headerDesc: 'Tanya produk & pesan arang premium',
      placeholder: 'Ada yang bisa dibantu? Ketik di sini...',
      tooltip: 'Butuh bantuan? Tanya NusaBot di sini!',
      welcome: `Halo! Saya **NusaBot**, AI Asisten resmi Nusantara Charcoal. 
Ada yang bisa saya bantu hari ini? 
* Anda bisa **bertanya tentang jenis produk & harga** arang kami.
* Anda bisa **memesan produk** kami secara langsung. 
Silakan ketik pertanyaan Anda!`,
      askProducts: 'Tanya Produk & Spesifikasi',
      howToOrder: 'Cara memesan disini?',
      orderBbq: 'Pesan Arang BBQ Premium',
      orderShisha: 'Pesan Arang Shisha Premium',
      errorMsg: 'Ada kendala koneksi ke NusaBot. Silakan coba sesaat lagi.',
      resetConfirm: 'Reset percakapan?',
    },
    en: {
      botName: 'NusaBot ASSISTANT',
      headerDesc: 'Ask about products & order premium charcoal',
      placeholder: 'Let us help you... Type message...',
      tooltip: 'Need help? Ask NusaBot here!',
      welcome: `Hello! I am **NusaBot**, the official AI Assistant of Nusantara Charcoal. 
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
      botName: 'مساعد نوسابوت الذكي',
      headerDesc: 'استفسار عن المنتجات وطلب فحم فاخر',
      placeholder: 'كيف يمكنني مساعدتك؟ اكتب هنا...',
      tooltip: 'مساعدة؟ اسأل نوسابوت هنا!',
      welcome: `مرحباً بك! أنا **نوسابوت**، المساعد الذكي لشركة Nusantara Charcoal.
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
  }[language] || {
    botName: 'NusaBot ASSISTANT',
    headerDesc: 'Ask about products & order premium charcoal',
    placeholder: 'Type message...',
    tooltip: 'Need help? Ask NusaBot here!',
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

  // Initialize messages with welcome if empty
  useEffect(() => {
    if (messages.length === 0) {
      // Look for saved session messages
      const saved = sessionStorage.getItem('rang_chat_history');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
          return;
        } catch (_) {}
      }
      
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        {
          role: 'model',
          text: strings.welcome,
          timestamp: now,
        },
      ]);
    }
  }, [language, messages.length]);

  // Persist messages in session
  useEffect(() => {
    if (messages.length > 1) {
      sessionStorage.setItem('rang_chat_history', JSON.stringify(messages));
    }
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
      
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: data.reply || strings.welcome,
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
      sessionStorage.setItem('rang_chat_history', JSON.stringify(initial));
    }
  };

  // Inline custom renderer to support **bold text**, bullet points, and ordered lists
  const renderMessageText = (text: string) => {
    if (!text) return null;
    const blocks = text.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed font-light">
        {blocks.map((block, bIdx) => {
          const trimmed = block.trim();
          if (!trimmed) return <div key={bIdx} className="h-1.5" />;

          // Bullets formatting
          if (trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•')) {
            const content = trimmed.substring(1).trim();
            return (
              <div key={bIdx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-orange-500 mt-2 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>{parseBoldContent(content)}</span>
              </div>
            );
          }

          // Numbered lists formatting
          const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numberedMatch) {
            const num = numberedMatch[1];
            const content = numberedMatch[2];
            return (
              <div key={bIdx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-orange-500 font-bold shrink-0 text-xs mt-0.5">{num}.</span>
                <span>{parseBoldContent(content)}</span>
              </div>
            );
          }

          // Paragraph fallback
          return <p key={bIdx}>{parseBoldContent(trimmed)}</p>;
        })}
      </div>
    );
  };

  const parseBoldContent = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={match.index} className="font-semibold text-orange-400">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Chips suggestions content
  const suggestions = [
    { text: strings.askProducts, prompt: language === 'id' ? 'Tolong jelaskan produk arang Nusantara Charcoal dan spesifikasinya.' : language === 'ar' ? 'أرجو شرح أنواع الفحم ومواصفاتها بالتفصيل.' : 'Please explain Nusantara Charcoal products and their detailed specifications.' },
    { text: strings.howToOrder, prompt: language === 'id' ? 'Bagaimana cara pemesanan arang di Nusantara Charcoal?' : language === 'ar' ? 'كيف يمكنني تقديم طلب شراء؟' : 'How can I place an order for your charcoal?' },
    { text: strings.orderBbq, prompt: language === 'id' ? 'Halo, saya ingin memesan Arang BBQ Premium.' : language === 'ar' ? 'مرحباً، أود تقديم طلب لشراء فحم الشواء الممتاز.' : 'Hello, I want to place an order for Premium BBQ Charcoal.' },
    { text: strings.orderShisha, prompt: language === 'id' ? 'Pesan Arang Shisha Premium.' : language === 'ar' ? 'أود طلب فحم الشيشة الفاخر من فضلكم.' : 'Order Premium Shisha Charcoal.' },
  ];

  return (
    <div 
      className="fixed bottom-6 z-55 flex flex-col items-end"
      style={{ 
        right: isRtl ? 'auto' : '1.5rem', 
        left: isRtl ? '1.5rem' : 'auto', 
        direction: isRtl ? 'rtl' : 'ltr' 
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
            className={`w-[calc(100vw-2rem)] sm:w-[410px] h-[calc(100dvh-4rem)] sm:h-[580px] bg-[#0c0d10] border border-zinc-800 sm:rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden mb-4`}
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
                    <span className="text-xs text-zinc-500 font-light">NusaBot is thinking...</span>
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
  );
}
