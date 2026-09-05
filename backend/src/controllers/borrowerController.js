const { getDatabase } = require('../config/database');

/**
 * Get all borrowers/members with search
 */
exports.getBorrowers = (req, res, next) => {
  try {
    const db = getDatabase();
    const { search = '' } = req.query;

    let query = `
      SELECT b.*, 
        (SELECT COUNT(*) FROM transactions t WHERE t.borrower_id = b.id AND t.status = 'ISSUED') as active_loans_count
      FROM borrowers b
      WHERE 1=1
    `;
    const params = [];

    if (search.trim()) {
      query += ' AND (b.name LIKE ? OR b.student_id LIKE ? OR b.email LIKE ? OR b.department LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY b.created_at DESC';

    const borrowers = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: borrowers.length,
      borrowers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single borrower with their active and past loans
 */
exports.getBorrowerById = (req, res, next) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const borrower = db.prepare('SELECT * FROM borrowers WHERE id = ? OR student_id = ?').get(id, id);
    if (!borrower) {
      return res.status(404).json({
        success: false,
        message: 'Borrower not found.'
      });
    }

    const history = db.prepare(`
      SELECT t.*, b.title as book_title, b.author as book_author, b.cover_url
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      WHERE t.borrower_id = ?
      ORDER BY t.issue_timestamp DESC
    `).all(borrower.id);

    res.json({
      success: true,
      borrower,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new borrower
 */
exports.createBorrower = (req, res, next) => {
  try {
    const db = getDatabase();
    const { student_id, name, email, phone = '', department = 'Computer Science & Engineering' } = req.body;

    if (!student_id || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Name, and Email are required.'
      });
    }

    const existing = db.prepare('SELECT id FROM borrowers WHERE student_id = ?').get(student_id.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Student with ID '${student_id}' is already registered.`
      });
    }

    const insert = db.prepare(`
      INSERT INTO borrowers (student_id, name, email, phone, department)
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(student_id.trim(), name.trim(), email.trim(), phone.trim(), department.trim());

    const created = db.prepare('SELECT * FROM borrowers WHERE student_id = ?').get(student_id.trim());

    res.status(201).json({
      success: true,
      message: 'Member registered successfully.',
      borrower: created
    });
  } catch (error) {
    next(error);
  }
};
