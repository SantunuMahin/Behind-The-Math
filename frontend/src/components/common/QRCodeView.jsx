import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function QRCodeView({
  value,
  size = 120,
  className = '',
  includeLabel = false,
  label = 'Scan to Watch'
}) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!value) return;
    let isMounted = true;

    QRCode.toDataURL(value, {
      width: size * 2, // High DPI for crisp printing
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 ${className}`}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR Code for ${value}`}
          style={{ width: `${size}px`, height: `${size}px`, imageRendering: 'pixelated' }}
          className="border border-black/10 rounded-lg p-0.5 bg-white shadow-2xs print:border-black print:shadow-none"
        />
      ) : (
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"
        />
      )}
      {includeLabel && (
        <span className="text-[10px] font-mono font-bold tracking-tight text-zinc-600 dark:text-zinc-400 print:text-black uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
