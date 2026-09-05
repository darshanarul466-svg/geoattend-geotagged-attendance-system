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
  Moon,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import StatCard from '../components/StatCard';

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
  onOpenAI
}) {
  // Determine greeting based on current hour
  const hour = new Date().getHours();
  let greeting = 'Good morning, Darshan 👋';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon, Darshan 👋';
  else if (hour >= 17) greeting = 'Good evening, Darshan 👋';

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here’s what’s happening in your library today.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-xs italic text-slate-500 dark:text-slate-400 font-serif">
            “Today a reader, tomorrow a leader.”
          </p>
          <span className="text-[10px] text-blue-500 font-medium">SRMIST Central Library</span>
        </div>
      </div>

      {/* 4 Stat Cards Row (Matching Preview Aesthetics) */}
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Transactions</h3>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-3 font-medium">Book ID</th>
                    <th className="pb-3 font-medium">Book Title</th>
                    <th className="pb-3 font-medium">Member</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {tx.book_id}
                      </td>
                      <td className="py-3 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                        {tx.book_title}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {tx.member_name}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'ISSUED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
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

          {/* Library Usage Trend (Bar Chart Preview) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Library Usage Trend</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-500">Books Issued</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-500">Books Returned</span>
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
                          className="w-3 sm:w-4 rounded-t-md bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer group-hover:shadow-sm"
                        ></div>
                        {/* Returned Bar */}
                        <div
                          style={{ height: `${returnedHeight}%` }}
                          title={`Returned: ${item.returned}`}
                          className="w-3 sm:w-4 rounded-t-md bg-indigo-400 hover:bg-indigo-500 transition-all cursor-pointer group-hover:shadow-sm"
                        ></div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recently Added Books */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recently Added Books</h3>
              </div>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {recentlyAddedBooks.map((b) => (
                <div
                  key={b.book_id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-400 transition-all"
                >
                  <img
                    src={b.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'}
                    alt={b.title}
                    className="w-12 h-16 object-cover rounded-lg shadow-sm shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {b.title}
                    </h4>
                    <p className="text-slate-500 truncate text-[11px] mt-0.5">
                      {b.author}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                        {b.book_id}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
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
          {/* Quick Actions Panel (from Preview) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-blue-500 font-bold">⚡</span>
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenAddBook}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 border border-blue-100 dark:border-slate-700 transition-all group"
              >
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Book</span>
              </button>

              <button
                onClick={onOpenAddMember}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-100 dark:border-slate-700 transition-all group"
              >
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Register Member</span>
              </button>

              <button
                onClick={onOpenScanner}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 border border-indigo-100 dark:border-slate-700 transition-all group"
              >
                <QrCode className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scan & Issue</span>
              </button>

              <button
                onClick={onOpenScanner}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-100 dark:border-slate-700 transition-all group"
              >
                <ArrowLeftRight className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scan & Return</span>
              </button>
            </div>
          </div>

          {/* Popular Categories Progress Bars */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Popular Categories</h3>
              <button
                onClick={() => onNavigate('books')}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                View All →
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {categories.map((cat, idx) => {
                const total = stats ? stats.totalCopies : 50;
                const pct = Math.min(100, Math.round(((cat.total_copies || cat.book_count * 4) / total) * 100));
                
                const dotColors = [
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-rose-500',
                  'bg-cyan-500'
                ];
                const dotColor = dotColors[idx % dotColors.length];

                return (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cat.category}
                        </span>
                      </div>
                      <span className="font-mono text-slate-400 font-medium">
                        {cat.total_copies || cat.book_count * 4} copies
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

          {/* Callout Card (from Preview: "More than books, a better tomorrow") */}
          <div className="relative rounded-3xl p-6 bg-gradient-to-br from-[#091122] via-[#0e1b38] to-[#172554] text-white shadow-xl overflow-hidden border border-blue-900/50">
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-3">
                <Moon className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-base leading-snug">
                More than books, a better tomorrow.
              </h4>
              <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
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
            {/* Ambient background decoration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
