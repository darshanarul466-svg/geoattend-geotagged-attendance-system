import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function AIAssistantModal({
  isOpen,
  onClose
}) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Campus Attendance & Event Assistant. Ask me about active schedules, geofence radius guidelines, real-time turnout analytics, or anomaly detection!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMsg = prompt.trim();
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const answer = await api.ai.chat(userMsg);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, could not process your query: ' + err.message }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E3E7E0] max-w-lg w-full p-6 shadow-2xl relative text-left my-8 flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#14261C]">AI Event & Turnout Assistant</h3>
              <p className="text-[10px] text-[#6E8275]">Gemini-powered natural language insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#F0F4EE] hover:bg-[#E5EBE2] text-[#4A5D51] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#203D2C] text-white rounded-tr-sm'
                    : 'bg-[#F4F7F3] text-[#1E3024] border border-[#DEE5DC] rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-[#203D2C] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs italic pl-8">
              <span className="animate-spin text-purple-600">✨</span>
              <span>AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="pt-3 border-t border-[#E5ECE3] flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about turnout, geofence radius, or event schedules..."
            className="flex-1 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl px-3.5 py-2 text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="p-2.5 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
