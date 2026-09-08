import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { RotateCw, Download, Printer, Check, Copy, ShieldCheck } from 'lucide-react';

export default function RealisticQRCode({
  event,
  onRegenerate,
  isRegenerating = false
}) {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'manual'
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const qrPayload = `GEOATTEND:EVENT:${event.id}:${event.qrSecret || event.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const canvas = document.getElementById(`qr-canvas-${event.id}`);
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/\s+/g, '_')}_QR_Pass.png`;
      a.click();
    }
  };

  return (
    <div className="bg-[#131D18] rounded-2xl p-5 border border-[#22352B] text-white flex flex-col justify-between shadow-lg h-full">
      <div>
        {/* Top Switcher */}
        <div className="bg-[#1C2C24] p-1 rounded-xl flex items-center text-xs font-medium mb-3">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              activeTab === 'qr'
                ? 'bg-white text-[#131D18] font-bold shadow-sm'
                : 'text-[#94A89E] hover:text-white'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-[#131D18] font-bold shadow-sm'
                : 'text-[#94A89E] hover:text-white'
            }`}
          >
            Manual Entry
          </button>
        </div>

        <p className="text-[11px] text-[#869E91] text-center mb-3">
          {activeTab === 'qr'
            ? 'Show this QR to mark attendance'
            : 'Share 6-digit access code with organizer'}
        </p>

        {activeTab === 'qr' ? (
          /* High-Contrast QR Matrix Display */
          <div className="bg-white p-3.5 rounded-2xl mx-auto mb-3 shadow-md flex items-center justify-center w-fit">
            <QRCodeSVG
              value={qrPayload}
              size={140}
              level="H"
              includeMargin={false}
              fgColor="#131D18"
              bgColor="#ffffff"
            />
            {/* Hidden canvas for downloading PNG */}
            <div className="hidden">
              <QRCodeCanvas
                id={`qr-canvas-${event.id}`}
                value={qrPayload}
                size={512}
                level="H"
                fgColor="#131D18"
                bgColor="#ffffff"
              />
            </div>
          </div>
        ) : (
          /* Manual 6-Digit Code Fallback */
          <div className="bg-[#1A2821] p-5 rounded-2xl mx-auto mb-3 border border-[#2A3E33] text-center">
            <p className="text-[10px] text-[#88A392] uppercase font-bold tracking-wider mb-1">Passcode</p>
            <p className="text-2xl font-mono font-bold tracking-widest text-emerald-400">
              {(event.qrSecret || event.id).substring(0, 6).toUpperCase()}
            </p>
            <button
              onClick={handleCopy}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#253B2F] hover:bg-[#314E3E] text-xs font-semibold text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        )}

        {/* Label & Validity Badge */}
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-white tracking-wide truncate max-w-[200px] mx-auto">
            {event.title}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#203328] text-[#86CDA2] text-[10px] font-semibold border border-[#2B4737]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Valid till {event.endTime || 'End of Session'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#233529]">
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex-1 py-2 rounded-xl bg-[#20362A] hover:bg-[#284234] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isRegenerating ? 'Refreshing...' : 'Regenerate'}</span>
        </button>

        <button
          onClick={handleDownload}
          title="Download High-Res QR"
          className="p-2 rounded-xl bg-[#20362A] hover:bg-[#284234] text-white transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
