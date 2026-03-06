import { useEffect, useCallback } from 'react';

/**
 * Sets data-tone attribute on <html> based on scroll position relative to dark sections.
 * Dark sections should have the attribute data-dark-section.
 */
export function useToneSwitch() {
  const update = useCallback(() => {
    const darkSections = document.querySelectorAll('[data-dark-section]');
    const navBottom = 80; // approximate nav bottom edge in px
    let inDark = false;

    darkSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < navBottom && rect.bottom > navBottom) {
        inDark = true;
      }
    });

    document.documentElement.setAttribute('data-tone', inDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.documentElement.removeAttribute('data-tone');
    };
  }, [update]);
}
