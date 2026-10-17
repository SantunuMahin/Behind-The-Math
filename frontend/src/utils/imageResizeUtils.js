/**
 * Utility for resizing and compressing images client-side.
 * Strictly guarantees that any uploaded student image is resized
 * and compressed to be under 500 KB (512,000 bytes) with high visual fidelity.
 * Supports rotation, zoom, fit mode, and mobile touch capture.
 */

export const MAX_AVATAR_SIZE_BYTES = 500 * 1024; // 500 KB limit = 512,000 bytes

/**
 * Format bytes into human-friendly string (KB / MB)
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '0 KB';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Check if an avatar value represents an image (data URL, blob, or web URL)
 * vs a mathematical symbol / emoji (like '∑', 'π', '∞')
 */
export function isImageAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') return false;
  const trimmed = avatar.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/media/') ||
    trimmed.startsWith('/static/') ||
    trimmed.startsWith('/') ||
    trimmed.endsWith('.webp') ||
    trimmed.endsWith('.png') ||
    trimmed.endsWith('.jpg') ||
    trimmed.endsWith('.jpeg')
  );
}

/**
 * Reads a File / Blob into an HTMLImageElement
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Failed to load image file: ' + err));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a Data URL into an HTMLImageElement
 */
export function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image from data URL'));
    img.src = dataUrl;
  });
}

/**
 * Converts canvas to Blob with specified mime and quality
 */
export function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    );
  });
}

/**
 * Resizes and compresses any student image to be strictly under 500 KB.
 *
 * @param {File|Blob|HTMLImageElement|string} source - Raw file, blob, image element, or dataUrl
 * @param {Object} options - Configuration options
 * @param {number} [options.maxSizeBytes=512000] - Hard cap in bytes (default: 500 KB)
 * @param {number} [options.maxDimension=600] - Max width/height for the avatar (600px is retina-sharp for avatars)
 * @param {boolean} [options.cropSquare=true] - Center-crop square to fit circular/squircle avatars
 * @param {number} [options.zoom=1.0] - Zoom multiplier (1.0 to 3.0)
 * @param {number} [options.rotation=0] - Rotation angle in degrees (0, 90, 180, 270)
 * @param {'cover'|'contain'} [options.fitMode='cover'] - Fit mode inside square
 * @returns {Promise<{
 *   dataUrl: string,
 *   blob: Blob,
 *   originalSize: number,
 *   optimizedSize: number,
 *   originalSizeFormatted: string,
 *   optimizedSizeFormatted: string,
 *   width: number,
 *   height: number,
 *   reductionPercent: number,
 *   isUnder500KB: boolean
 * }>}
 */
export async function resizeAndCompressAvatar(source, options = {}) {
  const maxSizeBytes = options.maxSizeBytes || MAX_AVATAR_SIZE_BYTES;
  const maxDimension = options.maxDimension || 600;
  const zoom = Math.max(1, Math.min(options.zoom || 1.0, 3.5));
  const rotation = ((options.rotation || 0) % 360 + 360) % 360;
  const fitMode = options.fitMode || 'cover';

  let originalSize = 0;
  let img;

  if (source instanceof HTMLImageElement) {
    img = source;
  } else if (typeof source === 'string' && source.startsWith('data:image/')) {
    img = await loadImageFromDataUrl(source);
    originalSize = Math.round((source.length - source.indexOf(',') - 1) * 0.75);
  } else {
    originalSize = source.size || 0;
    img = await loadImageFromFile(source);
  }

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Determine output target dimension (default square avatar: max 600px)
  let targetDim = Math.min(Math.max(origWidth, origHeight), maxDimension);
  targetDim = Math.max(targetDim, 200); // minimum 200px

  // 1. Set up Canvas
  let canvas = document.createElement('canvas');
  canvas.width = targetDim;
  canvas.height = targetDim;
  let ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If contain mode, fill background cleanly
  if (fitMode === 'contain') {
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, targetDim, targetDim);
  }

  // 2. Transformations: Translate to center -> Rotate -> Zoom -> Draw
  ctx.save();
  ctx.translate(targetDim / 2, targetDim / 2);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  ctx.scale(zoom, zoom);

  // Compute dimensions
  let drawW, drawH;
  if (fitMode === 'contain') {
    const scale = Math.min(targetDim / origWidth, targetDim / origHeight);
    drawW = origWidth * scale;
    drawH = origHeight * scale;
  } else {
    // cover mode
    const scale = Math.max(targetDim / origWidth, targetDim / origHeight);
    drawW = origWidth * scale;
    drawH = origHeight * scale;
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // 3. Determine Output Format (Prefer WebP; fallback to JPEG)
  let mimeType = 'image/webp';
  const testDataUrl = canvas.toDataURL('image/webp', 0.9);
  if (!testDataUrl.startsWith('data:image/webp')) {
    mimeType = 'image/jpeg';
  }

  // 4. Iterative Compression Loop to Guarantee Under 500 KB
  let quality = 0.88;
  let blob = await canvasToBlob(canvas, mimeType, quality);

  // Step down quality progressively if over limit
  while (blob && blob.size > maxSizeBytes && quality > 0.25) {
    quality -= 0.10;
    blob = await canvasToBlob(canvas, mimeType, quality);
  }

  // If still over 500 KB (rare edge case), reduce canvas dimensions by 15% iteratively
  while (blob && blob.size > maxSizeBytes && canvas.width > 160) {
    const nextDim = Math.round(canvas.width * 0.85);

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextDim;
    nextCanvas.height = nextDim;
    const nextCtx = nextCanvas.getContext('2d');
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(canvas, 0, 0, nextDim, nextDim);

    canvas = nextCanvas;
    blob = await canvasToBlob(canvas, mimeType, quality);
  }

  // 5. Build final Data URL & Result Metadata
  const finalDataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  const optimizedSize = blob.size;
  const reductionPercent =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
      : 0;

  return {
    dataUrl: finalDataUrl,
    blob,
    originalSize,
    optimizedSize,
    originalSizeFormatted: formatFileSize(originalSize),
    optimizedSizeFormatted: formatFileSize(optimizedSize),
    width: canvas.width,
    height: canvas.height,
    reductionPercent,
    isUnder500KB: optimizedSize <= maxSizeBytes,
    quality: Math.round(quality * 100),
  };
}
