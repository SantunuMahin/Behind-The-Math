import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Parses mixed text containing inline ($math$) and block ($$math$$) LaTeX syntax
 * and renders mathematical formulas using KaTeX.
 */
export default function InlineMath({ text, className = '' }) {
  const parts = useMemo(() => {
    if (!text || typeof text !== 'string') return [];

    // Split text by $$...$$ or $...$
    const tokenRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
    const tokens = text.split(tokenRegex);

    return tokens.map((token, index) => {
      if (!token) return null;

      const isBlock = token.startsWith('$$') && token.endsWith('$$') && token.length > 4;
      const isInline = !isBlock && token.startsWith('$') && token.endsWith('$') && token.length > 2;

      if (isBlock || isInline) {
        const mathContent = isBlock ? token.slice(2, -2) : token.slice(1, -1);
        try {
          const renderedHtml = katex.renderToString(mathContent.trim(), {
            displayMode: isBlock,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className={`katex-rendered ${isBlock ? 'block my-2 text-center overflow-x-auto py-1' : 'inline-block px-0.5'}`}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          );
        } catch (err) {
          console.warn('KaTeX render error:', err);
          return <span key={index}>{token}</span>;
        }
      }

      // Normal text with possible newlines
      return <span key={index}>{token}</span>;
    });
  }, [text]);

  if (!text) return null;

  return <span className={className}>{parts}</span>;
}
