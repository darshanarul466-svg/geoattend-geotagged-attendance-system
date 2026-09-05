const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      if (contentType.includes('application/json')) {
        const errData = await res.json();
        errorMsg = errData.message || errorMsg;
      } else {
        errorMsg = await res.text();
      }
      const err = new Error(errorMsg);
      err.status = res.status;
      throw err;
    }

    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return res;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  // Dashboard & Analytics
  getDashboardStats: () => request('/analytics/dashboard'),

  // Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return request(`/books${qStr}`);
  },
  getBookById: (bookId) => request(`/books/${encodeURIComponent(bookId)}`),
  createBook: (bookData) => request('/books', { method: 'POST', body: JSON.stringify(bookData) }),
  updateBook: (bookId, bookData) => request(`/books/${encodeURIComponent(bookId)}`, { method: 'PUT', body: JSON.stringify(bookData) }),
  deleteBook: (bookId) => request(`/books/${encodeURIComponent(bookId)}`, { method: 'DELETE' }),
  getBookQR: (bookId) => request(`/books/${encodeURIComponent(bookId)}/qr`),

  // Borrowers
  getBorrowers: (search = '') => {
    const qStr = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/borrowers${qStr}`);
  },
  getBorrowerById: (id) => request(`/borrowers/${encodeURIComponent(id)}`),
  createBorrower: (borrowerData) => request('/borrowers', { method: 'POST', body: JSON.stringify(borrowerData) }),

  // Transactions (QR Issue & Return)
  verifyScannedQR: (qrCode) => request('/transactions/verify-qr', { method: 'POST', body: JSON.stringify({ qrCode }) }),
  issueBook: (data) => request('/transactions/issue', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (data) => request('/transactions/return', { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return request(`/transactions${qStr}`);
  },
  getActiveLoans: () => request('/transactions/active'),

  // AI Integration
  chatAI: (message, conversationHistory = []) => 
    request('/ai/chat', { method: 'POST', body: JSON.stringify({ message, conversationHistory }) }),
  autofillBookAI: (title, isbn) => 
    request('/ai/autofill', { method: 'POST', body: JSON.stringify({ title, isbn }) }),

  // Exports
  exportCSVUrl: `${API_BASE}/export/csv`,
  exportExcelUrl: `${API_BASE}/export/excel`,
};
