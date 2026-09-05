const XLSX = require('xlsx');
const { getDatabase } = require('../config/database');

const FINE_PER_DAY = 5.0;

function fetchTransactions() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT 
      b.title as book_title,
      b.author as book_author,
      t.book_id,
      m.name as issued_to_name,
      m.student_id as issued_to_id,
      m.email as issued_to_email,
      t.issue_timestamp,
      t.due_date,
      t.return_timestamp,
      t.status,
      t.fine_amount,
      t.notes
    FROM transactions t
    JOIN books b ON t.book_id = b.book_id
    JOIN borrowers m ON t.borrower_id = m.id
    ORDER BY t.issue_timestamp DESC
  `).all();

  const now = new Date();
  return rows.map(r => {
    const due = new Date(r.due_date);
    const isOverdue = r.status === 'ISSUED' && now > due;
    const daysOverdue = isOverdue ? Math.ceil((now - due) / (1000 * 60 * 60 * 24)) : 0;
    return {
      'Book Title': r.book_title,
      'Author': r.book_author,
      'Book ID': r.book_id,
      'Issued To': `${r.issued_to_name} (${r.issued_to_id})`,
      'Borrower Email': r.issued_to_email,
      'Issue Timestamp': r.issue_timestamp ? new Date(r.issue_timestamp).toLocaleString() : 'N/A',
      'Due Date': r.due_date ? new Date(r.due_date).toLocaleDateString() : 'N/A',
      'Return Timestamp': r.return_timestamp ? new Date(r.return_timestamp).toLocaleString() : 'Not Returned',
      'Current Status': r.status,
      'Days Overdue': daysOverdue > 0 ? `${daysOverdue} Days` : 'None',
      'Fine (INR)': r.status === 'RETURNED' ? `₹${r.fine_amount.toFixed(2)}` : (daysOverdue > 0 ? `₹${(daysOverdue * FINE_PER_DAY).toFixed(2)} (est)` : '₹0.00'),
      'Notes': r.notes || ''
    };
  });
}

/**
 * Export complete history as CSV
 */
exports.exportCSV = (req, res, next) => {
  try {
    const data = fetchTransactions();

    if (data.length === 0) {
      return res.status(404).send('No transaction data found to export.');
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

    for (const row of data) {
      const values = headers.map(h => {
        const val = row[h] !== null && row[h] !== undefined ? String(row[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `library-issue-return-history-${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * Export complete audit report as Excel (.xlsx) with multiple sheets
 */
exports.exportExcel = (req, res, next) => {
  try {
    const db = getDatabase();
    const transactions = fetchTransactions();

    // Sheet 1: Transactions
    const wsTransactions = XLSX.utils.json_to_sheet(transactions);

    // Sheet 2: Books Inventory
    const books = db.prepare(`
      SELECT book_id as 'Book ID', title as 'Title', author as 'Author', category as 'Category',
             total_copies as 'Total Copies', available_copies as 'Available Copies',
             (total_copies - available_copies) as 'Issued Copies', shelf_location as 'Shelf Location'
      FROM books
      ORDER BY category, title
    `).all();
    const wsBooks = XLSX.utils.json_to_sheet(books);

    // Sheet 3: Registered Borrowers
    const borrowers = db.prepare(`
      SELECT student_id as 'Student ID', name as 'Name', email as 'Email', phone as 'Phone', department as 'Department',
             created_at as 'Registered Date'
      FROM borrowers
      ORDER BY name
    `).all();
    const wsBorrowers = XLSX.utils.json_to_sheet(borrowers);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Issue-Return History');
    XLSX.utils.book_append_sheet(wb, wsBooks, 'Book Inventory');
    XLSX.utils.book_append_sheet(wb, wsBorrowers, 'Registered Members');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `library-audit-report-${dateStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};
