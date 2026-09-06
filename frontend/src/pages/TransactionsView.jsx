import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

const FINE_PER_DAY = 5.0;

export default function TransactionsView({ 
  transactions = [], 
  onRefresh, 
  onTriggerReturn,
  initialStatus = 'all'
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const filteredTransactions = transactions.filter(t => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      t.book_title.toLowerCase().includes(q) ||
      t.book_id.toLowerCase().includes(q) ||
      t.borrower_name.toLowerCase().includes(q) ||
      t.student_id.toLowerCase().includes(q);

    let matchStatus = true;
    if (statusFilter === 'ISSUED') {
      matchStatus = t.status === 'ISSUED';
    } else if (statusFilter === 'RETURNED') {
      matchStatus = t.status === 'RETURNED';
    } else if (statusFilter === 'OVERDUE') {
      matchStatus = t.status === 'ISSUED' && t.isOverdue;
    }

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Circulation & Audit History
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Complete transaction history, live overdue tracking, and audit exports.
          </p>
        </div>

        {/* Data Export Buttons */}
        <div className="flex items-center gap-2.5">
          <a
            href={api.exportCSVUrl}
            download
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#272D37] bg-white dark:bg-[#16191F] hover:bg-slate-50 dark:hover:bg-[#1E232B] text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-forest-700 dark:text-emerald-400" />
            <span>Export CSV</span>
          </a>

          <a
            href={api.exportExcelUrl}
            download
            className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-md shadow-forest-900/20 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-[#16191F] rounded-3xl border border-slate-200 dark:border-[#272D37] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by book title, ID, or student name/reg..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1E232B] border border-slate-200 dark:border-[#272D37] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-forest-700 font-medium"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E232B] p-1 rounded-xl text-xs shrink-0 w-full md:w-auto font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-[#16191F] text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setStatusFilter('ISSUED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'ISSUED'
                ? 'bg-white dark:bg-[#16191F] text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Currently Issued
          </button>
          <button
            onClick={() => setStatusFilter('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'OVERDUE'
                ? 'bg-white dark:bg-[#16191F] text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setStatusFilter('RETURNED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'RETURNED'
                ? 'bg-white dark:bg-[#16191F] text-forest-700 dark:text-emerald-400 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Returned
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#16191F] rounded-3xl border border-slate-200 dark:border-[#272D37] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-[#1E232B]/60 text-[11px] font-semibold text-slate-400 border-b border-slate-200 dark:border-[#272D37]">
                <th className="p-4">Book Details</th>
                <th className="p-4">Issued To</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Return Date</th>
                <th className="p-4">Status & Overdue</th>
                <th className="p-4">Fine (INR)</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#272D37]">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-[#1E232B]/40 transition-colors">
                  {/* Book Details */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-forest-700 dark:text-emerald-400 bg-forest-50 dark:bg-forest-950/60 px-1.5 py-0.5 rounded text-[10px]">
                        {tx.book_id}
                      </span>
                      <div className="min-w-0 max-w-[220px]">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{tx.book_title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{tx.book_author}</p>
                      </div>
                    </div>
                  </td>

                  {/* Issued To */}
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{tx.borrower_name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{tx.student_id}</p>
                    </div>
                  </td>

                  {/* Issue Date */}
                  <td className="p-4 font-mono text-slate-500">
                    {new Date(tx.issue_timestamp).toLocaleDateString()}
                  </td>

                  {/* Due Date */}
                  <td className="p-4 font-mono text-slate-500">
                    {new Date(tx.due_date).toLocaleDateString()}
                  </td>

                  {/* Return Date */}
                  <td className="p-4 font-mono text-slate-500">
                    {tx.return_timestamp ? new Date(tx.return_timestamp).toLocaleDateString() : '—'}
                  </td>

                  {/* Status & Overdue Badge */}
                  <td className="p-4">
                    {tx.status === 'ISSUED' ? (
                      tx.isOverdue ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{tx.daysOverdue} Days Overdue</span>
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          <Clock className="w-3 h-3" />
                          <span>Active Loan</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#1E232B] text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Returned</span>
                      </span>
                    )}
                  </td>

                  {/* Fine Amount */}
                  <td className="p-4 font-mono font-semibold">
                    {tx.status === 'RETURNED' ? (
                      tx.fine_amount > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">₹{tx.fine_amount.toFixed(2)} (Paid)</span>
                      ) : (
                        <span className="text-slate-400">₹0.00</span>
                      )
                    ) : tx.isOverdue ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        ₹{(tx.daysOverdue * FINE_PER_DAY).toFixed(2)} (est)
                      </span>
                    ) : (
                      <span className="text-slate-400">₹0.00</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="p-4 text-right">
                    {tx.status === 'ISSUED' && (
                      <button
                        onClick={() => onTriggerReturn({
                          book_id: tx.book_id,
                          title: tx.book_title,
                          author: tx.book_author
                        }, tx)}
                        className="px-3 py-1 rounded-lg bg-terracotta-500/10 hover:bg-terracotta-500/20 text-terracotta-500 font-bold text-[11px] transition-colors border border-terracotta-500/30 inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Process Return</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-xs">
            No transactions found matching criteria.
          </div>
        )}
      </div>
    </div>
  );
}
