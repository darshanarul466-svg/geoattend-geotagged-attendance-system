import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Loader2, PlusCircle, Check } from 'lucide-react';
import { api } from '../services/api';

export default function AddBookModal({ isOpen, onClose, onSuccess }) {
  const [bookId, setBookId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [totalCopies, setTotalCopies] = useState(3);
  const [shelfLocation, setShelfLocation] = useState('Rack CS-01-A');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  
  const [autofilling, setAutofilling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleAiAutofill = async () => {
    if (!title.trim() && !bookId.trim()) {
      setError('Please enter a Title or ISBN / Book ID first to use AI Auto-Fill.');
      return;
    }

    setError(null);
    setAutofilling(true);
    setAiSuccessMsg(null);

    try {
      const res = await api.autofillBookAI(title.trim(), bookId.trim());
      if (res.metadata) {
        if (res.metadata.author && !author) setAuthor(res.metadata.author);
        if (res.metadata.category) setCategory(res.metadata.category);
        if (res.metadata.shelf_location) setShelfLocation(res.metadata.shelf_location);
        if (res.metadata.description) setDescription(res.metadata.description);
        setAiSuccessMsg('AI generated book details and shelf placement!');
      }
    } catch (err) {
      setError('AI autofill failed. You can enter details manually.');
    } finally {
      setAutofilling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        book_id: bookId.trim(),
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        total_copies: parseInt(totalCopies, 10) || 1,
        shelf_location: shelfLocation.trim(),
        description: description.trim(),
        cover_url: coverUrl.trim()
      };

      const res = await api.createBook(payload);
      onSuccess(res.message);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add book to catalog.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#16191F] w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-[#272D37] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#272D37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-700/10 text-forest-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Add New Book to Catalog</h3>
              <p className="text-[11px] text-slate-500 font-medium">Register book metadata and generate QR barcode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E232B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {aiSuccessMsg && (
            <div className="p-2.5 rounded-xl bg-terracotta-500/10 border border-terracotta-500/30 text-terracotta-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
              <span>{aiSuccessMsg}</span>
            </div>
          )}

          {/* Book ID and Title with AI Autofill button */}
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structure and Interpretation of Computer Programs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                />
              </div>

              <button
                type="button"
                onClick={handleAiAutofill}
                disabled={autofilling || (!title.trim() && !bookId.trim())}
                className="px-3.5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                {autofilling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>AI Auto-Fill</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Book ID / ISBN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BK02345 or 978-0262510875"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Author(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harold Abelson, Gerald Jay Sussman"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="General Science">General Science</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Copies *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shelf Location</label>
                <input
                  type="text"
                  placeholder="Rack CS-02-B"
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Image URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Synopsis / Description</label>
              <textarea
                rows={3}
                placeholder="Brief synopsis or academic notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-slate-900 dark:text-white focus:outline-none focus:border-forest-700"
              />
            </div>
          </div>

          {/* Footer */}
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
              {submitting ? 'Adding Book...' : 'Save Book to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
