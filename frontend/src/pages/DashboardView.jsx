import React from 'react';
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
  Sparkles
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
  const firstName = currentUser && currentUser.name 
    ? currentUser.name.split(' ')[0] 
    : 'Librarian';

  // Determine greeting based on current hour
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17) timeOfDay = 'evening';

  const greeting = `Good ${timeOfDay}, ${firstName} 👋`;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Here’s what’s happening in your library today.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs italic text-slate-500 dark:text-slate-400 font-serif">
            “Today a reader, tomorrow a leader.”
          </p>
          <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">SRMIST Central Library</span>
        </div>
      </div>

      {/* 4 Stat Cards Row (Solid Surfaces with Crisp Pastel Tints) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Books"
          value={stats ? stats.totalBooks : 12}
          trendText="+12 this month"
          isPositive={true}
          icon={BookOpen}
          colorVariant="blue"
          onClick={() => onNavigate('books')}
        />
        <StatCard
          title="Registered Members"
          value={stats ? stats.totalMembers : 6}
          trendText="+18 this month"
          isPositive={true}
          icon={Users}
          colorVariant="green"
          onClick={() => onNavigate('members')}
        />
        <StatCard
          title="Currently Issued"
          value={stats ? stats.issuedCopies : 8}
          trendText="+6 from last week"
          isPositive={true}
          icon={Clock}
          colorVariant="amber"
          onClick={() => onNavigate('transactions', { status: 'ISSUED' })}
        />
        <StatCard
          title="Overdue Books"
          value={stats ? stats.overdueCount : 2}
          trendText={`${stats ? `₹${stats.pendingFines} in fines` : 'Fines active'}`}
          isPositive={false}
          icon={Bookmark}
          colorVariant="rose"
          onClick={() => onNavigate('transactions', { status: 'OVERDUE' })}
        />
      </div>

      {/* Main Grid: Left 2/3 (Transactions & Trends) + Right 1/3 (Actions & Categories) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transactions Card */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Transactions</h3>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 font-semibold">Book ID</th>
                    <th className="pb-3 font-semibold">Book Title</th>
                    <th className="pb-3 font-semibold">Member</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {tx.book_id}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                        {tx.book_title}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {tx.member_name}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'ISSUED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                        }`}>
                          {tx.status === 'ISSUED' ? 'Issued' : 'Returned'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-[11px] text-slate-400">
                        {new Date(tx.return_timestamp || tx.issue_timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Library Usage Trend Bar Chart */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Library Usage Trend</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-500 dark:text-slate-400">Books Issued</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                  <span className="text-slate-500 dark:text-slate-400">Books Returned</span>
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
                          className="w-3.5 sm:w-4 rounded-t-md bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer group-hover:shadow-sm"
                        ></div>
                        {/* Returned Bar */}
                        <div
                          style={{ height: `${returnedHeight}%` }}
                          title={`Returned: ${item.returned}`}
                          className="w-3.5 sm:w-4 rounded-t-md bg-indigo-400 hover:bg-indigo-500 transition-all cursor-pointer group-hover:shadow-sm"
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recently Added Books (Guaranteed 100% rendering with BookCover) */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recently Added Books</h3>
              </div>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {recentlyAddedBooks.map((b) => (
                <div
                  key={b.book_id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 dark:bg-[#121A2D] border border-slate-200 dark:border-slate-750 hover:border-blue-500 transition-all"
                >
                  <BookCover
                    coverUrl={b.cover_url}
                    title={b.title}
                    author={b.author}
                    category={b.category}
                    bookId={b.book_id}
                    className="w-13 h-18"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {b.title}
                    </h4>
                    <p className="text-slate-500 truncate text-[11px] mt-0.5">
                      {b.author}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                        {b.book_id}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {b.available_copies} available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-blue-500 font-bold">⚡</span>
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenAddBook}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-blue-50 dark:bg-[#131E3D] hover:bg-blue-100 dark:hover:bg-[#192750] border border-blue-100 dark:border-blue-900/50 transition-all group"
              >
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Book</span>
              </button>

              <button
                onClick={onOpenAddMember}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 dark:bg-[#0F2420] hover:bg-emerald-100 dark:hover:bg-[#15332E] border border-emerald-100 dark:border-emerald-900/50 transition-all group"
              >
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Register Member</span>
              </button>

              <button
                onClick={onOpenScanner}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-50 dark:bg-[#1C1838] hover:bg-indigo-100 dark:hover:bg-[#25204C] border border-indigo-100 dark:border-indigo-900/50 transition-all group"
              >
                <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scan & Issue</span>
              </button>

              <button
                onClick={onOpenScanner}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-50 dark:bg-[#281D10] hover:bg-amber-100 dark:hover:bg-[#382815] border border-amber-100 dark:border-amber-900/50 transition-all group"
              >
                <ArrowLeftRight className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scan & Return</span>
              </button>
            </div>
          </div>

          {/* Popular Categories Progress Bars */}
          <div className="bg-white dark:bg-[#0E1626] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Popular Categories</h3>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
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
                  'bg-blue-500',
                  'bg-indigo-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-rose-500',
                  'bg-cyan-500'
                ];
                const dotColor = dotColors[idx % dotColors.length];

                return (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {cat.category}
                        </span>
                      </div>
                      <span className="font-mono text-slate-400 font-bold">
                        {count} copies
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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

          {/* Ambient Callout Card with Night Library Art */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-[#090F24] text-white p-6">
            <img
              src="/ambient-night-library.jpg"
              alt="Night Library Ambient"
              className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none filter brightness-90"
            />
            <div className="relative z-10">
              <h4 className="font-extrabold text-base leading-snug">
                More than books, a better tomorrow.
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Connect with LibraBot to explore research papers, cross-disciplinary reading, and catalog insights.
              </p>
              <button
                onClick={onOpenAI}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/30 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Talk to LibraBot →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
