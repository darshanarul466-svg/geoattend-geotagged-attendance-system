import React, { useState, useEffect, useRef } from 'react';
import { Search, Sun, Moon, Bell, ChevronDown, Sparkles, LogOut, ShieldCheck, UserCheck, Users } from 'lucide-react';

export default function Header({ 
  onOpenCommandPalette, 
  darkMode, 
  setDarkMode, 
  overdueCount = 0,
  onOpenAI,
  currentUser,
  onLogout,
  onOpenStaffModal
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const initials = currentUser && currentUser.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'LB';

  const displayName = currentUser ? currentUser.name : 'Librarian Desk';
  const roleLabel = currentUser && currentUser.role === 'admin' ? 'Chief Admin' : 'Staff / Desk';


  return (
    <header className="h-16 px-6 border-b border-[#ECE7DE] dark:border-[#22272E] bg-white dark:bg-[#14171D] flex items-center justify-between sticky top-0 z-20 shadow-2xs transition-colors duration-200">
      {/* Global Search Bar with Ctrl+K badge */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-[#F8F6F1] dark:bg-[#1C2028] border border-[#E3DDD4] dark:border-[#272D38] text-[#71717A] dark:text-[#9CA3AF] text-xs hover:border-[#193B2D] transition-colors shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#193B2D] transition-colors" />
            <span className="font-medium">Search books, members, or ISBN...</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-white dark:bg-[#252A34] border border-[#DDD6CB] dark:border-[#333A48] text-slate-600 dark:text-slate-300 shadow-2xs">
              Ctrl
            </kbd>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-white dark:bg-[#252A34] border border-[#DDD6CB] dark:border-[#333A48] text-slate-600 dark:text-slate-300 shadow-2xs">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 pl-4">
        {/* Admin Staff Directory Button (Admin Only) */}
        {currentUser && currentUser.role === 'admin' && (
          <button
            onClick={onOpenStaffModal}
            title="Manage Library Staff & Privileges"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all text-xs font-bold shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Staff Roles</span>
          </button>
        )}

        {/* Quick AI Assistant Button */}
        <button
          onClick={onOpenAI}
          title="Ask AI Library Assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EE] dark:bg-[#25201C] text-[#E76F51] border border-[#F0E5D8] dark:border-[#382E28] hover:bg-[#E76F51] hover:text-white transition-all text-xs font-bold shadow-2xs cursor-pointer"
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
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {overdueCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#14171D] animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#181C23] rounded-2xl shadow-xl border border-[#E3DDD4] dark:border-[#2B313D] p-3 z-30 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1] dark:border-[#262C36] font-semibold text-[#71717A] dark:text-[#9CA3AF]">
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
                  <div className="p-3 text-center text-[#71717A] dark:text-[#9CA3AF]">
                    All books are currently within loan duration! 🎉
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge (Dynamically displays logged in user name!) */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-2xl hover:bg-[#F6F4EF] dark:hover:bg-[#1E232B] transition-all border border-transparent hover:border-[#E3DDD4] dark:hover:border-[#2B313D] cursor-pointer"
          >

            <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center text-white shadow-xs ${
              currentUser && currentUser.role === 'admin' ? 'bg-[#193B2D]' : 'bg-[#2D5A4C]'
            }`}>
              {initials}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-[#1A1A1A] dark:text-white leading-tight truncate max-w-[120px]">
                {displayName}
              </p>
              <p className="text-[10px] text-[#71717A] dark:text-[#9CA3AF] font-medium">
                {roleLabel}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#181C23] rounded-2xl shadow-xl border border-[#E3DDD4] dark:border-[#2B313D] py-1.5 z-30 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-3.5 py-2.5 border-b border-[#F0EAE1] dark:border-[#262C36]">
                <p className="font-bold text-[#1A1A1A] dark:text-white">{displayName}</p>
                <p className="text-[11px] text-[#71717A] dark:text-[#9CA3AF] truncate mt-0.5">
                  {currentUser ? currentUser.email : 'user@librahub.edu'}
                </p>
                <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  currentUser && currentUser.role === 'admin'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}>
                  {currentUser ? currentUser.role : 'staff'} Access
                </span>
              </div>

              {currentUser && currentUser.role === 'admin' && (
                <div className="py-1 border-b border-[#F0EAE1] dark:border-[#262C36]">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onOpenStaffModal();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold transition-colors cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-[#193B2D] dark:text-emerald-400" />
                    <span>Staff & Roles Directory</span>
                  </button>
                </div>
              )}

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-semibold transition-colors cursor-pointer"
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
