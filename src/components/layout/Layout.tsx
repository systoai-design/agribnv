import { ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';

export interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
  showSearch?: boolean;
  showFooter?: boolean;
  hideNavbarOnMobile?: boolean;
  hideNav?: boolean;
  searchLocation?: string;
  onSearchLocationChange?: (location: string) => void;
  searchDateRange?: { from: Date | undefined; to: Date | undefined };
  onSearchDateRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void;
  searchGuestCount?: number;
  onSearchGuestCountChange?: (count: number) => void;
  onSearch?: () => void;
}

export function Layout({ 
  children, 
  showMobileNav = true,
  showSearch = true,
  showFooter = true,
  hideNavbarOnMobile = false,
  hideNav = false,
  searchLocation,
  onSearchLocationChange,
  searchDateRange,
  onSearchDateRangeChange,
  searchGuestCount,
  onSearchGuestCountChange,
  onSearch,
}: LayoutProps) {
  // Full screen mode - no nav, no footer
  if (hideNav) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <main id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className={hideNavbarOnMobile ? 'hidden md:block shrink-0' : 'shrink-0'}>
        <Navbar 
          showSearch={showSearch}
          searchLocation={searchLocation}
          onSearchLocationChange={onSearchLocationChange}
          searchDateRange={searchDateRange}
          onSearchDateRangeChange={onSearchDateRangeChange}
          searchGuestCount={searchGuestCount}
          onSearchGuestCountChange={onSearchGuestCountChange}
          onSearch={onSearch}
        />
      </div>
      <main id="main-scroll-container" className={`flex-1 overflow-y-auto overflow-x-hidden ${showMobileNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
        {showFooter && !Capacitor.isNativePlatform() && <div className="shrink-0 mt-auto"><Footer /></div>}
      </main>
      {showMobileNav && <div className="shrink-0"><MobileNav /></div>}
    </div>
  );
}
