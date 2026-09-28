/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QrCode, Copy, Check, ExternalLink, Smartphone, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface QRCodeDisplayProps {
  url: string;
  title?: string;
  subTitle?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  url, 
  title = 'SCAN FOR MOBILE INSTALL', 
  subTitle = 'Scan with your smartphone camera for direct APK download',
  size = 180
}) => {
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Generate dynamic QR Code image via QRServer API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=000000&bgcolor=ffffff&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    success('URL Copied', 'Download link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-[#03010b] rounded-2xl flex flex-col items-center gap-4 border border-white/10 shadow-inner text-center max-w-sm mx-auto">
      
      {/* QR Code Container */}
      <div className="relative p-3 bg-white rounded-2xl shadow-xl overflow-hidden group">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <QrCode size={40} className="text-gray-400 animate-pulse" />
          </div>
        )}
        <img
          src={qrImageUrl}
          alt={`QR Code for ${url}`}
          width={size}
          height={size}
          onLoad={() => setImgLoaded(true)}
          className="rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-extrabold block">
          {title}
        </span>
        <p className="text-[11px] font-mono text-gray-400 leading-snug">
          {subTitle}
        </p>
      </div>

      {/* Copy and Direct Link Buttons */}
      <div className="flex items-center gap-2 w-full pt-1">
        <button
          onClick={handleCopyLink}
          className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy URL'}</span>
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-white transition-all cursor-pointer"
          title="Open Link"
        >
          <ExternalLink size={16} />
        </a>
      </div>

    </div>
  );
};
