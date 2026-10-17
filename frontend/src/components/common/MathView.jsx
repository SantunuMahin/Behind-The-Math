import React, { useMemo } from 'react';
import katex from 'katex';

// In-memory cache for rendered KaTeX strings to avoid costly re-parsing
const KATEX_CACHE = new Map();

export default function MathView({ math, display = false, className = '' }) {
  const html = useMemo(() => {
    if (!math) return '';
    const cacheKey = (display ? 'd:' : 'i:') + math;
    if (KATEX_CACHE.has(cacheKey)) {
      return KATEX_CACHE.get(cacheKey);
    }
    try {
      const rendered = katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
      });
      KATEX_CACHE.set(cacheKey, rendered);
      return rendered;
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return math;
    }
  }, [math, display]);

  if (!math) return null;

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
