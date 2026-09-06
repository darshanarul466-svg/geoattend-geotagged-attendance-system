import React, { useState } from 'react';
import { Users, Search, UserPlus, Mail, Phone, BookOpen, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function MembersView({ 
  borrowers = [], 
  onRefresh, 
  onOpenAddMember,
  isAddModalOpen,
  setIsAddModalOpen,
  initialSearch = ''
}) {
  const [search, setSearch] = useState(initialSearch);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const filteredMembers = borrowers.filter(m => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.student_id.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.department && m.department.toLowerCase().includes(q))
    );
  });

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.createBorrower({
        student_id: studentId.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim()
      });

      setIsAddModalOpen(false);
      setStudentId('');
      setName('');
      setEmail('');
      setPhone('');
      onRefresh();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Registered Student Members
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Browse registered university borrowers, contact info, and active loans.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-md shadow-forest-900/20 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by student name, ID (e.g. RA24...), or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#16191F] border border-slate-200 dark:border-[#272D37] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-forest-700 font-medium shadow-xs"
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((m) => (
          <div
            key={m.student_id}
            className="p-5 rounded-3xl bg-white dark:bg-[#16191F] border border-slate-200 dark:border-[#272D37] shadow-xs hover:border-forest-700/50 dark:hover:border-forest-700/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-700/10 dark:bg-emerald-950/60 text-forest-700 dark:text-emerald-400 font-bold text-sm flex items-center justify-center">
                    {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {m.name}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {m.student_id}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  m.active_loans_count > 0 
                    ? 'bg-terracotta-500/15 text-terracotta-500'
                    : 'bg-slate-100 dark:bg-[#1E232B] text-slate-500'
                }`}>
                  {m.active_loans_count || 0} active loan(s)
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#272D37] space-y-2 text-xs">
                <div className="text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-500">Dept: </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{m.department}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 truncate">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <a href={`mailto:${m.email}`} className="hover:underline truncate">{m.email}</a>
                </div>
                {m.phone && (
                  <div className="flex items-center gap-2 text-slate-500 font-mono">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{m.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#272D37] flex items-center justify-between text-[11px] text-slate-400">
              <span>Registered: {new Date(m.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#16191F] w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-[#272D37] overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-[#272D37] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest-700/10 dark:bg-emerald-950/60 text-forest-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Register Student Member</h3>
                  <p className="text-[11px] text-slate-500">Issue membership card and borrowing permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E232B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterMember} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Student / Registration ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RA2411003010042"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white font-mono focus:border-forest-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:border-forest-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aditi.rao@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:border-forest-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98401 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white font-mono focus:border-forest-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:border-forest-700 focus:outline-none"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#272D37] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#272D37] text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-[#1E232B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white font-bold shadow-md shadow-forest-900/20"
                >
                  {submitting ? 'Registering...' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
