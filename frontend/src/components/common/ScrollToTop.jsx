import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Ensures that whenever a user navigates between pages or search queries,
 * the window scroll position is cleanly and instantaneously reset to the top.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If there's an anchor hash (e.g. #lab or #worked-example), scroll to that element
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Otherwise, immediately scroll to top of page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, search, hash]);

  return null;
}
