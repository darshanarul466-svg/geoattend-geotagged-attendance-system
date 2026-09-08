import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Bookmark, 
  Plus, 
  UserPlus, 
  ArrowLeftRight, 
  QrCode, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import StatCard from '../components/StatCard';
import BookCover from '../components/BookCover';

export default function DashboardView({ 
  stats, 
  categories = [], 
  recentTransactions = [], 
  recentlyAddedBooks = [], 
  usageTrend = [],
  onOpenScanner,
  onOpenAddBook,
  onOpenAddMember,
  onNavigate,
  onOpenAI,
  currentUser
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Reference curated recommendations matching media_1788624694712.jpg
  const recommendations = [
    {
      book_id: 'REC001',
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      category: 'Money/Investing',
      shelf_location: 'Rack EC-01-A',
      available_copies: 3,
      total_copies: 4
    },
    {
      book_id: 'REC002',
      title: 'Company of One',
      author: 'Paul Jarvis',
      category: 'Business',
      shelf_location: 'Rack BS-02-B',
      available_copies: 2,
      total_copies: 3
    },
    {
      book_id: 'REC003',
      title: 'How Innovation Works',
      author: 'Matt Ridley',
      category: 'Engineering',
      shelf_location: 'Rack IN-01-A',
      available_copies: 4,
      total_copies: 4
    },
    {
      book_id: 'REC004',
      title: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      category: 'Classic Literature',
      shelf_location: 'Rack LIT-02-A',
      available_copies: 2,
      total_copies: 3
    },
    {
      book_id: 'BK00123',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      category: 'Computer Science',
      shelf_location: 'Rack CS-01-A',
      available_copies: 4,
      total_copies: 5
    },
    {
      book_id: 'BK00456',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma et al.',
      category: 'Engineering',
      shelf_location: 'Rack CS-01-B',
      available_copies: 4,
      total_copies: 4
    }
  ];

  // Curated category capsules matching media_1788624694712.jpg
  const curatedCategories = [
    {
      name: 'Money/Investing',
      sampleTitle: 'The Psychology of Money',
      sampleAuthor: 'Morgan Housel'
    },
    {
      name: 'Design & UX',
      sampleTitle: 'Company of One',
      sampleAuthor: 'Paul Jarvis'
    },
    {
      name: 'Business',
      sampleTitle: 'How Innovation Works',
      sampleAuthor: 'Matt Ridley'
    },
    {
      name: 'Self Improvement',
      sampleTitle: 'Atomic Habits',
      sampleAuthor: 'James Clear'
    },
    {
      name: 'Computer Science',
      sampleTitle: 'Clean Code',
      sampleAuthor: 'Robert C. Martin'
    },
    {
      name: 'Classic Literature',
      sampleTitle: 'The Picture of Dorian Gray',
      sampleAuthor: 'Oscar Wilde'
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigate('books');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto transition-colors duration-200">
      
      {/* 1. TOP CURVED DISCOVER BANNER (Matching media_1788624694712.jpg) */}
      <div className="bg-[#ECE7DF] dark:bg-[#181C23] rounded-[32px] p-6 sm:p-10 border border-[#E0D9CD] dark:border-[#262C37]">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F3EFE6] tracking-tight">
            Discover
          </h1>
          <p className="text-xs text-[#71717A] dark:text-[#9CA3AF] mt-1 font-medium">
            Explore academic volumes, reserve reading material, and manage circulation records.
          </p>
        </div>

        {/* Floating Search Pill matching reference image */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row items-center gap-2 bg-white dark:bg-[#1F242D] p-1.5 rounded-2xl border border-[#DAD2C5] dark:border-[#2C3340] shadow-sm max-w-2xl">
          {/* Category Dropdown Pill */}
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB] hover:bg-[#F6F4EF] dark:hover:bg-[#282E3A] rounded-xl transition-colors cursor-pointer"
            >
              <span>{selectedCategory === 'All' ? 'All Categories' : selectedCategory}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1F242D] border border-[#DDD6CB] dark:border-[#2C3340] rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setCategoryDropdownOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#FAF8F5] dark:hover:bg-[#282E3A] font-semibold text-slate-700 dark:text-slate-300"
                >
                  All Categories
                </button>
                {curatedCategories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#FAF8F5] dark:hover:bg-[#282E3A] text-slate-600 dark:text-slate-300"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-[#E5DFD4] dark:bg-[#2C3340] hidden sm:block" />

          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 px-2 w-full">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Find book name or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-[#1A1A1A] dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Dark Forest Green Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#193B2D] hover:bg-[#122B21] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. SECTION: BOOK RECOMMENDATION (Matching media_1788624694712.jpg) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white">
            Book Recommendation
          </h2>
          <button
            onClick={() => onNavigate('books')}
            className="text-xs font-semibold text-[#71717A] dark:text-[#9CA3AF] hover:text-[#193B2D] dark:hover:text-emerald-400 border border-[#DDD6CB] dark:border-slate-700 px-3.5 py-1.5 rounded-full hover:bg-white dark:hover:bg-[#16191F] transition-all cursor-pointer flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Carousel of Strict 2:3 Vertical Covers */}
        <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {recommendations.map((b) => (
            <div
              key={b.book_id}
              onClick={() => onNavigate('books')}
              className="w-38 sm:w-44 shrink-0 flex flex-col group cursor-pointer"
            >
              <BookCover
                title={b.title}
                author={b.author}
                category={b.category}
                bookId={b.book_id}
                className="w-full aspect-[2/3] rounded-2xl"
              />
              <div className="pt-2 px-1">
                <h4 className="font-bold text-xs text-[#1A1A1A] dark:text-white truncate group-hover:text-[#E76F51] transition-colors">
                  {b.title}
                </h4>
                <p className="text-[11px] text-[#71717A] dark:text-[#9CA3AF] truncate mt-0.5">
                  {b.author}
                </p>
                <div className="flex items-center justify-between mt-1.5 text-[10px]">
                  <span className="font-mono text-slate-400">{b.book_id}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {b.available_copies} avail
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECTION: BOOK CATEGORY (Matching media_1788624694712.jpg) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white">
            Book Category
          </h2>
          <div className="p-1.5 rounded-xl border border-[#DDD6CB] dark:border-slate-700 text-[#71717A] dark:text-[#9CA3AF]">
            <LayoutGrid className="w-4 h-4" />
          </div>
        </div>

        {/* Category Cards with Preview Covers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {curatedCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('books')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#16191F] border border-[#ECE7DF] dark:border-[#272D38] hover:border-[#DDD6CB] dark:hover:border-slate-600 shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-20 sm:w-24 aspect-[2/3] mb-3">
                <BookCover
                  title={cat.sampleTitle}
                  author={cat.sampleAuthor}
                  category={cat.name}
                  className="w-full h-full rounded-xl"
                />
              </div>
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#E76F51] transition-colors line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. SECTION: CIRCULATION METRICS & ACTIVITY */}
      <div className="pt-2">
        <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">
          Circulation & Desk Overview
        </h2>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Catalog Titles"
            value={stats ? stats.totalBooks : 12}
            trendText="+12 this month"
            isPositive={true}
            icon={BookOpen}
            colorVariant="blue"
            onClick={() => onNavigate('books')}
          />
          <StatCard
            title="Registered Borrowers"
            value={stats ? stats.totalMembers : 6}
            trendText="+18 this semester"
            isPositive={true}
            icon={Users}
            colorVariant="green"
            onClick={() => onNavigate('members')}
          />
          <StatCard
            title="Active Book Loans"
            value={stats ? stats.issuedCopies : 8}
            trendText="+6 this week"
            isPositive={true}
            icon={Clock}
            colorVariant="amber"
            onClick={() => onNavigate('transactions', { status: 'ISSUED' })}
          />
          <StatCard
            title="Overdue Audit Alerts"
            value={stats ? stats.overdueCount : 2}
            trendText={`${stats ? `₹${stats.pendingFines} in fines` : 'Penalty active'}`}
            isPositive={false}
            icon={Bookmark}
            colorVariant="rose"
            onClick={() => onNavigate('transactions', { status: 'OVERDUE' })}
          />
        </div>

        {/* Main Lower Grid: Left 2/3 (Transactions & Trends) + Right 1/3 (Quick Actions & Categories) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Transactions Card */}
            <div className="bg-white dark:bg-[#16191F] rounded-3xl p-6 border border-[#ECE7DF] dark:border-[#272D38] shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1] dark:border-[#262C36]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#193B2D] dark:text-emerald-400" />
                  <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-white">Recent Circulation Desk Activity</h3>
                </div>
                <button
                  onClick={() => onNavigate('transactions')}
                  className="text-xs font-semibold text-[#193B2D] dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-bold text-[#71717A] dark:text-[#9CA3AF] border-b border-[#F0EAE1] dark:border-[#262C36]">
                      <th className="pb-3 font-semibold">Book ID</th>
                      <th className="pb-3 font-semibold">Title</th>
                      <th className="pb-3 font-semibold">Borrower</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4EFE6] dark:divide-[#242A35]">
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1E232B] transition-colors">
                        <td className="py-3 font-mono font-bold text-[#193B2D] dark:text-emerald-400">
                          {tx.book_id}
                        </td>
                        <td className="py-3 font-semibold text-[#1A1A1A] dark:text-white max-w-[200px] truncate">
                          {tx.book_title}
                        </td>
                        <td className="py-3 text-[#71717A] dark:text-[#9CA3AF]">
                          {tx.member_name}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'ISSUED'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}>
                            {tx.status === 'ISSUED' ? 'Issued' : 'Returned'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-[11px] text-[#71717A] dark:text-[#9CA3AF]">
                          {new Date(tx.return_timestamp || tx.issue_timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Library Usage Trend Bar Chart */}
            <div className="bg-white dark:bg-[#16191F] rounded-3xl p-6 border border-[#ECE7DF] dark:border-[#272D38] shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1] dark:border-[#262C36]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#E76F51]" />
                  <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-white">Library Circulation Trends</h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#193B2D] dark:bg-emerald-400"></span>
                    <span className="text-[#71717A] dark:text-[#9CA3AF]">Issued</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E76F51]"></span>
                    <span className="text-[#71717A] dark:text-[#9CA3AF]">Returned</span>
                  </div>
                </div>
              </div>

              {/* Visual Bar Chart */}
              <div className="pt-6 pb-2">
                <div className="flex items-end justify-between gap-3 h-40 px-2">
                  {usageTrend.map((item, idx) => {
                    const issuedHeight = Math.min(100, Math.round((item.issued / 100) * 100));
                    const returnedHeight = Math.min(100, Math.round((item.returned / 100) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full flex items-end justify-center gap-1.5 h-32">
                          {/* Issued Bar */}
                          <div
                            style={{ height: `${issuedHeight}%` }}
                            title={`Issued: ${item.issued}`}
                            className="w-3.5 sm:w-4 rounded-t-md bg-[#193B2D] dark:bg-emerald-500 hover:opacity-85 transition-all cursor-pointer group-hover:shadow-xs"
                          ></div>
                          {/* Returned Bar */}
                          <div
                            style={{ height: `${returnedHeight}%` }}
                            title={`Returned: ${item.returned}`}
                            className="w-3.5 sm:w-4 rounded-t-md bg-[#E76F51] hover:opacity-85 transition-all cursor-pointer group-hover:shadow-xs"
                          ></div>
                        </div>
                        <span className="text-[11px] font-bold text-[#71717A] dark:text-[#9CA3AF]">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-[#16191F] rounded-3xl p-6 border border-[#ECE7DF] dark:border-[#272D38] shadow-2xs">
              <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2">
                <span className="text-[#E76F51]">⚡</span>
                <span>Circulation Quick Actions</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={onOpenAddBook}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#F8F6F1] dark:bg-[#1E232B] hover:bg-[#F2ECE1] dark:hover:bg-[#252B35] border border-[#EBE4D8] dark:border-[#2A313E] transition-all group cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-[#193B2D] dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">Add Book</span>
                </button>

                <button
                  onClick={onOpenAddMember}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#F8F6F1] dark:bg-[#1E232B] hover:bg-[#F2ECE1] dark:hover:bg-[#252B35] border border-[#EBE4D8] dark:border-[#2A313E] transition-all group cursor-pointer"
                >
                  <UserPlus className="w-5 h-5 text-[#193B2D] dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">Register Member</span>
                </button>

                <button
                  onClick={onOpenScanner}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#221D1A] hover:bg-[#F4E9DC] dark:hover:bg-[#2B231F] border border-[#EBDDCF] dark:border-[#382E28] transition-all group cursor-pointer"
                >
                  <QrCode className="w-5 h-5 text-[#E76F51] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">Scan & Issue</span>
                </button>

                <button
                  onClick={onOpenScanner}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#221D1A] hover:bg-[#F4E9DC] dark:hover:bg-[#2B231F] border border-[#EBDDCF] dark:border-[#382E28] transition-all group cursor-pointer"
                >
                  <ArrowLeftRight className="w-5 h-5 text-[#E76F51] mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#1A1A1A] dark:text-white">Scan & Return</span>
                </button>
              </div>
            </div>

            {/* Popular Categories Progress Bars */}
            <div className="bg-white dark:bg-[#16191F] rounded-3xl p-6 border border-[#ECE7DF] dark:border-[#272D38] shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1] dark:border-[#262C36]">
                <h3 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-white">Popular Categories</h3>
                <button
                  onClick={() => onNavigate('books')}
                  className="text-xs font-semibold text-[#193B2D] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                {categories.map((cat, idx) => {
                  const total = stats ? stats.totalCopies : 50;
                  const count = cat.total_copies || cat.book_count * 4;
                  const pct = Math.min(100, Math.round((count / total) * 100));
                  
                  const dotColors = [
                    'bg-[#193B2D]',
                    'bg-[#E76F51]',
                    'bg-emerald-600',
                    'bg-amber-600',
                    'bg-indigo-600',
                    'bg-rose-600'
                  ];
                  const dotColor = dotColors[idx % dotColors.length];

                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                          <span className="font-semibold text-[#1A1A1A] dark:text-white">
                            {cat.category}
                          </span>
                        </div>
                        <span className="font-mono text-[#71717A] dark:text-[#9CA3AF] font-bold">
                          {count} copies
                        </span>
                      </div>
                      <div className="w-full bg-[#F4EFE6] dark:bg-[#252A35] h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(15, pct)}%` }}
                          className={`h-full rounded-full ${dotColor} transition-all duration-500`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Elegant Nordic AI Callout Card (No broken stock photos!) */}
            <div className="rounded-3xl border border-[#ECE7DF] dark:border-[#272D38] bg-[#FAF5EE] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white p-6 relative overflow-hidden shadow-2xs">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-[#E76F51]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">LibraBot AI Assistant</span>
                </div>
                <h4 className="font-serif font-bold text-base leading-snug">
                  Research queries & catalog insights.
                </h4>
                <p className="text-xs text-[#71717A] dark:text-[#9CA3AF] mt-1.5 leading-relaxed">
                  Query real-time shelf placement, loan policies, and curriculum reading suggestions with Gemini.
                </p>
                <button
                  onClick={onOpenAI}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#193B2D] hover:bg-[#122B21] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open AI Assistant →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
