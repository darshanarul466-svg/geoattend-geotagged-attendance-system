import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, BookOpen, User, Calendar, Check, AlertCircle } from 'lucide-react';
import BookCover from './BookCover';
import { api } from '../services/api';

export default function IssueModal({ 
  isOpen, 
  onClose, 
  book, 
  borrowersList = [], 
  onSuccess 
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isNewMember, setIsNewMember] = useState(false);
  const [newStudentId, setNewStudentId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('Computer Science & Engineering');
  const [loanDays, setLoanDays] = useState(14);
  const [notes, setNotes] = useState('Semester reference');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let payload = {
        bookId: book.book_id,
        loanDays,
        notes
      };

      if (isNewMember) {
        if (!newStudentId || !newName || !newEmail) {
          throw new Error('Student ID, Name, and Email are required.');
        }
        payload = {
          ...payload,
          studentId: newStudentId,
          name: newName,
          email: newEmail,
          phone: newPhone,
          department: newDepartment
        };
      } else {
        if (!selectedStudentId) {
          throw new Error('Please select a student member.');
        }
        const member = borrowersList.find(b => b.student_id === selectedStudentId);
        payload = {
          ...payload,
          studentId: selectedStudentId,
          name: member ? member.name : '',
          email: member ? member.email : ''
        };
      }

      const res = await api.issueBook(payload);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onSuccess(res.message);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to issue book.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#16191F] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-[#272D37] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#272D37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-700/10 text-forest-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Issue Book to Member</h3>
              <p className="text-[11px] text-slate-500 font-medium">Record loan and update catalog inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E232B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Book Summary Card */}
        <div className="p-5 bg-slate-50 dark:bg-[#1E232B]/40 border-b border-slate-100 dark:border-[#272D37] flex items-center gap-4">
          <BookCover
            coverUrl={book.cover_url}
            title={book.title}
            author={book.author}
            category={book.category}
            bookId={book.book_id}
            className="w-14 h-20 shrink-0"
          />
          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-forest-700 dark:text-emerald-400 bg-forest-50 dark:bg-forest-950/50 px-1.5 py-0.5 rounded text-[10px]">
                {book.book_id}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px]">
                {book.available_copies} of {book.total_copies} available
              </span>
            </div>
            <h4 className="font-serif font-bold text-slate-900 dark:text-white mt-1 text-sm truncate">{book.title}</h4>
            <p className="text-slate-500 truncate">by {book.author}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#272D37]">
            <span className="font-bold text-slate-800 dark:text-slate-200">Borrower Information</span>
            <button
              type="button"
              onClick={() => setIsNewMember(!isNewMember)}
              className="text-forest-700 dark:text-emerald-400 text-xs font-bold hover:underline"
            >
              {isNewMember ? '← Select Existing Member' : '+ New Member Registration'}
            </button>
          </div>

          {!isNewMember ? (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Registered Student Member
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
              >
                <option value="">-- Choose a Student --</option>
                {borrowersList.map(m => (
                  <option key={m.student_id} value={m.student_id}>
                    {m.name} ({m.student_id}) — {m.department}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Student / Reg ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RA2411003010042"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Rao"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aditi.rao@campus.edu"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98401 23456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>
            </div>
          )}

          {/* Loan Configuration */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Loan Duration
              </label>
              <select
                value={loanDays}
                onChange={(e) => setLoanDays(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
              >
                <option value={7}>7 Days (Short Loan)</option>
                <option value={14}>14 Days (Standard)</option>
                <option value={28}>28 Days (Faculty / Research)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Return Deadline
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] font-mono text-forest-700 dark:text-emerald-400 font-bold">
                {new Date(Date.now() + loanDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Loan Notes / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Semester coursework reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#272D37] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#272D37] text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white font-bold shadow-md shadow-forest-900/20 transition-all flex items-center gap-1.5"
            >
              {submitting ? 'Issuing Book...' : 'Confirm Book Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
