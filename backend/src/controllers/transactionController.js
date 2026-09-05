const { getDatabase } = require('../config/database');

const FINE_PER_DAY = 5.0; // ₹5 per day overdue
const DEFAULT_LOAN_DAYS = 14;

/**
 * Verify a scanned QR payload or Book ID
 */
exports.verifyScannedBook = (req, res, next) => {
  try {
    const db = getDatabase();
    let { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'No QR code data provided.'
      });
    }

    let parsedBookId = qrCode.trim();

    // Try parsing as JSON payload if encoded that way
    try {
      if (parsedBookId.startsWith('{') && parsedBookId.endsWith('}')) {
        const json = JSON.parse(parsedBookId);
        parsedBookId = json.bookId || json.isbn || json.id || parsedBookId;
      }
    } catch (e) {
      // Keep as string
    }

    const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(parsedBookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Scanned code '${parsedBookId}' does not match any book in the library catalog.`
      });
    }

    // Fetch active checkouts for return resolution
    const activeCheckouts = db.prepare(`
      SELECT t.id as transaction_id, t.issue_timestamp, t.due_date,
             b.id as borrower_id, b.student_id, b.name as borrower_name, b.email, b.department
      FROM transactions t
      JOIN borrowers b ON t.borrower_id = b.id
      WHERE t.book_id = ? AND t.status = 'ISSUED'
      ORDER BY t.due_date ASC
    `).all(book.book_id);

    // Calculate overdue info for any active checkout
    const now = new Date();
    const enrichedCheckouts = activeCheckouts.map(tx => {
      const due = new Date(tx.due_date);
      const isOverdue = now > due;
      const daysOverdue = isOverdue ? Math.ceil((now - due) / (1000 * 60 * 60 * 24)) : 0;
      const estimatedFine = daysOverdue * FINE_PER_DAY;
      return {
        ...tx,
        isOverdue,
        daysOverdue,
        estimatedFine
      };
    });

    res.json({
      success: true,
      book,
      hasAvailableCopies: book.available_copies > 0,
      activeCheckouts: enrichedCheckouts,
      suggestedAction: book.available_copies > 0 ? 'ISSUE' : (enrichedCheckouts.length > 0 ? 'RETURN' : 'UNAVAILABLE')
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Issue a book to a borrower
 */
exports.issueBook = (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      bookId,
      studentId,
      name,
      email,
      phone = '',
      department = 'Computer Science & Engineering',
      loanDays = DEFAULT_LOAN_DAYS,
      notes = ''
    } = req.body;

    if (!bookId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and Student ID are required to issue a book.'
      });
    }

    // 1. Verify Book Exists
    const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book '${bookId}' not found in catalog.`
      });
    }

    // 2. Verify Availability
    if (book.available_copies <= 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot issue '${book.title}'. All ${book.total_copies} copies are currently checked out.`
      });
    }

    // 3. Find or create borrower
    let borrower = db.prepare('SELECT * FROM borrowers WHERE student_id = ?').get(studentId.trim());
    if (!borrower) {
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: `Student ID '${studentId}' is not yet registered. Name and Email are required for first-time registration.`
        });
      }
      db.prepare(`
        INSERT INTO borrowers (student_id, name, email, phone, department)
        VALUES (?, ?, ?, ?, ?)
      `).run(studentId.trim(), name.trim(), email.trim(), phone.trim(), department.trim());
      borrower = db.prepare('SELECT * FROM borrowers WHERE student_id = ?').get(studentId.trim());
    }

    // 4. Prevent duplicate checkouts: Check if borrower currently holds an active copy of this book
    const existingActive = db.prepare(`
      SELECT id FROM transactions
      WHERE book_id = ? AND borrower_id = ? AND status = 'ISSUED'
    `).get(book.book_id, borrower.id);

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `Member ${borrower.name} (${borrower.student_id}) already has an active copy of '${book.title}' on loan.`
      });
    }

    // 5. Execute atomic issue
    const days = parseInt(loanDays, 10) || DEFAULT_LOAN_DAYS;
    const now = new Date();
    const dueDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Decrement stock
    const updateResult = db.prepare(`
      UPDATE books
      SET available_copies = available_copies - 1
      WHERE book_id = ? AND available_copies > 0
    `).run(book.book_id);

    if (updateResult.changes === 0) {
      return res.status(409).json({
        success: false,
        message: 'Could not reserve book copy. It may have just been issued to another borrower.'
      });
    }

    // Insert transaction
    const insertTx = db.prepare(`
      INSERT INTO transactions (book_id, borrower_id, issue_timestamp, due_date, status, fine_amount, notes)
      VALUES (?, ?, ?, ?, 'ISSUED', 0.0, ?)
    `);

    const txResult = insertTx.run(
      book.book_id,
      borrower.id,
      now.toISOString(),
      dueDate.toISOString(),
      notes.trim()
    );

    const transaction = db.prepare(`
      SELECT t.*, b.title as book_title, b.author as book_author,
             m.name as borrower_name, m.student_id, m.email as borrower_email
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      JOIN borrowers m ON t.borrower_id = m.id
      WHERE t.id = ?
    `).get(txResult.lastInsertRowid);

    const updatedBook = db.prepare('SELECT * FROM books WHERE book_id = ?').get(book.book_id);

    res.status(201).json({
      success: true,
      message: `Successfully issued '${book.title}' to ${borrower.name}.`,
      transaction,
      book: updatedBook
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return an issued book
 */
exports.returnBook = (req, res, next) => {
  try {
    const db = getDatabase();
    const { transactionId, bookId, studentId, notes = '' } = req.body;

    let transaction;

    if (transactionId) {
      transaction = db.prepare(`
        SELECT t.*, b.title as book_title, b.author as book_author,
               m.name as borrower_name, m.student_id, m.email
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN borrowers m ON t.borrower_id = m.id
        WHERE t.id = ? AND t.status = 'ISSUED'
      `).get(transactionId);
    } else if (bookId && studentId) {
      transaction = db.prepare(`
        SELECT t.*, b.title as book_title, b.author as book_author,
               m.name as borrower_name, m.student_id, m.email
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN borrowers m ON t.borrower_id = m.id
        WHERE t.book_id = ? AND m.student_id = ? AND t.status = 'ISSUED'
        ORDER BY t.issue_timestamp ASC
      `).get(bookId.trim(), studentId.trim());
    } else if (bookId) {
      // If only bookId provided, find the single active transaction or return 400 if multiple
      const active = db.prepare(`
        SELECT t.*, b.title as book_title, b.author as book_author,
               m.name as borrower_name, m.student_id, m.email
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN borrowers m ON t.borrower_id = m.id
        WHERE t.book_id = ? AND t.status = 'ISSUED'
      `).all(bookId.trim());

      if (active.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No active issue records found for book '${bookId}'. It is already on shelf.`
        });
      } else if (active.length === 1) {
        transaction = active[0];
      } else {
        return res.status(400).json({
          success: false,
          multipleLoans: true,
          message: `Multiple copies of '${bookId}' are checked out. Please specify which member is returning.`,
          loans: active
        });
      }
    }

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'No matching active issue transaction found to process return.'
      });
    }

    // Overdue fine calculation
    const now = new Date();
    const due = new Date(transaction.due_date);
    let daysOverdue = 0;
    let fineAmount = 0.0;

    if (now > due) {
      daysOverdue = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      fineAmount = parseFloat((daysOverdue * FINE_PER_DAY).toFixed(2));
    }

    // Atomic update: increment available_copies, mark transaction RETURNED
    db.prepare(`
      UPDATE books
      SET available_copies = MIN(total_copies, available_copies + 1)
      WHERE book_id = ?
    `).run(transaction.book_id);

    db.prepare(`
      UPDATE transactions
      SET status = 'RETURNED',
          return_timestamp = ?,
          fine_amount = ?,
          notes = CASE WHEN ? != '' THEN ? ELSE notes END
      WHERE id = ?
    `).run(
      now.toISOString(),
      fineAmount,
      notes.trim(),
      notes.trim(),
      transaction.id
    );

    const completedTx = db.prepare(`
      SELECT t.*, b.title as book_title, b.author as book_author,
             m.name as borrower_name, m.student_id, m.email as borrower_email
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      JOIN borrowers m ON t.borrower_id = m.id
      WHERE t.id = ?
    `).get(transaction.id);

    const updatedBook = db.prepare('SELECT * FROM books WHERE book_id = ?').get(transaction.book_id);

    res.json({
      success: true,
      message: `Successfully processed return for '${transaction.book_title}' from ${transaction.borrower_name}.`,
      transaction: completedTx,
      daysOverdue,
      fineAmount,
      book: updatedBook
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions with search, status filters, and pagination
 */
exports.getTransactions = (req, res, next) => {
  try {
    const db = getDatabase();
    const { status = 'all', search = '', limit = 100 } = req.query;

    let query = `
      SELECT t.*, 
             b.title as book_title, b.author as book_author, b.category as book_category, b.cover_url,
             m.name as borrower_name, m.student_id, m.email as borrower_email, m.department
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      JOIN borrowers m ON t.borrower_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (status === 'ISSUED' || status === 'RETURNED') {
      query += ' AND t.status = ?';
      params.push(status);
    } else if (status === 'OVERDUE') {
      query += " AND t.status = 'ISSUED' AND t.due_date < CURRENT_TIMESTAMP";
    }

    if (search.trim()) {
      query += ` AND (b.title LIKE ? OR b.book_id LIKE ? OR m.name LIKE ? OR m.student_id LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY t.issue_timestamp DESC LIMIT ?';
    params.push(parseInt(limit, 10) || 100);

    const transactions = db.prepare(query).all(...params);

    // Compute live days overdue
    const now = new Date();
    const enriched = transactions.map(t => {
      const due = new Date(t.due_date);
      const isOverdue = t.status === 'ISSUED' && now > due;
      const daysOverdue = isOverdue ? Math.ceil((now - due) / (1000 * 60 * 60 * 24)) : 0;
      return {
        ...t,
        isOverdue,
        daysOverdue
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      transactions: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active loans (Currently Issued)
 */
exports.getActiveLoans = (req, res, next) => {
  try {
    const db = getDatabase();

    const loans = db.prepare(`
      SELECT t.*, 
             b.title as book_title, b.author as book_author, b.category, b.shelf_location,
             m.name as borrower_name, m.student_id, m.email, m.phone, m.department
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      JOIN borrowers m ON t.borrower_id = m.id
      WHERE t.status = 'ISSUED'
      ORDER BY t.due_date ASC
    `).all();

    const now = new Date();
    const enriched = loans.map(item => {
      const due = new Date(item.due_date);
      const isOverdue = now > due;
      const daysOverdue = isOverdue ? Math.ceil((now - due) / (1000 * 60 * 60 * 24)) : 0;
      const daysRemaining = !isOverdue ? Math.ceil((due - now) / (1000 * 60 * 60 * 24)) : 0;
      const fine = daysOverdue * FINE_PER_DAY;

      return {
        ...item,
        isOverdue,
        daysOverdue,
        daysRemaining,
        fine
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      activeLoans: enriched
    });
  } catch (error) {
    next(error);
  }
};
