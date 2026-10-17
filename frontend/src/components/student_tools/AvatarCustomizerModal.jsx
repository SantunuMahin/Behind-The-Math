import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Camera,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  SlidersHorizontal,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Crop,
  Layers
} from 'lucide-react';
import {
  resizeAndCompressAvatar,
  isImageAvatar,
  MAX_AVATAR_SIZE_BYTES
} from '../../utils/imageResizeUtils';
import StudentAvatar from '../common/StudentAvatar';
import { studentApi } from '../../api/formulasApi';

const MATH_AVATARS = [
  '∑', 'π', '∞', '∇', '∫', '📐',
  '⚛️', '🚀', '🧠', '🎓', '💻', '🎯',
  '⚡', '🔬', '🪐', '🧬', '🔥', '💎',
  '√', 'Δ', 'θ', 'λ', 'Ω', 'Ψ'
];

export default function AvatarCustomizerModal({
  isOpen,
  onClose,
  currentAvatar,
  displayName = 'Math Scholar',
  onAvatarUpdated,
}) {
  const [activeTab, setActiveTab] = useState(isImageAvatar(currentAvatar) ? 'upload' : 'symbol');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Raw source file / image
  const [rawFile, setRawFile] = useState(null);

  // Editor adjustments
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [fitMode, setFitMode] = useState('cover'); // 'cover' or 'contain'

  // Processed image state
  const [processedResult, setProcessedResult] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(currentAvatar || '∑');
  const [successToast, setSuccessToast] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewAvatar(currentAvatar || '∑');
      setActiveTab(isImageAvatar(currentAvatar) ? 'upload' : 'symbol');
      setErrorMsg('');
      setSuccessToast('');
    }
  }, [isOpen, currentAvatar]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Support Ctrl+V paste on Desktop
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          handleNewFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Core processing function
  const processImage = useCallback(
    async (fileSource, currentZoom, currentRotation, currentFit) => {
      if (!fileSource) return;
      setIsProcessing(true);
      setErrorMsg('');

      try {
        const result = await resizeAndCompressAvatar(fileSource, {
          maxSizeBytes: MAX_AVATAR_SIZE_BYTES, // 500 KB limit guaranteed
          maxDimension: 600,
          zoom: currentZoom,
          rotation: currentRotation,
          fitMode: currentFit,
          cropSquare: true,
        });

        setProcessedResult(result);
        setPreviewAvatar(result.dataUrl);
      } catch (err) {
        console.error('Image optimization failed:', err);
        setErrorMsg('Could not process this image. Please choose another image.');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // When a new file is uploaded
  const handleNewFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP, GIF, HEIC).');
      return;
    }
    setRawFile(file);
    setZoom(1.0);
    setRotation(0);
    setFitMode('cover');
    processImage(file, 1.0, 0, 'cover');
  };

  // Re-process when adjustments change (zoom, rotation, fit)
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    if (rawFile) {
      processImage(rawFile, newZoom, rotation, fitMode);
    }
  };

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    if (rawFile) {
      processImage(rawFile, zoom, nextRot, fitMode);
    }
  };

  const handleToggleFit = () => {
    const nextFit = fitMode === 'cover' ? 'contain' : 'cover';
    setFitMode(nextFit);
    if (rawFile) {
      processImage(rawFile, zoom, rotation, nextFit);
    }
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleNewFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Save the custom photo
  const handleSavePhotoAvatar = async () => {
    if (!processedResult || !processedResult.dataUrl) return;
    setIsSaving(true);
    setErrorMsg('');

    try {
      // 1. Update client context immediately (guaranteed under 500 KB)
      if (onAvatarUpdated) {
        await onAvatarUpdated(processedResult.dataUrl);
      }

      // 2. Also attempt upload to backend API
      try {
        if (processedResult.blob) {
          await studentApi.uploadAvatar(processedResult.blob);
        } else {
          await studentApi.uploadAvatar(processedResult.dataUrl);
        }
      } catch (backendErr) {
        console.warn('Backend sync notice (saved locally in storage):', backendErr);
      }

      setSuccessToast('Avatar updated and optimized under 500 KB!');
      setTimeout(() => {
        setSuccessToast('');
        onClose();
      }, 900);
    } catch (err) {
      console.error('Save avatar error:', err);
      setErrorMsg('Failed to update avatar. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Select math symbol
  const handleSelectSymbol = async (sym) => {
    setPreviewAvatar(sym);
    setProcessedResult(null);
    setRawFile(null);
    if (onAvatarUpdated) {
      await onAvatarUpdated(sym);
    }
    setSuccessToast(`Avatar set to ${sym}`);
    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 600);
  };

  // Reset to default symbol
  const handleResetToSymbol = async () => {
    setPreviewAvatar('∑');
    setProcessedResult(null);
    setRawFile(null);
    if (onAvatarUpdated) {
      await onAvatarUpdated('∑');
    }
    try {
      await studentApi.resetAvatar();
    } catch (err) {
      // offline note
    }
    setSuccessToast('Reset to default math emblem ∑');
    setTimeout(() => {
      setSuccessToast('');
      onClose();
    }, 700);
  };

  if (!isOpen) return null;

  const currentSizePct = processedResult
    ? Math.min(100, Math.round((processedResult.optimizedSize / MAX_AVATAR_SIZE_BYTES) * 100))
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c1322] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (Sticky) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 bg-white dark:bg-[#0c1322]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-xs shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-black dark:text-white leading-tight">
                Student Avatar Studio
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Resized &amp; compressed to strictly under 500 KB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Tab Switcher (Sticky) */}
        <div className="px-5 pt-3 pb-1 shrink-0 bg-white dark:bg-[#0c1322]">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs font-extrabold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Photo Upload (&lt; 500 KB)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('symbol')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'symbol'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs font-extrabold'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Math Symbols</span>
            </button>
          </div>
        </div>

        {/* 3. Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 space-y-4 scrollbar-thin">
          {/* Tab 1: Upload Custom Photo */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Dropzone & File Pickers */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? 'border-black dark:border-white bg-zinc-100/90 dark:bg-zinc-800/80 scale-[1.01]'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 bg-zinc-50/70 dark:bg-zinc-900/40'
                }`}
              >
                {/* Standard file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleNewFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {/* Mobile camera input */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleNewFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="py-4 space-y-2 flex flex-col items-center justify-center">
                    <RefreshCw className="w-7 h-7 text-black dark:text-white animate-spin" />
                    <p className="text-xs font-bold text-black dark:text-white">
                      Resizing &amp; compressing under 500 KB...
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Generating high-fidelity optimized avatar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mx-auto shadow-2xs">
                      <ImageIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm font-bold text-black dark:text-white">
                        {rawFile ? 'Replace current photo' : 'Choose or drop any image'}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Any resolution or size (1MB - 20MB+). We automatically resize &amp; compress it under <strong>500 KB</strong>.
                      </p>
                    </div>

                    {/* Mobile Touch Action Strip */}
                    <div className="flex items-center justify-center gap-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse Files</span>
                      </button>

                      {/* Camera trigger (useful on phones/tablets) */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-xs font-semibold shadow-2xs hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-300" />
                        <span>Take Photo</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-zinc-400 hidden sm:block">
                      Tip: You can also press <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[9px]">Ctrl+V</kbd> to paste from clipboard
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Toast */}
              {successToast && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}

              {/* Fine-Tuning Controls (Zoom, Rotate, Fit) */}
              {rawFile && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-black dark:text-white">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Fine-Tune Avatar Framing</span>
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Zoom: {zoom.toFixed(1)}x · {rotation}°
                    </span>
                  </div>

                  {/* Zoom Slider */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleZoomChange(Math.max(1, +(zoom - 0.2).toFixed(1)))}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                      className="w-full accent-black dark:accent-white cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleZoomChange(Math.min(3, +(zoom + 0.2).toFixed(1)))}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Rotate & Fit Mode Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="flex-1 py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleFit}
                      className="flex-1 py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{fitMode === 'cover' ? 'Fill (Crop)' : 'Fit Entire'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Real-time Compression Verification Card */}
              {processedResult && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-black dark:text-white">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Strictly Under 500 KB Limit</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {processedResult.reductionPercent > 0
                        ? `-${processedResult.reductionPercent}% Size Reduction`
                        : '100% Compliant'}
                    </span>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      <span>
                        Size: <strong className="text-black dark:text-white">{processedResult.optimizedSizeFormatted}</strong>
                      </span>
                      <span>500 KB Limit ({currentSizePct}% used)</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-300"
                        style={{ width: `${Math.max(4, currentSizePct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-zinc-400 block uppercase">Original</span>
                      <strong className="text-zinc-700 dark:text-zinc-300 truncate block">
                        {processedResult.originalSizeFormatted}
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800">
                      <span className="text-zinc-400 block uppercase">Dimensions</span>
                      <strong className="text-zinc-700 dark:text-zinc-300 truncate block">
                        {processedResult.width}×{processedResult.height}px
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-emerald-600 dark:text-emerald-400 block uppercase font-bold">Optimized</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold truncate block">
                        {processedResult.optimizedSizeFormatted}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Multi-Context Previews */}
              <div className="space-y-2 pt-0.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Live Previews Across App
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 items-center justify-items-center">
                  {/* Large Profile Hero Size */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-md flex items-center justify-center font-bold text-2xl overflow-hidden ring-2 ring-black/10 dark:ring-white/20">
                      <StudentAvatar avatar={previewAvatar} name={displayName} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Profile (64px)</span>
                  </div>

                  {/* Medium Scholar ID Card Size */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-sm flex items-center justify-center font-bold text-xl overflow-hidden ring-1 ring-black/10">
                      <StudentAvatar avatar={previewAvatar} name={displayName} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Card (48px)</span>
                  </div>

                  {/* Mini Navbar Size */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black shadow-2xs flex items-center justify-center font-bold text-xs overflow-hidden">
                      <StudentAvatar avatar={previewAvatar} name={displayName} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Navbar (28px)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mathematical Symbol Avatar */}
          {activeTab === 'symbol' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Select any mathematical emblem or symbol for your student identity:
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1 max-h-64 overflow-y-auto p-1 scrollbar-thin">
                {MATH_AVATARS.map((sym) => {
                  const isSelected = previewAvatar === sym;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleSelectSymbol(sym)}
                      className={`h-12 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-105 ring-2 ring-zinc-400 font-black'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold'
                      }`}
                    >
                      <span>{sym}</span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Success feedback */}
              {successToast && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Bottom Sticky Action Dock (Always visible on mobile & desktop) */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-[#0c1322] shrink-0 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleResetToSymbol}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reset to default symbol emblem ∑"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Reset to Symbol</span>
            <span className="sm:hidden">Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'upload' ? (
              <button
                type="button"
                disabled={!processedResult || isSaving}
                onClick={handleSavePhotoAvatar}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 ${
                  processedResult && !isSaving
                    ? 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 cursor-pointer active:scale-95'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed opacity-70'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Set as Avatar</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
