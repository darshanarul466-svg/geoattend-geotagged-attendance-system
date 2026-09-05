import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2, Key, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function AIAssistantDrawer({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('librahub_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! 👋 I am **LibraBot**, your library assistant powered by Google Gemini.\n\nAsk me about book availability, shelf locations, or academic recommendations!"
    }
  ]);
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
      <div className="w-full max-w-md bg-white dark:bg-[#0B132B] h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#0E1626]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span>LibraBot Assistant</span>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                  Gemini
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Live library catalog & research helper</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              title="Configure Gemini API Key"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Configuration Dropdown */}
        {showKeyInput && (
          <div className="p-4 bg-slate-100 dark:bg-[#0E172F] border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 text-xs">
            <form onSubmit={handleSaveApiKey} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
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
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-slate-500">Free from aistudio.google.com</p>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                >
                  {savedKeyMsg ? 'Saved!' : 'Save Key'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : m.isWarning
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-tl-xs'
                    : 'bg-slate-100 dark:bg-[#131E3D] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                }`}
              >
                {m.text}
                {m.provider && (
                  <p className="mt-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                    via {m.provider}
                  </p>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  YOU
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#131E3D] flex items-center gap-2 text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span>LibraBot is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1626] flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 transition-colors shadow-2xs font-bold"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B132B] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about books, shelf locations, rules..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-[#131E3D] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
