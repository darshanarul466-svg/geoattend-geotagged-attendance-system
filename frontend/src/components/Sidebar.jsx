import React from 'react';
import { 
  Compass, 
  LayoutGrid, 
  Users, 
  ArrowLeftRight, 
  QrCode, 
  Download, 
  Sparkles, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenScanner, 
  overdueCount = 0, 
  currentUser,
  onLogout,
  onOpenAI
}) {
  const mainNav = [
    { id: 'dashboard', label: 'Discover', icon: Compass },
    { id: 'books', label: 'Category', icon: LayoutGrid },
    { id: 'members', label: 'My Library', icon: Users },
    { id: 'scanner', label: 'Scan Desk', icon: QrCode, isAction: true },
    { 
      id: 'transactions', 
      label: 'Circulation', 
      icon: ArrowLeftRight, 
      badge: overdueCount > 0 ? `${overdueCount}` : null,
      badgeColor: 'bg-rose-500 text-white' 
    },
  ];


  const secondaryNav = [
    { id: 'ai', label: 'Help / AI', icon: Sparkles, action: onOpenAI },
    { id: 'logout', label: 'Log out', icon: LogOut, action: onLogout },
  ];

  return (
    <aside className="w-60 bg-white dark:bg-[#14171D] text-[#1A1A1A] dark:text-[#EDE8DF] flex flex-col shrink-0 border-r border-[#ECE7DE] dark:border-[#22272E] min-h-screen select-none relative z-10 transition-colors duration-200">
      {/* Brand Header matching reference image: "THE BOOKS" */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#E76F51]"></div>
          <span className="font-black text-sm tracking-[0.25em] text-[#1A1A1A] dark:text-white uppercase">
            THE BOOKS
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {mainNav.map((item) => {
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-[#FAF5EE] dark:bg-[#241F1C] text-[#1A1A1A] dark:text-white shadow-2xs'
                  : 'text-[#71717A] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F8F6F1] dark:hover:bg-[#1C2028]'
              }`}
            >
              <div className="flex items-center gap-3">
                {isActive ? (
                  <div className="w-7 h-7 rounded-xl bg-[#E76F51] text-white flex items-center justify-center shadow-xs">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[#71717A] dark:text-[#9CA3AF] group-hover:text-[#1A1A1A] dark:group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                  </div>
                )}
                <span className={isActive ? 'font-bold text-[#1A1A1A] dark:text-white' : ''}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="pt-4 pb-2 px-3">
          <div className="h-px bg-[#EFEBE3] dark:bg-[#22272E]" />
        </div>

        {/* Secondary Navigation Links */}
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-semibold text-[#71717A] dark:text-[#9CA3AF] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F8F6F1] dark:hover:bg-[#1C2028] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <Icon className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Pastel Badge matching reference media_1788624694712.jpg: "BOOK LIBRARY" */}
      <div className="p-4 pt-0">
        <div className="p-4 rounded-2xl bg-[#E8DEFF] dark:bg-[#2F214D] flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 rounded-xl bg-white/70 dark:bg-white/15 flex items-center justify-center text-[#56369A] dark:text-[#D5C2FF]">
            <Compass className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#56369A] dark:text-[#CBB5FF] mt-2">
            BOOK LIBRARY
          </p>
        </div>
      </div>

      {/* User Terminal Info */}
      <div className="px-5 py-3 border-t border-[#ECE7DE] dark:border-[#22272E] flex items-center justify-between text-xs text-[#71717A] dark:text-[#9CA3AF]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-semibold truncate max-w-[100px] text-[#1A1A1A] dark:text-[#EDE8DF]">
            {currentUser ? currentUser.name : 'Terminal'}
          </span>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F1EDE5] dark:bg-[#22272E] text-[#555] dark:text-[#AAA] uppercase">
          {currentUser ? currentUser.role : 'Active'}
        </span>
      </div>
    </aside>
  );
}
