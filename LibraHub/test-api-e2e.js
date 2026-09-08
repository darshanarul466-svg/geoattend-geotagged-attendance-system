const app = require('./backend/src/app');
const http = require('http');

async function runE2ETests() {
  console.log('--- STARTING END-TO-END INTEGRATION TEST SUITE ---');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  try {
    // 1. Health check
    console.log('[1/9] Testing /api/health...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    if (health.status !== 'online') throw new Error('Health check failed');
    console.log('  ✓ System health is online');

    // 2. Authentication & Role Permissions
    console.log('[2/9] Testing /api/auth/login with Admin & Staff roles...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.success || !adminData.user.isAdmin) throw new Error('Admin login failed');
    console.log(`  ✓ Logged in as Admin: "${adminData.user.name}" (Role: ${adminData.user.role})`);

    const staffLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'staff', password: 'staff123' })
    });
    const staffData = await staffLoginRes.json();
    if (!staffData.success || staffData.user.role !== 'staff') throw new Error('Staff login failed');
    console.log(`  ✓ Logged in as Staff: "${staffData.user.name}" (Role: ${staffData.user.role})`);

    // 3. Dashboard Analytics
    console.log('[3/9] Testing /api/analytics/dashboard...');
    const dashRes = await fetch(`${baseUrl}/api/analytics/dashboard`);
    const dash = await dashRes.json();
    if (!dash.success || !dash.stats) throw new Error('Dashboard stats failed');
    console.log(`  ✓ Total books: ${dash.stats.totalBooks}, Active Overdue: ${dash.stats.overdueCount}`);

    // 4. Books Catalog
    console.log('[4/9] Testing /api/books catalog...');
    const booksRes = await fetch(`${baseUrl}/api/books?status=all`);
    const booksData = await booksRes.json();
    if (!booksData.success || booksData.books.length === 0) throw new Error('Books catalog empty');
    console.log(`  ✓ Retrieved ${booksData.books.length} books across ${booksData.categories.length} categories`);

    // 5. QR Verification
    console.log('[5/9] Testing /api/transactions/verify-qr with JSON QR payload...');
    const verifyRes = await fetch(`${baseUrl}/api/transactions/verify-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCode: JSON.stringify({ bookId: 'BK00456', title: 'Design Patterns' }) })
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success || verifyData.book.book_id !== 'BK00456') throw new Error('QR verify failed');
    console.log(`  ✓ QR code verified: "${verifyData.book.title}" (Available: ${verifyData.hasAvailableCopies})`);

    // 6. Issue Book Transaction & Concurrency Check
    console.log('[6/9] Testing /api/transactions/issue (Issue book to student)...');
    const initialAvail = verifyData.book.available_copies;
    const issueRes = await fetch(`${baseUrl}/api/transactions/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: 'BK00456',
        studentId: 'RA2411003010410',
        name: 'Arjun Nair',
        email: 'arjun.nair@campus.edu',
        loanDays: 14,
        notes: 'Exam preparation'
      })
    });
    const issueData = await issueRes.json();
    if (!issueData.success) throw new Error(`Issue failed: ${issueData.message}`);
    if (issueData.book.available_copies !== initialAvail - 1) throw new Error('Stock not decremented properly');
    console.log(`  ✓ Book issued successfully! New available copies: ${issueData.book.available_copies}`);

    // 7. Test Double-Issue Guard
    console.log('[7/9] Testing Double-Issue Guard (Attempt duplicate active checkout)...');
    const dupRes = await fetch(`${baseUrl}/api/transactions/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: 'BK00456',
        studentId: 'RA2411003010410'
      })
    });
    if (dupRes.status !== 400) throw new Error('Duplicate issue was not blocked!');
    const dupErr = await dupRes.json();
    console.log(`  ✓ Guard correctly rejected duplicate checkout: "${dupErr.message}"`);

    // 8. Return Book Transaction & Stock Restoration
    console.log('[8/9] Testing /api/transactions/return (Process return)...');
    const returnRes = await fetch(`${baseUrl}/api/transactions/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookId: 'BK00456',
        studentId: 'RA2411003010410',
        notes: 'Returned on time in good condition'
      })
    });
    const returnData = await returnRes.json();
    if (!returnData.success) throw new Error(`Return failed: ${returnData.message}`);
    if (returnData.book.available_copies !== initialAvail) throw new Error('Stock not restored');
    console.log(`  ✓ Return processed! Stock restored to: ${returnData.book.available_copies}`);

    // 9. AI Assistant missing key warning & Data Exports
    console.log('[9/9] Testing AI Assistant without key (should warn key required) & CSV/Excel Exports...');
    const aiRes = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hi' })
    });
    const aiData = await aiRes.json();
    if (!aiData.apiKeyRequired) throw new Error('AI should notify that API key is required when missing');
    console.log(`  ✓ AI correctly notified: "${aiData.reply.split('\n')[0]}"`);

    const csvRes = await fetch(`${baseUrl}/api/export/csv`);
    const csvText = await csvRes.text();
    if (!csvText.includes('Book Title') || !csvText.includes('Days Overdue')) throw new Error('CSV missing columns');
    console.log(`  ✓ CSV export generated (${csvText.length} bytes, verified headers)`);

    const excelRes = await fetch(`${baseUrl}/api/export/excel`);
    const excelBuffer = await excelRes.arrayBuffer();
    if (excelBuffer.byteLength < 5000) throw new Error('Excel report empty');
    console.log(`  ✓ Excel report generated (${excelBuffer.byteLength} bytes)`);

    console.log('\n=============================================================');
    console.log('🎉 ALL 9/9 INTEGRATION & BUSINESS LOGIC TESTS PASSED 100%! 🎉');
    console.log('=============================================================');
  } finally {
    server.close();
  }
}

runE2ETests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
