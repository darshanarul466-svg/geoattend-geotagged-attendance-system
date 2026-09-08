const crypto = require('node:crypto');

const TOKEN_SECRET = process.env.JWT_SECRET || 'librahub-production-secret-key-2026';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hash password using PBKDF2 with unique cryptographic salt
 * @param {string} password 
 * @returns {{ hash: string, salt: string }}
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify candidate password against stored hash and salt (Constant-time comparison)
 * @param {string} candidatePassword 
 * @param {string} storedHash 
 * @param {string} storedSalt 
 * @returns {boolean}
 */
function verifyPassword(candidatePassword, storedHash, storedSalt) {
  try {
    const candidateHash = crypto.pbkdf2Sync(candidatePassword, storedSalt, 100000, 64, 'sha512').toString('hex');
    const storedHashBuffer = Buffer.from(storedHash, 'hex');
    const candidateHashBuffer = Buffer.from(candidateHash, 'hex');

    if (storedHashBuffer.length !== candidateHashBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(storedHashBuffer, candidateHashBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Generate a signed session token
 * @param {object} user 
 * @returns {string} token
 */
function generateAuthToken(user) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + TOKEN_EXPIRY_MS
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify signed session token and return payload
 * @param {string} token 
 * @returns {object|null} payload if valid, null otherwise
 */
function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedSigBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateAuthToken,
  verifyAuthToken
};
