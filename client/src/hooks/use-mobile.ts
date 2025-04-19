import { useState, useEffect } from 'react';

// Simple hook to detect if the device is mobile based on user agent
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Common mobile user agent patterns
      const mobilePatterns = [
        /android/i,
        /iphone/i,
        /ipad/i,
        /ipod/i,
        /blackberry/i,
        /windows phone/i,
        /mobile/i
      ];
      
      // Check if any mobile pattern matches
      const isMatch = mobilePatterns.some(pattern => pattern.test(userAgent));
      
      setIsMobile(isMatch);
    };

    checkMobile();
    
    // Recheck on resize in case the user switches between desktop and tablet modes
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}