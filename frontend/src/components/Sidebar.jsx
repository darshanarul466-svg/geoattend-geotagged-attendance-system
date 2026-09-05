import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  QrCode, 
  FileSpreadsheet, 
  Sparkles, 
  Settings,
  BookMarked
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenScanner, overdueCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books Catalog', icon: BookOpen },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, badge: overdueCount > 0 ? `${overdueCount} Overdue` : null, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'scanner', label: 'QR Issue & Return', icon: QrCode, isAction: true },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles, badge: 'AI 🤖', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  ];

  return (
    <aside className="w-64 bg-[#0e1626] text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80 min-h-screen select-none">
      {/* Brand Logo */}
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
          <BookMarked className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight leading-none">LibraHub</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Read · Learn · Grow</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isAction) {
                  onOpenScanner();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Cicero Quote Footer (from Preview) */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden">
        <div className="text-[11px] leading-relaxed italic text-slate-300">
          “A room without books is a body without a soul.”
        </div>
        <div className="text-[10px] font-semibold text-blue-400 mt-1.5">
          — Marcus Tullius Cicero
        </div>
        {/* Subtle decorative glow */}
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Bottom system status */}
      <div className="px-6 py-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Online</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">v1.0.0</span>
      </div>
    </aside>
  );
}
