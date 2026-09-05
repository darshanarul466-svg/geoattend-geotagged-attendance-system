import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  QrCode, 
  FileSpreadsheet, 
  Sparkles, 
  Plus, 
  ArrowRight,
  X
} from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  books = [], 
  borrowers = [], 
  onNavigate, 
  onOpenScanner, 
  onOpenAddBook, 
  onOpenAI 
}) {
  const [query, setQuery] = useState('');

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const filteredBooks = cleanQuery ? books.filter(b => 
    b.title.toLowerCase().includes(cleanQuery) || 
    b.author.toLowerCase().includes(cleanQuery) || 
    b.book_id.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const filteredMembers = cleanQuery ? borrowers.filter(m => 
    m.name.toLowerCase().includes(cleanQuery) || 
    m.student_id.toLowerCase().includes(cleanQuery) ||
    m.department.toLowerCase().includes(cleanQuery)
  ).slice(0, 3) : [];

  const defaultActions = [
    { id: 'scan', label: 'Scan Book QR Sticker', icon: QrCode, action: () => { onClose(); onOpenScanner(); } },
    { id: 'add_book', label: 'Add New Book to Catalog', icon: Plus, action: () => { onClose(); onOpenAddBook(); } },
    { id: 'ai', label: 'Ask AI Library Assistant', icon: Sparkles, action: () => { onClose(); onOpenAI(); } },
    { id: 'books', label: 'Browse Full Catalog', icon: BookOpen, action: () => { onClose(); onNavigate('books'); } },
    { id: 'members', label: 'View Student Members', icon: Users, action: () => { onClose(); onNavigate('members'); } },
    { id: 'tx', label: 'View Audit & History', icon: ArrowLeftRight, action: () => { onClose(); onNavigate('transactions'); } }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, book title, author, or student ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3 text-xs">
          {/* Books Matches */}
          {filteredBooks.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Books in Catalog</p>
              <div className="space-y-1 mt-1">
                {filteredBooks.map(b => (
                  <button
                    key={b.book_id}
                    onClick={() => {
                      onClose();
                      onNavigate('books', { search: b.book_id });
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{b.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{b.author} • {b.book_id}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                      {b.available_copies} available
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Members Matches */}
          {filteredMembers.length > 0 && (
            <div>
              <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Members</p>
              <div className="space-y-1 mt-1">
                {filteredMembers.map(m => (
                  <button
                    key={m.student_id}
                    onClick={() => {
                      onClose();
                      onNavigate('members', { search: m.student_id });
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{m.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{m.student_id} • {m.department}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
            <div className="space-y-1 mt-1">
              {defaultActions.map(act => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{act.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
