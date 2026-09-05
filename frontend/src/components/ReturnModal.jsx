import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ArrowDownLeft, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

const FINE_PER_DAY = 5.0;

export default function ReturnModal({ 
  isOpen, 
  onClose, 
  book, 
  preSelectedLoan, 
  onSuccess 
}) {
  const [selectedTransactionId, setSelectedTransactionId] = useState(
    preSelectedLoan ? preSelectedLoan.transaction_id || preSelectedLoan.id : ''
  );
  const [conditionNotes, setConditionNotes] = useState('Returned in good condition');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !book) return null;

  // Active checkouts for this book
  const activeLoans = book.activeCheckouts || (preSelectedLoan ? [preSelectedLoan] : []);

  // Selected loan details
  const activeLoan = activeLoans.find(
    l => (l.transaction_id || l.id) == selectedTransactionId
  ) || activeLoans[0];

  // Live overdue calculation
  const now = new Date();
  let isOverdue = false;
  let daysOverdue = 0;
  let fineAmount = 0.0;

  if (activeLoan && activeLoan.due_date) {
    const due = new Date(activeLoan.due_date);
    if (now > due) {
      isOverdue = true;
      daysOverdue = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * FINE_PER_DAY;
    }
  }

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        bookId: book.book_id,
        transactionId: activeLoan ? (activeLoan.transaction_id || activeLoan.id) : undefined,
        notes: conditionNotes
      };

      const res = await api.returnBook(payload);
      onSuccess(res.message);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process return.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Process Book Return</h3>
              <p className="text-[11px] text-slate-500">Restore inventory & calculate overdue fines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReturnSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Book Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[10px]">
              {book.book_id}
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 line-clamp-1">{book.title}</h4>
            <p className="text-slate-500 text-[11px]">by {book.author}</p>
          </div>

          {/* Borrower Selector (if multiple copies loaned) */}
          {activeLoans.length > 1 && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Member Returning:
              </label>
              <select
                value={selectedTransactionId}
                onChange={(e) => setSelectedTransactionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {activeLoans.map(loan => (
                  <option key={loan.transaction_id || loan.id} value={loan.transaction_id || loan.id}>
                    {loan.borrower_name || loan.name} ({loan.student_id}) — Due: {new Date(loan.due_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Loan Details & Fine Calculation */}
          {activeLoan && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {activeLoan.borrower_name || activeLoan.name} ({activeLoan.student_id})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Loan Due Date:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {new Date(activeLoan.due_date).toLocaleDateString()}
                </span>
              </div>

              {/* Overdue Badge & Fine Calculator (Brownie Subtask ⭐) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                {isOverdue ? (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Overdue by {daysOverdue} Days!</p>
                      <p className="text-[11px] mt-0.5">
                        Penalty Rate: ₹{FINE_PER_DAY.toFixed(2)}/day
                      </p>
                      <p className="text-xs font-black text-rose-700 dark:text-rose-400 mt-1">
                        Total Fine Due: ₹{fineAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Returned on time! No overdue fine applicable.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Condition Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Return Condition / Notes
            </label>
            <input
              type="text"
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="e.g. Good condition, fine paid"
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
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
              disabled={submitting || !activeLoan}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              {submitting ? 'Processing Return...' : (isOverdue ? `Confirm Return (Collect ₹${fineAmount.toFixed(2)})` : 'Confirm Return')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
