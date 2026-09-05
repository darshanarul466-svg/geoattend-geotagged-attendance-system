const { getDatabase } = require('../config/database');

const FINE_PER_DAY = 5.0;

exports.getDashboardStats = (req, res, next) => {
  try {
    const db = getDatabase();

    // 1. Inventory counts
    const bookTotals = db.prepare(`
      SELECT 
        COUNT(id) as total_titles,
        COALESCE(SUM(total_copies), 0) as total_copies,
        COALESCE(SUM(available_copies), 0) as available_copies
      FROM books
    `).get();

    const totalTitles = bookTotals.total_titles || 0;
    const totalCopies = bookTotals.total_copies || 0;
    const availableCopies = bookTotals.available_copies || 0;
    const issuedCopies = Math.max(0, totalCopies - availableCopies);

    // 2. Member counts
    const memberRow = db.prepare('SELECT COUNT(id) as count FROM borrowers').get();
    const totalMembers = memberRow ? memberRow.count : 0;

    // 3. Overdue active loans & fines
    const activeLoans = db.prepare(`
      SELECT t.id, t.due_date, t.fine_amount, b.title, m.name as borrower_name, m.student_id, m.email
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      JOIN borrowers m ON t.borrower_id = m.id
      WHERE t.status = 'ISSUED'
    `).all();

    const now = new Date();
    let overdueCount = 0;
    let pendingFines = 0.0;
    const overdueList = [];

    for (const loan of activeLoans) {
      const due = new Date(loan.due_date);
      if (now > due) {
        overdueCount++;
        const days = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
        const fine = days * FINE_PER_DAY;
        pendingFines += fine;
        overdueList.push({
          ...loan,
          daysOverdue: days,
          fine
        });
      }
    }

    // 4. Fines already collected
    const collectedFinesRow = db.prepare("SELECT COALESCE(SUM(fine_amount), 0) as total FROM transactions WHERE status = 'RETURNED'").get();
    const finesCollected = collectedFinesRow ? collectedFinesRow.total : 0;

    // 5. Popular Categories distribution
    const categories = db.prepare(`
      SELECT category, COUNT(id) as book_count, SUM(total_copies) as total_copies
      FROM books
      GROUP BY category
      ORDER BY book_count DESC
      LIMIT 6
    `).all();

    // 6. Recent transactions
    const recentTransactions = db.prepare(`
      SELECT t.id, t.book_id, b.title as book_title, m.name as member_name, 
             t.status, t.issue_timestamp, t.return_timestamp, t.due_date
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      JOIN borrowers m ON t.borrower_id = m.id
      ORDER BY COALESCE(t.return_timestamp, t.issue_timestamp) DESC
      LIMIT 7
    `).all();

    // 7. Recently added books
    const recentlyAddedBooks = db.prepare(`
      SELECT book_id, title, author, category, cover_url, available_copies, total_copies
      FROM books
      ORDER BY created_at DESC
      LIMIT 4
    `).all();

    // 8. Monthly usage trend (Sample aggregated trend)
    const usageTrend = [
      { month: 'Mar', issued: 42, returned: 35 },
      { month: 'Apr', issued: 56, returned: 48 },
      { month: 'May', issued: 68, returned: 54 },
      { month: 'Jun', issued: 45, returned: 40 },
      { month: 'Jul', issued: 72, returned: 63 },
      { month: 'Aug', issued: 88, returned: 79 },
      { month: 'Sep', issued: 96, returned: 84 }
    ];

    res.json({
      success: true,
      stats: {
        totalBooks: totalTitles,
        totalCopies,
        availableCopies,
        issuedCopies,
        totalMembers,
        overdueCount,
        pendingFines,
        finesCollected
      },
      categories,
      recentTransactions,
      recentlyAddedBooks,
      overdueList,
      usageTrend
    });
  } catch (error) {
    next(error);
  }
};
