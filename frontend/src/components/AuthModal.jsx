import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess
}) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('attendee'); // 'organizer' | 'attendee'
  const [regId, setRegId] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.auth.login(email, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        role,
        regId,
        department
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (selectedRole) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.auth.demoLogin(selectedRole);
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E3E7E0] max-w-md w-full p-6 shadow-2xl relative text-left my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#F0F4EE] hover:bg-[#E5EBE2] text-[#4A5D51] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#22382B] flex items-center justify-center text-white">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="7" cy="7" r="3"/>
              <circle cx="17" cy="7" r="3"/>
              <circle cx="7" cy="17" r="3"/>
              <circle cx="17" cy="17" r="3"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#14261C]">CheckIn Account</h2>
            <p className="text-xs text-[#6B8073]">Secure authentication & attendance role profile</p>
          </div>
        </div>

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="p-3 rounded-2xl bg-[#F4F8F4] border border-[#DCE4DB] mb-5 text-center">
          <p className="text-[10px] uppercase font-bold text-[#4B6855] tracking-wider mb-2">
            ⚡ Quick Evaluator Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('organizer')}
              disabled={isLoading}
              className="py-2 px-3 rounded-xl bg-[#223B2D] hover:bg-[#2B4B39] text-white text-xs font-semibold shadow-sm transition-all"
            >
              👑 Organizer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('attendee')}
              disabled={isLoading}
              className="py-2 px-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F2F7F2] text-[#223B2D] border border-[#CAD8CC] text-xs font-semibold shadow-sm transition-all"
            >
              🎓 Student Demo
            </button>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="flex border-b border-[#E5ECE3] mb-4 text-xs font-semibold">
          <button
            onClick={() => setTab('login')}
            className={`pb-2 mr-4 transition-colors ${
              tab === 'login'
                ? 'border-b-2 border-[#203D2C] text-[#14261C]'
                : 'text-[#84968B] hover:text-[#203D2C]'
            }`}
          >
            Sign In with Email
          </button>
          <button
            onClick={() => setTab('register')}
            className={`pb-2 transition-colors ${
              tab === 'register'
                ? 'border-b-2 border-[#203D2C] text-[#14261C]'
                : 'text-[#84968B] hover:text-[#203D2C]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-[#FDF0F0] border border-[#F7C6C6] text-xs text-[#B83232] mb-3">
            {errorMsg}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#82998A]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#82998A]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-[#82998A]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#82998A]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@campus.edu"
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#82998A]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-[#3C4F42] mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none"
                >
                  <option value="attendee">Student / Attendee</option>
                  <option value="organizer">Faculty / Organizer</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#3C4F42] mb-1">Reg ID</label>
                <input
                  type="text"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder="REG-401"
                  className="w-full px-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3C4F42] mb-1">Department / Class</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full px-3 py-2 bg-[#F5F8F5] border border-[#DDE4DB] rounded-xl text-xs text-[#16291E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
