const QRCode = require('qrcode');
const { getDatabase } = require('../config/database');

/**
 * Get all books with search and filter
 */
exports.getBooks = (req, res, next) => {
  try {
    const db = getDatabase();
    const { search = '', category = '', status = 'all' } = req.query;

    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (search.trim()) {
      query += ' AND (title LIKE ? OR author LIKE ? OR book_id LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status === 'available') {
      query += ' AND available_copies > 0';
    } else if (status === 'issued') {
      query += ' AND available_copies < total_copies';
    } else if (status === 'unavailable') {
      query += ' AND available_copies = 0';
    }

    query += ' ORDER BY created_at DESC';

    const books = db.prepare(query).all(...params);

    // Get list of distinct categories for quick filtering in UI
    const categories = db.prepare('SELECT DISTINCT category FROM books ORDER BY category ASC').all().map(r => r.category);

    res.json({
      success: true,
      count: books.length,
      categories,
      books
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single book with active checkouts
 */
exports.getBookById = (req, res, next) => {
  try {
    const db = getDatabase();
    const { bookId } = req.params;

    const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(bookId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID '${bookId}' not found.`
      });
    }

    // Fetch active borrowings for this book
    const activeCheckouts = db.prepare(`
      SELECT t.id as transaction_id, t.issue_timestamp, t.due_date, t.status,
             b.id as borrower_id, b.student_id, b.name as borrower_name, b.email, b.phone, b.department
      FROM transactions t
      JOIN borrowers b ON t.borrower_id = b.id
      WHERE t.book_id = ? AND t.status = 'ISSUED'
      ORDER BY t.due_date ASC
    `).all(bookId);

    res.json({
      success: true,
      book,
      activeCheckouts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new book record
 */
exports.createBook = (req, res, next) => {
  try {
    const db = getDatabase();
    const {
      book_id,
      title,
      author,
      category,
      total_copies = 1,
      shelf_location = 'Main Rack',
      description = '',
      cover_url = ''
    } = req.body;

    if (!book_id || !title || !author || !category) {
      return res.status(400).json({
        success: false,
        message: 'Book ID/ISBN, Title, Author, and Category are required.'
      });
    }

    const copies = parseInt(total_copies, 10) || 1;
    if (copies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total copies must be at least 1.'
      });
    }

    // Check duplicate
    const existing = db.prepare('SELECT id FROM books WHERE book_id = ?').get(book_id.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A book with ID '${book_id}' already exists in the catalog.`
      });
    }

    const defaultCover = cover_url.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';

    const insert = db.prepare(`
      INSERT INTO books (book_id, title, author, category, total_copies, available_copies, shelf_location, description, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      book_id.trim(),
      title.trim(),
      author.trim(),
      category.trim(),
      copies,
      copies, // Initially, available copies = total copies
      shelf_location.trim(),
      description.trim(),
      defaultCover
    );

    const created = db.prepare('SELECT * FROM books WHERE book_id = ?').get(book_id.trim());

    res.status(201).json({
      success: true,
      message: 'Book added to catalog successfully.',
      book: created
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update book details
 */
exports.updateBook = (req, res, next) => {
  try {
    const db = getDatabase();
    const { bookId } = req.params;
    const { title, author, category, total_copies, shelf_location, description, cover_url } = req.body;

    const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book '${bookId}' not found.`
      });
    }

    const currentlyIssued = book.total_copies - book.available_copies;
    let newTotal = total_copies !== undefined ? parseInt(total_copies, 10) : book.total_copies;

    if (newTotal < currentlyIssued) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce total copies to ${newTotal}. There are currently ${currentlyIssued} copies checked out.`
      });
    }

    const newAvailable = newTotal - currentlyIssued;

    db.prepare(`
      UPDATE books
      SET title = COALESCE(?, title),
          author = COALESCE(?, author),
          category = COALESCE(?, category),
          total_copies = ?,
          available_copies = ?,
          shelf_location = COALESCE(?, shelf_location),
          description = COALESCE(?, description),
          cover_url = COALESCE(?, cover_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE book_id = ?
    `).run(
      title ? title.trim() : null,
      author ? author.trim() : null,
      category ? category.trim() : null,
      newTotal,
      newAvailable,
      shelf_location ? shelf_location.trim() : null,
      description !== undefined ? description.trim() : null,
      cover_url !== undefined ? cover_url.trim() : null,
      bookId
    );

    const updated = db.prepare('SELECT * FROM books WHERE book_id = ?').get(bookId);

    res.json({
      success: true,
      message: 'Book updated successfully.',
      book: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a book (Safeguarded against active checkouts)
 */
exports.deleteBook = (req, res, next) => {
  try {
    const db = getDatabase();
    const { bookId } = req.params;

    const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book '${bookId}' not found.`
      });
    }

    // Check for active unreturned checkouts
    const activeTx = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE book_id = ? AND status = 'ISSUED'").get(bookId);
    if (activeTx && activeTx.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book. There are ${activeTx.count} active borrowed copy(ies) that must be returned first.`
      });
    }

    db.prepare('DELETE FROM books WHERE book_id = ?').run(bookId);

    res.json({
      success: true,
      message: `Book '${book.title}' (${bookId}) deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate QR code for a book
 */
exports.getBookQR = async (req, res, next) => {
  try {
    const db = getDatabase();
    const { bookId } = req.params;

    const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book '${bookId}' not found.`
      });
    }

    // Structured QR payload
    const qrPayload = JSON.stringify({
      app: 'LibraHub-NSCC',
      type: 'BOOK',
      bookId: book.book_id,
      isbn: book.book_id,
      title: book.title,
      author: book.author
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0B132B',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      bookId: book.book_id,
      qrDataUrl,
      rawPayload: qrPayload
    });
  } catch (error) {
    next(error);
  }
};
