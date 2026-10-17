import React, { useState } from 'react';
import { isImageAvatar } from '../../utils/imageResizeUtils';

/**
 * Universal StudentAvatar component.
 * Elegantly handles both custom uploaded student images (base64 data URLs / media URLs)
 * and mathematical emblem symbols (e.g. '∑', 'π', '∞') with automatic fallback.
 */
export default function StudentAvatar({
  avatar,
  name = 'Student',
  fallback = '∑',
  className = '',
  symbolClassName = '',
  imageClassName = '',
}) {
  const [hasError, setHasError] = useState(false);
  const isImage = isImageAvatar(avatar) && !hasError;

  if (isImage) {
    return (
      <img
        src={avatar}
        alt={`${name}'s Profile Avatar`}
        loading="lazy"
        className={`w-full h-full object-cover rounded-[inherit] transition-opacity duration-200 ${imageClassName}`}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <span className={`select-none leading-none font-bold ${symbolClassName} ${className}`}>
      {avatar || fallback}
    </span>
  );
}
