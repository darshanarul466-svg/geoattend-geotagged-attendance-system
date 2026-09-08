const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

let dbInstance = null;

function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // Determine database file path: use /tmp on serverless environments (Vercel), or local data/ dir
  let dbDir;
  let dbPath;

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    dbDir = '/tmp';
    dbPath = path.join(dbDir, 'library.sqlite');
  } else {
    dbDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    dbPath = path.join(dbDir, 'library.sqlite');
  }

  console.log(`[Database] Initializing SQLite database at: ${dbPath}`);
  const db = new DatabaseSync(dbPath);

  // Enable foreign keys and WAL mode for high concurrency
  db.exec('PRAGMA foreign_keys = ON;');
  try {
    db.exec('PRAGMA journal_mode = WAL;');
  } catch (err) {
    // In-memory or some filesystems may ignore WAL mode
  }

  // Initialize schema tables
  initSchema(db);

  // Auto-seed if empty
  autoSeed(db);

  dbInstance = db;
  return dbInstance;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      total_copies INTEGER NOT NULL DEFAULT 1,
      available_copies INTEGER NOT NULL DEFAULT 1,
      shelf_location TEXT DEFAULT 'Section A-1',
      description TEXT,
      cover_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      department TEXT DEFAULT 'Computer Science & Engineering',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      borrower_id INTEGER NOT NULL,
      issue_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME NOT NULL,
      return_timestamp DATETIME,
      status TEXT NOT NULL DEFAULT 'ISSUED',
      fine_amount REAL DEFAULT 0.0,
      notes TEXT,
      processed_by TEXT DEFAULT 'Desk Librarian',
      FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
      FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_books_id ON books(book_id);
    CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
    CREATE INDEX IF NOT EXISTS idx_borrowers_student_id ON borrowers(student_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_book ON transactions(book_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Safe schema migration for existing databases
  try {
    const userColumns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
    if (userColumns.includes('password')) {
      db.exec(`
        CREATE TABLE users_temp (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'staff',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        DROP TABLE users;
        ALTER TABLE users_temp RENAME TO users;
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);
    } else {
      if (!userColumns.includes('password_hash')) {
        db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT;");
      }
      if (!userColumns.includes('salt')) {
        db.exec("ALTER TABLE users ADD COLUMN salt TEXT;");
      }
    }
    const txColumns = db.prepare("PRAGMA table_info(transactions)").all().map(c => c.name);
    if (!txColumns.includes('processed_by')) {
      db.exec("ALTER TABLE transactions ADD COLUMN processed_by TEXT DEFAULT 'Desk Librarian';");
    }
  } catch (err) {
    console.error('[Database Migration]', err.message);
  }
}


function autoSeed(db) {
  const row = db.prepare('SELECT COUNT(*) as count FROM books').get();
  if (row && row.count > 0) {
    return; // Already populated
  }

  console.log('[Database] Database is empty. Seeding initial library catalog...');
  const { seedData } = require('../utils/seedData');
  seedData(db);
}

module.exports = {
  getDatabase
};
