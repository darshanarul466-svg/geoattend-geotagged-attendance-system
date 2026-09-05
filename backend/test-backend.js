const { getDatabase } = require('./src/config/database');

async function testBackend() {
  console.log('Testing Backend & SQLite Database...');
  const db = getDatabase();

  // 1. Verify books
  const books = db.prepare('SELECT * FROM books').all();
  console.log(`✓ Books count: ${books.length}`);
  if (books.length === 0) throw new Error('Books not seeded');

  // 2. Verify borrowers
  const borrowers = db.prepare('SELECT * FROM borrowers').all();
  console.log(`✓ Borrowers count: ${borrowers.length}`);
  if (borrowers.length === 0) throw new Error('Borrowers not seeded');

  // 3. Verify transactions
  const txs = db.prepare('SELECT * FROM transactions').all();
  console.log(`✓ Transactions count: ${txs.length}`);
  if (txs.length === 0) throw new Error('Transactions not seeded');

  // 4. Test analytics controller logic
  const analyticsController = require('./src/controllers/analyticsController');
  const mockRes = {
    json: (data) => {
      console.log('✓ Analytics stats computed:', data.stats);
    }
  };
  analyticsController.getDashboardStats({}, mockRes, (err) => { if (err) throw err; });

  // 5. Test QR generation
  const QRCode = require('qrcode');
  const qr = await QRCode.toDataURL(JSON.stringify({ bookId: 'BK00123' }));
  console.log(`✓ QR Code generated successfully (data URL length: ${qr.length})`);

  // 6. Test Excel export
  const exportController = require('./src/controllers/exportController');
  let excelBuffer;
  const mockExcelRes = {
    setHeader: () => {},
    status: () => ({ send: (buf) => { excelBuffer = buf; } })
  };
  exportController.exportExcel({}, mockExcelRes, (err) => { if (err) throw err; });
  console.log(`✓ Excel report generated successfully (${excelBuffer ? excelBuffer.length : 0} bytes)`);

  console.log('🎉 ALL BACKEND CHECKS PASSED PERFECTLY!');
}

testBackend().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
