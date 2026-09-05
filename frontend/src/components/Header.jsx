import React, { useState } from 'react';
import { Search, Sun, Moon, Bell, ChevronDown, Sparkles, LogOut, ShieldCheck, UserCheck } from 'lucide-react';

export default function Header({ 
  onOpenCommandPalette, 
  darkMode, 
  setDarkMode, 
  overdueCount = 0,
  onOpenAI,
  currentUser,
  onLogout
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const initials = currentUser && currentUser.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'LB';

  const displayName = currentUser ? currentUser.name : 'Librarian Desk';
  const roleLabel = currentUser && currentUser.role === 'admin' ? 'Chief Admin' : 'Staff / Desk';

  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Global Search Bar with Ctrl+K badge */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-850 dark:bg-[#131E3D] border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 text-xs hover:border-blue-500 transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="font-medium">Search books, members, or ISBN...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 shadow-2xs">
              Ctrl
            </kbd>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 shadow-2xs">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 pl-4">
        {/* Quick AI Assistant Button */}
        <button
          onClick={onOpenAI}
          title="Ask AI Library Assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {overdueCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0B132B] animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0E172F] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-30 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-500 dark:text-slate-400">
                <span>Alerts & Fines</span>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-bold">
                  {overdueCount} Overdue
                </span>
              </div>
              <div className="py-2 space-y-2">
                {overdueCount > 0 ? (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                    <p className="font-bold">{overdueCount} book(s) past due date!</p>
                    <p className="text-[11px] text-rose-600/90 dark:text-rose-400 mt-0.5">Penalty rate: ₹5.00/day per unreturned book.</p>
                  </div>
                ) : (
                  <div className="p-3 text-center text-slate-400">
                    All books are currently within loan duration! 🎉
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge (Dynamically displays logged in user name!) */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center text-white shadow-xs ${
              currentUser && currentUser.role === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {initials}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {roleLabel}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0E172F] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100">{displayName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {currentUser ? currentUser.email : 'user@librahub.edu'}
                </p>
                <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  currentUser && currentUser.role === 'admin'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {currentUser ? currentUser.role : 'staff'} Access
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Switch Account / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
