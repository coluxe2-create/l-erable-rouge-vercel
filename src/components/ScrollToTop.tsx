import { useEffect } from 'react';

interface ScrollToTopProps {
  activePage?: string;
  activeTab?: string;
}

export default function ScrollToTop({ activePage, activeTab }: ScrollToTopProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage, activeTab]);

  return null;
}
