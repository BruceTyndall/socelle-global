import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { StickyConversionBar } from '../components/modules/StickyConversionBar';

export function Root() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <StickyConversionBar />
    </div>
  );
}