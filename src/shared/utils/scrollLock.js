import { useEffect } from 'react';

// Measure scrollbar width once at module load (layout is settled, no DOM mutations yet).
// Used to compensate body padding when hiding the scrollbar so the viewport width
// doesn't change — this prevents the browser from firing a resize event which
// would otherwise cause a forced reflow in any handler that reads window.innerWidth.
const SCROLLBAR_WIDTH =
  typeof window !== 'undefined'
    ? window.innerWidth - document.documentElement.clientWidth
    : 0;

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export const createScrollLock = () => {
  return {
    lock() {
      if (lockCount === 0) {
        originalOverflow = document.body.style.overflow;
        originalPaddingRight = document.body.style.paddingRight;
        // Write both properties in one pass — no layout read after write.
        if (SCROLLBAR_WIDTH > 0) {
          document.body.style.paddingRight = `${SCROLLBAR_WIDTH}px`;
        }
        document.body.style.overflow = 'hidden';
      }
      lockCount++;
    },

    unlock() {
      lockCount--;
      if (lockCount <= 0) {
        document.body.style.overflow = originalOverflow || '';
        document.body.style.paddingRight = originalPaddingRight || '';
        lockCount = 0;
      }
    },

    isLocked() {
      return lockCount > 0;
    },
  };
};

// Singleton instance
const scrollLock = createScrollLock();

export default scrollLock;

/**
 * React hook for scroll lock management
 * Usage: useScrollLock(shouldLock)
 */
export const useScrollLock = (shouldLock = true) => {
  useEffect(() => {
    if (shouldLock) {
      scrollLock.lock();
      return () => scrollLock.unlock();
    }
  }, [shouldLock]);
};
