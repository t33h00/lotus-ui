import { useEffect } from 'react';

export const usePreventBounce = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    let startY = 0;
    let startScrollTop = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      startScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      // Only prevent if we're at the exact edges AND trying to scroll beyond
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Prevent pull-to-refresh: only when at top AND pulling down
      if (isAtTop && deltaY > 0) {
        e.preventDefault();
        return;
      }

      // Prevent bottom bounce: only when at bottom AND pushing up
      if (isAtBottom && deltaY < 0) {
        e.preventDefault();
        return;
      }

      // Allow all other scrolling
    };

    // Apply event listeners with passive: false only for touchmove
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup function
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enabled]);

  // Additional utility to detect PWA mode and apply body classes
  useEffect(() => {
    const isPWA = window.navigator.standalone || 
                 window.matchMedia('(display-mode: standalone)').matches;
    
    if (isPWA && enabled) {
      document.body.classList.add('pwa-mode');
    }

    return () => {
      if (isPWA) {
        document.body.classList.remove('pwa-mode');
      }
    };
  }, [enabled]);
};

// Export additional utility function for manual control
export const toggleBouncePreventionMode = (enable) => {
  if (enable) {
    document.body.classList.add('pwa-mode');
  } else {
    document.body.classList.remove('pwa-mode');
  }
};