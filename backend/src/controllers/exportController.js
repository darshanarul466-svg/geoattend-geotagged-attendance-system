const xlsx = require('xlsx');
const { getDatabase } = require('../config/database');

function escapeCsv(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

// GET /api/export/csv/:eventId
function exportCsv(req, res) {
  try {
    const { eventId } = req.params;
    const db = getDatabase();
    const event = db.events.find(e => e.id === eventId);
    const records = (db.attendances || []).filter(a => a.eventId === eventId);

    const eventName = event ? event.title : 'Attendance_Report';
    const filename = `${eventName.replace(/[^a-zA-Z0-9_-]/g, '_')}_attendance_${Date.now()}.csv`;

    const headers = [
      'Full Name',
      'Registration ID',
      'Email Address',
      'Department',
      'Attendance Status',
      'Verification Method',
      'Distance from Venue (meters)',
      'Allowed Geofence Radius (meters)',
      'Timestamp (ISO)',
      'Timestamp (Local Time)'
    ];

    const rows = records.map(r => [
      escapeCsv(r.userName),
      escapeCsv(r.userRegId),
      escapeCsv(r.userEmail),
      escapeCsv(r.userDepartment || 'N/A'),
      escapeCsv(r.status),
      escapeCsv(r.verificationMethod || 'QR_AND_GEO'),
      escapeCsv(r.distanceMeters !== undefined ? r.distanceMeters : 'N/A'),
      escapeCsv(r.allowedRadius || 'N/A'),
      escapeCsv(r.timestamp),
      escapeCsv(new Date(r.timestamp).toLocaleString())
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/export/excel/:eventId
function exportExcel(req, res) {
  try {
    const { eventId } = req.params;
    const db = getDatabase();
    const event = db.events.find(e => e.id === eventId);
    const records = (db.attendances || []).filter(a => a.eventId === eventId);

    const eventName = event ? event.title : 'Attendance_Report';
    const filename = `${eventName.replace(/[^a-zA-Z0-9_-]/g, '_')}_attendance_${Date.now()}.xlsx`;

    const data = records.map((r, idx) => ({
      'S.No': idx + 1,
      'Full Name': r.userName || 'Unknown',
      'Registration ID': r.userRegId || 'N/A',
      'Email Address': r.userEmail || 'N/A',
      'Department': r.userDepartment || 'N/A',
      'Status': r.status || 'VERIFIED',
      'Verification Method': r.verificationMethod || 'QR_AND_GEO',
      'Distance (m)': r.distanceMeters !== undefined ? r.distanceMeters : 0,
      'Geofence Radius (m)': r.allowedRadius || 100,
      'Timestamp': new Date(r.timestamp).toLocaleString()
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);

    const colWidths = [
      { wch: 6 },
      { wch: 24 },
      { wch: 18 },
      { wch: 28 },
      { wch: 24 },
      { wch: 14 },
      { wch: 20 },
      { wch: 14 },
      { wch: 18 },
      { wch: 22 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  exportCsv,
  exportExcel
};
