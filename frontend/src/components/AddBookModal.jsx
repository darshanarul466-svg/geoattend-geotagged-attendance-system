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
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add New Book to Catalog</h3>
              <p className="text-[11px] text-slate-500">Register book metadata and generate QR barcode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
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
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAiAutofill}
                disabled={autofilling || (!title.trim() && !bookId.trim())}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Shelf Location</label>
                <input
                  type="text"
                  placeholder="Rack CS-02-B"
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Synopsis / Description</label>
              <textarea
                rows={3}
                placeholder="Brief synopsis or academic notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              {submitting ? 'Adding Book...' : 'Save Book to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
