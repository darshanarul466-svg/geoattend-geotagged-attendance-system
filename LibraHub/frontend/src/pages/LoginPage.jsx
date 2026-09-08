import React, { useState } from 'react';
import { 
  BookMarked, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User, 
  Mail,
  ArrowRight, 
  Eye, 
  EyeOff, 
  Compass, 
  AlertCircle 
} from 'lucide-react';

import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff'); // 'admin' or 'staff'
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isRegisterMode) {
        data = await api.register({
          username: identifier.trim(),
          email: email.trim(),
          password,
          name: fullName.trim(),
          role
        });
      } else {
        data = await api.login(identifier.trim(), password);
      }

      if (!data.success || !data.token) {
        throw new Error(data.message || 'Authentication failed.');
      }

      api.setToken(data.token, rememberMe);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F4F0] dark:bg-[#0F1115] text-[#1A1A1A] dark:text-[#EDE8DF] p-4 sm:p-6 select-none transition-colors duration-200">
      {/* Outer Card Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#16191F] rounded-[32px] border border-[#E6E1D8] dark:border-[#262C36] shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left Side: Nordic Editorial Brand Banner */}
        <div className="md:col-span-5 bg-[#EFECE6] dark:bg-[#1B1F27] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E2DDD4] dark:border-[#272D38] relative">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#193B2D] text-white flex items-center justify-center shadow-sm">
                <BookMarked className="w-5 h-5" />
              </div>
              <span className="text-xs font-black tracking-[0.25em] text-[#1A1A1A] dark:text-white uppercase">
                THE BOOKS
              </span>
            </div>

            {/* Editorial Heading */}
            <div className="mt-10 sm:mt-14 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E76F51]">
                Circulation Desk Portal
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-[#F3EFE6] leading-snug">
                The smart library terminal for campus circulation.
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed pt-1">
                Automated QR book issue and return desk, real-time inventory tracking, and overdue audit intelligence.
              </p>
            </div>
          </div>

          {/* Bottom Card / Badge (from reference image) */}
          <div className="mt-8 pt-6 border-t border-[#DFD9CE] dark:border-[#272D38]">
            <div className="p-4 rounded-2xl bg-[#E8DEFF] dark:bg-[#2F214D] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center text-[#56369A] dark:text-[#D5C2FF]">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#56369A] dark:text-[#CBB5FF]">
                  BOOK LIBRARY
                </p>
                <p className="text-[11px] text-[#56369A]/80 dark:text-[#CBB5FF]/80 font-medium">
                  Central Catalog
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Authentic Sign In Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">
                  {isRegisterMode ? 'Create Staff Account' : 'Sign In'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError(null);
                  }}
                  className="text-xs font-semibold text-[#193B2D] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isRegisterMode ? 'Already have an account?' : 'Register new staff'}
                </button>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                {isRegisterMode 
                  ? 'Register a new administrator or desk librarian account.' 
                  : 'Enter your credentials to access the library workstation.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eleanor Vance"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F9F8F6] dark:bg-[#1C2028] border border-[#E3DDD4] dark:border-[#2D333F] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#193B2D] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="name@campus.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F9F8F6] dark:bg-[#1C2028] border border-[#E3DDD4] dark:border-[#2D333F] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#193B2D] transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">
                  {isRegisterMode ? 'Desired Username' : 'Username or Institutional Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={isRegisterMode ? 'e.g. librarian_john' : 'admin, staff, or name@campus.edu'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#F9F8F6] dark:bg-[#1C2028] border border-[#E3DDD4] dark:border-[#2D333F] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#193B2D] transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F9F8F6] dark:bg-[#1C2028] border border-[#E3DDD4] dark:border-[#2D333F] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#193B2D] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection when Registering */}
              {isRegisterMode && (
                <div>
                  <label className="block font-semibold text-[#374151] dark:text-[#D1D5DB] mb-1.5">
                    Access Privilege Level
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRole('staff')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        role === 'staff'
                          ? 'bg-[#193B2D] border-[#193B2D] text-white shadow-sm'
                          : 'bg-[#F9F8F6] dark:bg-[#1C2028] border-[#E3DDD4] dark:border-[#2D333F] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Desk Staff</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        role === 'admin'
                          ? 'bg-[#193B2D] border-[#193B2D] text-white shadow-sm'
                          : 'bg-[#F9F8F6] dark:bg-[#1C2028] border-[#E3DDD4] dark:border-[#2D333F] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Chief Admin</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#193B2D] focus:ring-[#193B2D]"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Keep me signed in on this terminal
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-[#193B2D] hover:bg-[#122B21] disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : (isRegisterMode ? 'Create Account' : 'Sign In to Terminal')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo Note for Evaluators */}
            <div className="mt-8 pt-4 border-t border-[#EAE5DC] dark:border-[#252B35] text-center">
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                Central Campus Library • Demo Credentials: <code className="font-mono font-bold bg-[#EFECE6] dark:bg-[#20252F] px-1.5 py-0.5 rounded text-[10px]">admin / admin123</code> or <code className="font-mono font-bold bg-[#EFECE6] dark:bg-[#20252F] px-1.5 py-0.5 rounded text-[10px]">staff / staff123</code>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
