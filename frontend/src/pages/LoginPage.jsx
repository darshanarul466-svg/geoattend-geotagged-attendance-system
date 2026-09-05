import React, { useState } from 'react';
import { BookMarked, ShieldCheck, UserCheck, Lock, User, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('Eleanor Vance');
  const [role, setRole] = useState('admin'); // 'admin' or 'staff'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuickLogin = (demoRole) => {
    if (demoRole === 'admin') {
      setUsername('admin');
      setPassword('admin123');
      setFullName('Eleanor Vance');
      setRole('admin');
    } else {
      setUsername('staff');
      setPassword('staff123');
      setFullName('Marcus Reed');
      setRole('staff');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          name: fullName.trim() || username.trim(),
          role: role
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed.');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070b14] text-slate-100 p-4 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#0e1626] border border-slate-800/90 rounded-3xl p-7 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-3">
            <BookMarked className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">LibraHub Circulation Desk</h1>
          <p className="text-xs text-slate-400 mt-1">SRMIST Central Library Management Portal</p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
            <span>1-Click Test Access:</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className={`p-2 rounded-xl text-left border transition-all ${
                role === 'admin' && username === 'admin'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Chief Admin</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Eleanor Vance (Full)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('staff')}
              className={`p-2 rounded-xl text-left border transition-all ${
                role === 'staff' && username === 'staff'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Staff / Desk</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Marcus Reed (Desk)</p>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Login / Dynamic Sign-in Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="Enter your name (e.g. Alex Morgan)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username / ID</label>
              <input
                type="text"
                required
                placeholder="e.g. admin or staff"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Access Role & Privileges</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'admin'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin (Chief)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'staff'
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Staff (Desk)</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : `Enter LibraHub as ${fullName.split(' ')[0] || 'Librarian'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          Open-Source Library Automation System • SRMIST
        </div>
      </div>
    </div>
  );
}
