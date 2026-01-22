import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';

interface TrackingData {
  eventSlug?: string;
  path: string;
  referrer?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
}

const trackPageView = async (data: TrackingData) => {
  try {
    await fetch(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.debug('Analytics tracking failed:', error);
  }
};

export const usePageTracking = (eventSlug?: string) => {
  const location = useLocation();

  useEffect(() => {
    // Small delay to ensure page is loaded
    const timer = setTimeout(() => {
      trackPageView({
        eventSlug,
        path: location.pathname,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, eventSlug]);
};
