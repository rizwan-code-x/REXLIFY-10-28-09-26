import React, { useState, useEffect } from 'react';
import { Download, Check, Sparkles } from 'lucide-react';
import { ProductItem } from '../types';

interface DownloadButtonProps {
  product: ProductItem;
  onIncrementDownload: (productId: string) => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ product, onIncrementDownload }) => {
  const [downloadProgress, setDownloadProgress] = useState(-1); // -1 means idle

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (downloadProgress >= 0 && downloadProgress < 100) {
      timer = setTimeout(() => {
        setDownloadProgress(prev => {
          const next = prev + Math.floor(Math.random() * 20) + 10;
          return next > 100 ? 100 : next;
        });
      }, 300);
    } else if (downloadProgress === 100) {
      // Finished downloading - trigger count increment!
      onIncrementDownload(product.id);
      // Reset state back to idle after a few seconds
      timer = setTimeout(() => {
        setDownloadProgress(-2); // -2 means completed badge
      }, 3500);
    }

    return () => clearTimeout(timer);
  }, [downloadProgress, product.id]);

  const handleStartDownload = () => {
    if (downloadProgress >= 0) return;
    setDownloadProgress(0);
  };

  if (downloadProgress === -2) {
    return (
      <button 
        disabled
        className="flex-1 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
      >
        <Check size={14} className="animate-bounce" />
        Blueprint Ready!
      </button>
    );
  }

  if (downloadProgress >= 0 && downloadProgress <= 100) {
    return (
      <div className="flex-1 relative overflow-hidden bg-white/5 border border-white/10 text-white rounded-xl py-3 font-mono text-xs font-bold uppercase tracking-wider text-center select-none flex items-center justify-center">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-950/40 via-[#be123c]/40 to-amber-950/20 transition-all duration-300"
          style={{ width: `${downloadProgress}%` }}
        />
        <span className="relative z-10 flex items-center gap-2 text-rose-300 animate-pulse">
          <Sparkles size={11} className="animate-spin" />
          Compiling: {downloadProgress > 100 ? 100 : downloadProgress}%
        </span>
      </div>
    );
  }

  return (
    <button 
      onClick={handleStartDownload}
      id={`download-button-trigger-${product.id}`}
      className="flex-1 py-3 bg-gradient-to-r from-rose-700 via-[#be123c] to-amber-600 hover:opacity-95 text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 active:scale-95"
    >
      <Download size={13} />
      Evaluate APK
    </button>
  );
};
