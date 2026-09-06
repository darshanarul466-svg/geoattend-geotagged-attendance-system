import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  QrCode, 
  Trash2, 
  BookOpen, 
  MapPin, 
  Tag, 
  ShieldAlert
} from 'lucide-react';
import BookCover from '../components/BookCover';
import { api } from '../services/api';

export default function BooksView({ 
  books = [], 
  categories = [], 
  onOpenAddBook, 
  onOpenScanner, 
  onSelectQRBook, 
  onSelectIssueBook,
  onRefresh,
  initialSearch = '',
  currentUser
}) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const isAdmin = currentUser && currentUser.role === 'admin';

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q || 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) || 
        b.book_id.toLowerCase().includes(q);

      const matchCat = selectedCategory === 'All' || b.category === selectedCategory;

      let matchAvail = true;
      if (availabilityFilter === 'available') {
        matchAvail = b.available_copies > 0;
      } else if (availabilityFilter === 'issued') {
        matchAvail = b.available_copies < b.total_copies;
      } else if (availabilityFilter === 'unavailable') {
        matchAvail = b.available_copies === 0;
      }

      return matchSearch && matchCat && matchAvail;
    });
  }, [books, search, selectedCategory, availabilityFilter]);

  const handleDeleteBook = async (book) => {
    if (!isAdmin) {
      alert('Action Restricted: Only Chief Librarians (Admin) have permission to remove books from the central catalog.');
      return;
    }

    if (book.available_copies < book.total_copies) {
      alert(`Cannot delete '${book.title}'. There are active copies currently checked out.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete '${book.title}' (${book.book_id}) from catalog?`)) {
      return;
    }

    setDeletingId(book.book_id);
    try {
      await api.deleteBook(book.book_id);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete book.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Book Inventory & Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage central library records, generate physical QR stickers, and track shelf placement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenScanner}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#272D37] bg-white dark:bg-[#16191F] hover:bg-slate-50 dark:hover:bg-[#1E232B] text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
            <span>Scan QR Desk</span>
          </button>

          <button
            onClick={onOpenAddBook}
            className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-md shadow-forest-900/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-[#16191F] rounded-3xl border border-slate-200 dark:border-[#272D37] shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Title, Author, or ISBN / Book ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-forest-700 font-medium"
            />
          </div>

          {/* Availability Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E232B] p-1 rounded-xl w-full md:w-auto text-xs shrink-0 font-semibold">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                availabilityFilter === 'all'
                  ? 'bg-white dark:bg-[#16191F] text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All ({books.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                availabilityFilter === 'available'
                  ? 'bg-white dark:bg-[#16191F] text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setAvailabilityFilter('issued')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                availabilityFilter === 'issued'
                  ? 'bg-white dark:bg-[#16191F] text-forest-700 dark:text-emerald-400 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Issued
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full font-bold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-forest-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#1E232B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1E232B] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBooks.map((b) => (
          <div
            key={b.book_id}
            className="bg-white dark:bg-[#16191F] rounded-3xl p-5 border border-slate-200 dark:border-[#272D37] shadow-xs hover:border-forest-700/50 dark:hover:border-forest-700/60 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Meta with Guaranteed BookCover */}
              <div className="flex items-start gap-4">
                <BookCover
                  coverUrl={b.cover_url}
                  title={b.title}
                  author={b.author}
                  category={b.category}
                  bookId={b.book_id}
                  className="w-20 h-28"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-forest-700 dark:text-emerald-400 bg-forest-50 dark:bg-forest-950/50 px-2 py-0.5 rounded text-[10px]">
                      {b.book_id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-[#1E232B] px-2 py-0.5 rounded">
                      {b.category}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-1.5 leading-snug line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5 line-clamp-1 font-medium">by {b.author}</p>

                  <div className="mt-2.5 flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                    <span className="truncate font-medium">{b.shelf_location || 'Rack CS-01-A'}</span>
                  </div>
                </div>
              </div>

              {/* Stock Status Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#272D37] flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Inventory Status:</span>
                <span className={`font-bold flex items-center gap-1.5 ${
                  b.available_copies > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${b.available_copies > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span>{b.available_copies} of {b.total_copies} available</span>
                </span>
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#272D37] flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => onSelectQRBook(b)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#272D37] hover:bg-slate-100 dark:hover:bg-[#1E232B] text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
                title="View & Print QR Label"
              >
                <QrCode className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                <span>QR Badge</span>
              </button>

              <div className="flex items-center gap-1.5">
                {b.available_copies > 0 && (
                  <button
                    onClick={() => onSelectIssueBook(b)}
                    className="px-4 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold transition-all shadow-xs"
                  >
                    Issue
                  </button>
                )}

                {isAdmin ? (
                  <button
                    onClick={() => handleDeleteBook(b)}
                    disabled={deletingId === b.book_id}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Book (Admin only)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span 
                    title="Chief Admin privilege required to delete catalog items"
                    className="p-1.5 text-slate-400 cursor-not-allowed opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#16191F] rounded-3xl border border-slate-200 dark:border-[#272D37]">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No books found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
        </div>
      )}
    </div>
  );
}
