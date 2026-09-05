import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  QrCode, 
  FileSpreadsheet, 
  Sparkles, 
  BookMarked
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenScanner, overdueCount = 0, currentUser }) {
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
    <aside className="w-64 bg-[#0B132B] text-slate-200 flex flex-col shrink-0 border-r border-slate-800 min-h-screen select-none relative z-10">
      {/* Brand Logo */}
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
          <BookMarked className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-base text-white tracking-tight leading-none">LibraHub</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Read · Learn · Grow</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1">
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Cicero Quote Box */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-2xl bg-[#111C38] border border-slate-800 text-slate-300">
        <p className="text-[11px] leading-relaxed italic text-slate-300">
          “A room without books is a body without a soul.”
        </p>
        <p className="text-[10px] font-bold text-blue-400 mt-1">
          — Marcus Tullius Cicero
        </p>
      </div>

      {/* Ambient Potted Plant Illustration (from user reference image) */}
      <div className="px-4 pb-2 flex justify-center">
        <img
          src="/ambient-plant.jpg"
          alt="Ambient Houseplant"
          className="w-32 h-32 object-contain opacity-90 filter drop-shadow-md pointer-events-none rounded-xl"
        />
      </div>

      {/* System Status / User Badge */}
      <div className="px-5 py-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-[#090F24]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-medium truncate max-w-[120px]">
            {currentUser ? currentUser.name : 'System Online'}
          </span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
          {currentUser ? currentUser.role : 'Active'}
        </span>
      </div>
    </aside>
  );
}
