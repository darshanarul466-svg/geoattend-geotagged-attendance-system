import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, Key, CheckCircle2, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { api } from '../services/api';

function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
      {lines.map((line, lIdx) => {
        if (!line.trim()) {
          return <div key={lIdx} className="h-1" />;
        }

        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
        const cleanLine = isBullet ? line.trim().replace(/^([•\-\*]\s*)/, '') : line;

        const parts = [];
        let pIdx = 0;
        const regex = /(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+)/g;
        let match;
        let lastIndex = 0;

        while ((match = regex.exec(cleanLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(<span key={pIdx++}>{cleanLine.substring(lastIndex, match.index)}</span>);
          }
          const token = match[0];
          if (token.startsWith('**') && token.endsWith('**')) {
            parts.push(<strong key={pIdx++} className="font-bold text-slate-900 dark:text-white">{token.slice(2, -2)}</strong>);
          } else if (token.startsWith('`') && token.endsWith('`')) {
            parts.push(<code key={pIdx++} className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-[10px] break-all">{token.slice(1, -1)}</code>);
          } else if (token.startsWith('http')) {
            parts.push(<span key={pIdx++} className="font-mono text-[10px] underline break-all opacity-80">{token}</span>);
          }
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < cleanLine.length) {
          parts.push(<span key={pIdx++}>{cleanLine.substring(lastIndex)}</span>);
        }

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1">
              <span className="text-terracotta-500 font-bold shrink-0 leading-none mt-1.5 text-[8px]">●</span>
              <div className="flex-1 min-w-0">{parts}</div>
            </div>
          );
        }

        return <div key={lIdx} className="min-w-0">{parts}</div>;
      })}
    </div>
  );
}

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('librahub_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  const initialGreeting = {
    role: 'assistant',
    text: "Hello! 👋 I am **LibraBot**, your intelligent library assistant.\n\nAsk me about real-time book availability, shelf locations, circulation policies, or academic recommendations!"
  };


  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "Which books on algorithms are available?",
    "Recommend books for system design",
    "Where is Clean Code located?",
    "What is the overdue fine policy?"
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('librahub_gemini_key', apiKey.trim());
    setSavedKeyMsg(true);
    setTimeout(() => {
      setSavedKeyMsg(false);
      setShowKeyInput(false);
    }, 1500);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('librahub_gemini_key');
    setApiKey('');
    setSavedKeyMsg(false);
  };

  const handleClearChat = () => {
    setMessages([initialGreeting]);
  };


  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          apiKey: apiKey.trim(),
          conversationHistory: messages
        })
      });

      const data = await res.json();

      if (data.apiKeyRequired) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: "⚠️ Gemini AI is not connected because no API key was configured.\n\nPlease click 'Configure API Key' above to paste your free Google Gemini API key and unlock live generative responses.",
          isWarning: true
        }]);
        setShowKeyInput(true);
      } else if (!data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `⚠️ ${data.message || 'Error communicating with Gemini API.'}`,
          isWarning: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: data.reply,
          provider: data.provider
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "⚠️ Gemini AI is not connected. Please verify your server connection or Gemini API key.",
        isWarning: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#16191F] h-full shadow-2xl border-l border-slate-200 dark:border-[#272D37] flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-[#272D37] flex items-center justify-between bg-slate-50/50 dark:bg-[#1E232B]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-md shadow-terracotta-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                <span>LibraBot Assistant</span>
                <span className="text-[10px] font-mono font-bold bg-terracotta-500/15 text-terracotta-500 px-1.5 py-0.5 rounded-full">
                  Gemini
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Live catalog & research helper</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title="Reset chat conversation and clear tokens"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              title="Configure Gemini API Key"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors cursor-pointer"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Configuration Dropdown */}
        {showKeyInput && (
          <div className="p-4 bg-slate-100 dark:bg-[#1E232B] border-b border-slate-200 dark:border-[#272D37] animate-in slide-in-from-top-2 text-xs">
            <form onSubmit={handleSaveApiKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>Google Gemini API Key</span>
                </span>
                {apiKey ? (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Key Stored
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Not Set
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="AIzaSy... (paste your Gemini API key)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#16191F] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700 font-mono"
              />
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-slate-500">Free from aistudio.google.com</p>
                <div className="flex items-center gap-2">
                  {apiKey && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="px-2.5 py-1.5 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Clear Key
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
                  >
                    {savedKeyMsg ? 'Saved!' : 'Save Key'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden w-full min-w-0 space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 w-full min-w-0 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-terracotta-500/15 text-terracotta-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-[80%] min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden leading-relaxed select-text ${
                  m.role === 'user'
                    ? 'bg-forest-700 text-white rounded-tr-xs'
                    : m.isWarning
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-tl-xs'
                    : 'bg-slate-100 dark:bg-[#1E232B] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-[#272D37] rounded-tl-xs'
                }`}
              >
                <FormattedMessage text={m.text} />
                {m.provider && (
                  <p className="mt-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-mono break-words [overflow-wrap:anywhere]">
                    via {m.provider}
                  </p>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-[#1E232B] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  YOU
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 w-full min-w-0 justify-start items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-lg bg-terracotta-500/15 text-terracotta-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#1E232B] flex items-center gap-2 text-slate-500 max-w-[85%] min-w-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-terracotta-500 shrink-0" />
                <span className="truncate">LibraBot is analyzing catalog...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>


        {/* Suggestion Chips */}
        <div className="p-2.5 border-t border-slate-100 dark:border-[#272D37] bg-slate-50 dark:bg-[#1E232B]/40 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3 py-1 rounded-full bg-white dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-600 dark:text-slate-300 hover:border-forest-700 hover:text-forest-700 dark:hover:text-emerald-400 shrink-0 transition-colors shadow-2xs font-bold"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 dark:border-[#272D37] bg-white dark:bg-[#16191F] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about books, shelf locations, rules..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
