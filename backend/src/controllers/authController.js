const { getDatabase } = require('../config/database');

/**
 * Handle user login (Supports both predefined demo accounts and dynamic user sign-in)
 */
exports.login = (req, res, next) => {
  try {
    const db = getDatabase();
    const { username, password, name, role = 'staff' } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Check existing user
    let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());

    if (user) {
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please verify your password.'
        });
      }
    } else {
      // Dynamic sign-in: If a user enters a new name/username, create the account
      const displayName = name ? name.trim() : username.trim();
      const email = `${username.toLowerCase().replace(/\s+/g, '.')}@librahub.edu`;

      const insert = db.prepare(`
        INSERT INTO users (username, password, name, email, role)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = insert.run(username.trim(), password, displayName, email, role);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new staff/admin user
 */
exports.register = (req, res, next) => {
  try {
    const db = getDatabase();
    const { username, password, name, email, role = 'staff' } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and full name are required.'
      });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Username '${username}' is already taken.`
      });
    }

    const userEmail = email ? email.trim() : `${username.trim()}@librahub.edu`;

    const insert = db.prepare(`
      INSERT INTO users (username, password, name, email, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insert.run(username.trim(), password, name.trim(), userEmail, role);
    const created = db.prepare('SELECT id, username, name, email, role FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      user: {
        ...created,
        isAdmin: created.role === 'admin'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all users
 */
exports.getUsers = (req, res, next) => {
  try {
    const db = getDatabase();
    const users = db.prepare('SELECT id, username, name, email, role, created_at FROM users ORDER BY role, name').all();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};
