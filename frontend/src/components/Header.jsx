import React, { useState } from 'react';
import { Search, Sun, Moon, Bell, ChevronDown, Sparkles, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({ 
  onOpenCommandPalette, 
  darkMode, 
  setDarkMode, 
  overdueCount = 0,
  onOpenAI
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar with Ctrl+K badge */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-sm hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-xs md:text-sm">Search books, members, or ISBN...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 shadow-2xs">
              Ctrl
            </kbd>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 shadow-2xs">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-semibold transition-all shadow-2xs"
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-30 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Alerts & Notifications</span>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-bold">
                  {overdueCount} Overdue
                </span>
              </div>
              <div className="py-2 text-xs space-y-2">
                {overdueCount > 0 ? (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 text-rose-700 dark:text-rose-300">
                    <p className="font-semibold">{overdueCount} book(s) past due date!</p>
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-400 mt-0.5">Automated penalty fees of ₹5/day are currently active.</p>
                  </div>
                ) : (
                  <div className="p-3 text-center text-slate-400 text-xs">
                    All books are currently within loan duration! 🎉
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge (Darshan A - Librarian) */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shadow-blue-500/30">
              DA
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Darshan A</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Chief Librarian</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-30 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Darshan A</p>
                <p className="text-[11px] text-slate-400">da5512@srmist.edu.in</p>
              </div>
              <div className="py-1">
                <div className="flex items-center gap-2 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Admin Privileges</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
