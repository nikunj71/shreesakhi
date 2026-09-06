'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Choli } from '@/types';
import { 
  X, 
  Printer, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  Sparkles,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface CholiQrModalProps {
  choli: Choli | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CholiQrModal({ choli, isOpen, onClose }: CholiQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!choli || !isOpen) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const outfitUrl = `${origin}/choli/${choli._id}`;

    // Generate high-resolution luxury themed QR Code (Peacock Teal dark modules, Warm Champagne background)
    QRCode.toDataURL(outfitUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#084C42',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code', err));
  }, [choli, isOpen]);

  if (!isOpen || !choli) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const outfitUrl = `${origin}/choli/${choli._id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(outfitUrl);
    setCopied(true);
    toast.success('Outfit QR link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${choli.sku}_QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`QR Code downloaded for ${choli.sku}!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#072622] rounded-3xl border border-[#DFBD76]/50 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#032620] via-[#084C42] to-[#0D5C51] p-5 sm:p-6 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DFBD76]/20 border border-[#DFBD76]/40 flex items-center justify-center text-[#DFBD76]">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">
                Choli QR Code
              </h2>
              <p className="text-[11px] text-[#E0E7E5]">
                Scannable boutique tag for physical dress hangers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: The Printable Boutique Hangtag */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Printable Choli Tag Card */}
          <div 
            id="printable-hangtag"
            className="bg-[#FAF8F5] dark:bg-[#041A17] p-5 sm:p-6 rounded-3xl border-2 border-[#DFBD76] shadow-md text-center space-y-4 relative overflow-hidden"
          >
            {/* Tag Cut-Hole Mockup */}
            <div className="w-4 h-4 rounded-full border border-[#DFBD76] bg-white dark:bg-[#072622] mx-auto shadow-inner" />

            {/* Brand Header */}
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="h-14 px-3 py-1 rounded-2xl border-2 border-[#DFBD76] bg-[#025151] shadow-sm flex items-center justify-center">
                <img src="/logo-cropped.png" alt="श्री SAKHI BOUTIQUE" className="h-full w-auto object-contain" />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#78716C] dark:text-[#9BB5AF] font-bold">
                Royal Choli Rental Atelier
              </span>
            </div>

            {/* Choli Title & SKU */}
            <div className="border-t border-b border-[#DFBD76]/40 py-2.5 space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#084C42] text-[#FAF6EC]">
                {choli.sku}
              </span>
              <p className="font-serif font-bold text-base text-[#1C1917] dark:text-[#FAF6EC]">
                {choli.name}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#78716C] dark:text-[#9BB5AF]">
                <span>{choli.category}</span>
                <span>•</span>
                <span>Size: <strong>{choli.blouseSize}</strong></span>
                <span>•</span>
                <span>Skirt: <strong>{choli.skirtLength}&quot;</strong></span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center space-y-2 py-1">
              <div className="p-3 rounded-2xl bg-white border-2 border-[#DFBD76] shadow-md inline-block">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${choli.sku}`}
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-400 font-medium">
                    Generating QR...
                  </div>
                )}
              </div>
              <p className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] font-medium max-w-xs">
                Scan with any mobile camera to view high-res lookbook, specs & instant availability
              </p>
            </div>

            {/* Rental & Pricing Summary on Hangtag */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-white dark:bg-[#041A17] border border-[#DFBD76]/50 text-xs">
              <div className="text-left border-r border-[#DFBD76]/30 pr-2">
                <span className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] block uppercase font-semibold">
                  Rental Price
                </span>
                <span className="font-serif font-bold text-sm text-[#084C42] dark:text-[#DFBD76]">
                  ₹{choli.rentalPricePerEvent.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-[#78716C] block">per 3 days</span>
              </div>

              <div className="text-right pl-2">
                <span className="text-[10px] text-[#78716C] dark:text-[#9BB5AF] block uppercase font-semibold">
                  Security Deposit
                </span>
                <span className="font-serif font-bold text-sm text-[#1C1917] dark:text-[#FAF6EC]">
                  ₹{choli.securityDeposit.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                  100% Refundable
                </span>
              </div>
            </div>

          </div>

          {/* Quick Actions Toolbar (Hidden when printing) */}
          <div className="space-y-2.5 no-print">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Print Hangtag Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-2xl text-xs font-bold bg-[#084C42] hover:bg-[#0D6357] text-[#FAF6EC] border border-[#DFBD76]/50 shadow-md flex items-center justify-center gap-1.5 transition-all"
                title="Print physical tag for hanger"
              >
                <Printer className="w-4 h-4 text-[#DFBD76]" />
                <span>Print Tag</span>
              </button>

              {/* Download QR Image */}
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-2xl text-xs font-semibold bg-[#FAF8F5] dark:bg-[#041A17] hover:bg-[#EADFC9]/50 dark:hover:bg-[#0A2E28] text-[#1C1917] dark:text-[#FAF6EC] border border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-center gap-1.5 transition-all"
                title="Download QR code image (PNG)"
              >
                <Download className="w-4 h-4 text-[#DFBD76]" />
                <span>Save PNG</span>
              </button>

              {/* Copy Scan Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-2xl text-xs font-semibold bg-[#FAF8F5] dark:bg-[#041A17] hover:bg-[#EADFC9]/50 dark:hover:bg-[#0A2E28] text-[#1C1917] dark:text-[#FAF6EC] border border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-center gap-1.5 transition-all"
                title="Copy direct outfit URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#DFBD76]" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>

              {/* Open Live Outfit Page */}
              <a
                href={`/choli/${choli._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-2xl text-xs font-semibold bg-[#FAF8F5] dark:bg-[#041A17] hover:bg-[#EADFC9]/50 dark:hover:bg-[#0A2E28] text-[#084C42] dark:text-[#DFBD76] border border-[#EADFC9] dark:border-[#1A3E38] flex items-center justify-center gap-1.5 transition-all"
                title="Open dedicated customer details view"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Preview</span>
              </a>
            </div>

            <p className="text-[10px] text-center text-[#78716C] dark:text-[#9CA3AF]">
              Scan Target: <code className="font-mono text-[#084C42] dark:text-[#DFBD76]">{outfitUrl}</code>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
