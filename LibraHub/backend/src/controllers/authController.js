const { getDatabase } = require('../config/database');
const { hashPassword, verifyPassword, generateAuthToken } = require('../utils/authUtils');

/**
 * Handle user login (Supports login via Username OR Email)
 */
exports.login = (req, res, next) => {
  try {
    const db = getDatabase();
    const { identifier, username, email, password } = req.body;
    const loginKey = (identifier || username || email || '').trim();

    if (!loginKey || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username or Email and password are required.'
      });
    }

    // Lookup user by either username or email (case-insensitive)
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
    `).get(loginKey, loginKey);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.'
      });
    }

    // Verify password with salted PBKDF2 constant-time check
    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.'
      });
    }

    // Generate signed auth token
    const token = generateAuthToken(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
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
 * Register a new staff or admin user
 */
exports.register = (req, res, next) => {
  try {
    const db = getDatabase();
    const { username, password, name, email, role = 'staff' } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, full name, and email are required.'
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Check collision
    const existing = db.prepare(`
      SELECT id, username, email FROM users 
      WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
    `).get(cleanUsername, cleanEmail);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.username.toLowerCase() === cleanUsername.toLowerCase()
          ? `Username '${cleanUsername}' is already taken.`
          : `Email '${cleanEmail}' is already registered.`
      });
    }

    const userRole = role === 'admin' ? 'admin' : 'staff';
    const { hash, salt } = hashPassword(password);

    const insert = db.prepare(`
      INSERT INTO users (username, email, password_hash, salt, name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(cleanUsername, cleanEmail, hash, salt, cleanName, userRole);
    const created = db.prepare('SELECT id, username, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateAuthToken(created);

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      token,
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
 * Validate current active session token and return user profile
 */
exports.getMe = (req, res, next) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT id, username, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User session no longer valid.'
      });
    }

    res.json({
      success: true,
      user: {
        ...user,
        isAdmin: user.role === 'admin'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all users (Admin only)
 */
exports.getUsers = (req, res, next) => {
  try {
    const db = getDatabase();
    const users = db.prepare('SELECT id, username, name, email, role, created_at FROM users ORDER BY role ASC, name ASC').all();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Admin only)
 */
exports.updateUserRole = (req, res, next) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "admin" or "staff".'
      });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Safety check: Prevent demoting the last admin
    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "admin"').get().count;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the only remaining Chief Administrator.'
        });
      }
    }

    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    const updated = db.prepare('SELECT id, username, name, email, role, created_at FROM users WHERE id = ?').get(id);

    res.json({
      success: true,
      message: `Updated role for ${updated.name} to ${updated.role}.`,
      user: updated
    });
  } catch (error) {
    next(error);
  }
};

