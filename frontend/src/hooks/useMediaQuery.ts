import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../utils/constants';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Return early if window is not available (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    
    // Update state if initial value doesn't match current state
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    // Define listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQueryList.addEventListener('change', listener);

    // Cleanup function
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};

// Convenience hooks for common breakpoints
export const useIsMobile = () => useMediaQuery(`(max-width: ${BREAKPOINTS.sm - 1}px)`);
export const useIsTablet = () => useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
export const useIsDesktop = () => useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
export const useIsLargeScreen = () => useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);

// Orientation hooks
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)');
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)');

// Preference-based hooks
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersHighContrast = () => useMediaQuery('(prefers-contrast: high)');
