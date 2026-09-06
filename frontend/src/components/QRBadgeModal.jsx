import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Printer, Download, BookOpen, MapPin, Tag } from 'lucide-react';

export default function QRBadgeModal({ book, isOpen, onClose }) {
  const canvasRef = useRef(null);

  if (!isOpen || !book) return null;

  const qrPayload = JSON.stringify({
    app: 'LibraHub',
    type: 'BOOK',
    bookId: book.book_id,
    isbn: book.book_id,
    title: book.title,
    author: book.author
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const canvas = document.getElementById('book-qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-${book.book_id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#16191F] w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-[#272D37] overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#272D37] flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-700/10 text-forest-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">Library Book QR Label</h3>
              <p className="text-[11px] text-slate-500 font-medium">Official catalog barcode sticker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E232B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Printable Sticker Badge */}
        <div className="p-6 flex flex-col items-center">
          <div className="printable-badge w-full max-w-[340px] bg-white text-slate-900 p-6 rounded-2xl border-2 border-dashed border-slate-300 shadow-sm flex flex-col items-center text-center">
            {/* Institution / Header */}
            <div className="w-full pb-3 mb-4 border-b border-slate-200 flex items-center justify-between text-left">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-forest-700">Central Campus Library</p>
                <p className="text-[9px] text-slate-500 font-medium">LibraHub Automated Circulation</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {book.category}
              </span>
            </div>

            {/* QR Code Canvas */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <QRCodeCanvas
                id="book-qr-canvas"
                value={qrPayload}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Book Metadata */}
            <div className="mt-4 w-full text-left">
              <h4 className="font-serif font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                {book.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 font-medium line-clamp-1">
                by {book.author}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Tag className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                  <span className="font-mono font-bold">{book.book_id}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
                  <span className="font-medium truncate">{book.shelf_location || 'Main Bay'}</span>
                </div>
              </div>
            </div>

            {/* Barcode decorative line */}
            <div className="w-full mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>SCAN AT CIRCULATION DESK</span>
              <span>COPIES: {book.total_copies}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#1E232B]/40 border-t border-slate-100 dark:border-[#272D37] flex items-center justify-end gap-2.5 no-print">
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#272D37] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-md shadow-forest-900/20 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Sticker Label
          </button>
        </div>
      </div>
    </div>
  );
}
