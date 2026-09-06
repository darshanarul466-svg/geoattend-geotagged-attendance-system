function seedData(db) {
  const books = [
    {
      book_id: 'BK00123',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      category: 'Computer Science',
      total_copies: 5,
      available_copies: 4,
      shelf_location: 'Rack CS-01-A',
      description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
      cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&q=80'
    },
    {
      book_id: 'BK00456',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      category: 'Engineering',
      total_copies: 4,
      available_copies: 4,
      shelf_location: 'Rack CS-01-B',
      description: 'Capturing a wealth of experience about the design of object-oriented software by the Gang of Four.',
      cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'
    },
    {
      book_id: 'BK00789',
      title: 'Operating System Concepts (Silberschatz Dinosaur Book)',
      author: 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne',
      category: 'Computer Science',
      total_copies: 6,
      available_copies: 5,
      shelf_location: 'Rack CS-02-A',
      description: 'The standard foundational textbook on operating system design, kernel architecture, memory management, and threads.',
      cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80'
    },
    {
      book_id: 'BK01011',
      title: 'Database System Concepts (6th Edition)',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      category: 'Computer Science',
      total_copies: 5,
      available_copies: 4,
      shelf_location: 'Rack CS-02-C',
      description: 'Comprehensive coverage of relational databases, SQL, normalization, concurrency control, and indexing.',
      cover_url: 'https://images.unsplash.com/photo-1507842229451-9f01079ca4b5?w=400&q=80'
    },
    {
      book_id: 'BK01314',
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      category: 'Mathematics',
      total_copies: 8,
      available_copies: 7,
      shelf_location: 'Rack CS-03-A',
      description: 'The definitive textbook and reference work covering dynamic programming, graph algorithms, NP-completeness, and data structures.',
      cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=80'
    },
    {
      book_id: 'BK01567',
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'Andrew Hunt, David Thomas',
      category: 'Computer Science',
      total_copies: 4,
      available_copies: 3,
      shelf_location: 'Rack CS-04-B',
      description: 'Illustrates the best practices and major pitfalls of modern software development with timeless wisdom.',
      cover_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80'
    },
    {
      book_id: 'BK01568',
      title: 'Effective Java (3rd Edition)',
      author: 'Joshua Bloch',
      category: 'Engineering',
      total_copies: 4,
      available_copies: 4,
      shelf_location: 'Rack CS-04-C',
      description: 'Essential best-practices guide for Java developers covering generics, enums, annotations, lambdas, and concurrency.',
      cover_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80'
    },
    {
      book_id: 'BK01569',
      title: 'System Design Interview: An Insider’s Guide',
      author: 'Alex Xu',
      category: 'Computer Science',
      total_copies: 5,
      available_copies: 4,
      shelf_location: 'Rack CS-05-A',
      description: 'Step-by-step real world system architecture patterns for distributed caching, rate limiters, web crawlers, and chat systems.',
      cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80'
    },
    {
      book_id: 'BK02020',
      title: 'Deep Learning',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      category: 'AI & Data Science',
      total_copies: 3,
      available_copies: 2,
      shelf_location: 'Rack AI-01-A',
      description: 'Comprehensive mathematical foundation for deep feedforward networks, regularization, optimization, CNNs, RNNs, and generative models.',
      cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80'
    },
    {
      book_id: 'BK02025',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      category: 'Engineering',
      total_copies: 6,
      available_copies: 5,
      shelf_location: 'Rack CS-05-D',
      description: 'The big ideas behind reliable, scalable, and maintainable data systems: replication, partitioning, transactions, and consensus.',
      cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=80'
    },
    {
      book_id: 'BK03010',
      title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
      author: 'James Clear',
      category: 'Self-Help',
      total_copies: 4,
      available_copies: 4,
      shelf_location: 'Rack GN-01-B',
      description: 'Tiny changes, remarkable results: a proven framework for improving every day.',
      cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80'
    },
    {
      book_id: 'BK03020',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category: 'Fiction',
      total_copies: 3,
      available_copies: 3,
      shelf_location: 'Rack LIT-02-A',
      description: 'The unforgettable Pulitzer Prize-winning novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
      cover_url: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&q=80'
    }
  ];

  const insertBook = db.prepare(`
    INSERT OR IGNORE INTO books (book_id, title, author, category, total_copies, available_copies, shelf_location, description, cover_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of books) {
    insertBook.run(
      b.book_id,
      b.title,
      b.author,
      b.category,
      b.total_copies,
      b.available_copies,
      b.shelf_location,
      b.description,
      b.cover_url
    );
  }

  const borrowers = [
    { student_id: 'RA2411003010042', name: 'Rohit Sharma', email: 'rs9021@campus.edu', phone: '+91 98401 23456', department: 'Computer Science & Engineering' },
    { student_id: 'RA2411003010088', name: 'Anjali Menon', email: 'am4432@campus.edu', phone: '+91 97123 45678', department: 'Information Technology' },
    { student_id: 'RA2411003010156', name: 'Karthik Varma', email: 'kv1102@campus.edu', phone: '+91 94450 67890', department: 'Electronics & Communication' },
    { student_id: 'RA2411003010214', name: 'Sneha Roy', email: 'sr7741@campus.edu', phone: '+91 99620 12345', department: 'Data Science & AI' },
    { student_id: 'RA2411003010305', name: 'Vignesh Prasad', email: 'vp3390@campus.edu', phone: '+91 98840 98765', department: 'Mechanical Engineering' },
    { student_id: 'RA2411003010410', name: 'Arjun Nair', email: 'arjun.nair@campus.edu', phone: '+91 98402 11223', department: 'Computer Science & Engineering' }
  ];

  const insertBorrower = db.prepare(`
    INSERT OR IGNORE INTO borrowers (student_id, name, email, phone, department)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const s of borrowers) {
    insertBorrower.run(s.student_id, s.name, s.email, s.phone, s.department);
  }


  // Helper date generators (ISO strings)
  const now = new Date();
  const subDays = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  // Transactions:
  // 1. Currently Issued (Active, not overdue)
  // 2. Currently Overdue (Issued, due date in past -> triggers brownie subtask fine calculation!)
  // 3. Completed (Returned)
  const transactions = [
    // Active checkout: Clean Code -> Rohit S (Due in 7 days)
    {
      book_id: 'BK00123',
      borrower_id: 1,
      issue_timestamp: subDays(7),
      due_date: addDays(7),
      return_timestamp: null,
      status: 'ISSUED',
      fine_amount: 0.0,
      notes: 'Standard semester issue'
    },
    // Active checkout: Operating System Concepts -> Karthik V (Due in 3 days)
    {
      book_id: 'BK00789',
      borrower_id: 3,
      issue_timestamp: subDays(11),
      due_date: addDays(3),
      return_timestamp: null,
      status: 'ISSUED',
      fine_amount: 0.0,
      notes: 'Lab reference copy'
    },
    // Active checkout: Database System -> Sneha R (Due in 10 days)
    {
      book_id: 'BK01011',
      borrower_id: 4,
      issue_timestamp: subDays(4),
      due_date: addDays(10),
      return_timestamp: null,
      status: 'ISSUED',
      fine_amount: 0.0,
      notes: 'Project preparation'
    },
    // Active checkout & OVERDUE: Introduction to Algorithms -> Vignesh P (Overdue by 5 days!)
    {
      book_id: 'BK01314',
      borrower_id: 5,
      issue_timestamp: subDays(19),
      due_date: subDays(5),
      return_timestamp: null,
      status: 'ISSUED',
      fine_amount: 25.0, // 5 days * ₹5/day
      notes: 'Reminder SMS dispatched'
    },
    // Active checkout & OVERDUE: Pragmatic Programmer -> Rohit S (Overdue by 12 days!)
    {
      book_id: 'BK01567',
      borrower_id: 1,
      issue_timestamp: subDays(26),
      due_date: subDays(12),
      return_timestamp: null,
      status: 'ISSUED',
      fine_amount: 60.0, // 12 days * ₹5/day
      notes: 'Notice sent to department head'
    },
    // Active checkout: Deep Learning -> Arjun N (Due in 12 days)
    {
      book_id: 'BK02020',
      borrower_id: 6,
      issue_timestamp: subDays(2),
      due_date: addDays(12),
      return_timestamp: null,
      status: 'ISSUED',
      fine_amount: 0.0,
      notes: 'Research reference'
    },
    // Active checkout: Designing Data-Intensive Applications -> Anjali M (Due in 5 days)
    {
      book_id: 'BK02025',
      borrower_id: 2,
      issue_timestamp: subDays(9),
      due_date: addDays(5),
      return_timestamp: null,
      status: 'ISSUED',
      fine_amount: 0.0,
      notes: 'Exam review'
    },
    // Completed checkout: Design Patterns -> Anjali M (Returned 2 days ago)
    {
      book_id: 'BK00456',
      borrower_id: 2,
      issue_timestamp: subDays(16),
      due_date: subDays(2),
      return_timestamp: subDays(2),
      status: 'RETURNED',
      fine_amount: 0.0,
      notes: 'Returned in pristine condition'
    },
    // Completed checkout: Introduction to Algorithms -> Rohit S (Returned 5 days ago)
    {
      book_id: 'BK01314',
      borrower_id: 1,
      issue_timestamp: subDays(25),
      due_date: subDays(11),
      return_timestamp: subDays(5),
      status: 'RETURNED',
      fine_amount: 30.0, // Returned 6 days late, paid fine
      notes: 'Fine paid at desk'
    }
  ];

  const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  if (txCount.count === 0) {
    const insertTx = db.prepare(`
      INSERT INTO transactions (book_id, borrower_id, issue_timestamp, due_date, return_timestamp, status, fine_amount, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of transactions) {
      insertTx.run(
        t.book_id,
        t.borrower_id,
        t.issue_timestamp,
        t.due_date,
        t.return_timestamp,
        t.status,
        t.fine_amount,
        t.notes
      );
    }
  }


  // Seed default admin and staff users
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (username, email, password_hash, salt, name, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const { hashPassword } = require('./authUtils');
  const adminCreds = hashPassword('admin123');
  insertUser.run('admin', 'admin@library.edu', adminCreds.hash, adminCreds.salt, 'Chief Administrator', 'admin');

  const staffCreds = hashPassword('staff123');
  insertUser.run('staff', 'staff@library.edu', staffCreds.hash, staffCreds.salt, 'Desk Librarian', 'staff');

  console.log('[Database] Seeded 12 books, 6 borrowers, 9 transactions, and 2 default user accounts successfully.');
}

if (require.main === module) {
  const { getDatabase } = require('../config/database');
  const db = getDatabase();
  seedData(db);
}

module.exports = { seedData };

