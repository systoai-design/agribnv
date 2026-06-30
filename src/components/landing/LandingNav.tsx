import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import agribnvLogo from '@/assets/agribnv-logo.png';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      animate={{ backgroundColor: scrolled ? 'rgba(15, 50, 25, 0.97)' : 'transparent' }}
      style={{ backdropFilter: scrolled ? 'blur(12px)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group justify-self-start">
          <img src={agribnvLogo} alt="Agribnv" className="h-9 w-auto brightness-0 invert" />
        </Link>

        {/* Center nav pill — true page center */}
        <nav className="hidden md:flex items-center gap-1 justify-self-center rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-1.5 py-1">
          <Link to="/explore" className="px-4 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors">
            Explore Farms
          </Link>
          <Link to="/about" className="px-4 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors">
            Our Mission
          </Link>
          <Link to="/host" className="px-4 py-1.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors">
            Become a Host
          </Link>
        </nav>

        {/* Right cluster: desktop CTA + mobile hamburger */}
        <div className="flex items-center gap-3 justify-self-end">
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => navigate('/explore')}
                className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-5 h-9 text-sm"
              >
                Open App
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="text-white hover:text-white hover:bg-white/10 font-medium text-sm h-9"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-5 h-9 text-sm"
                >
                  Get started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 -mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-forest border-t border-white/10 px-6 py-4 space-y-3"
        >
          <Link to="/explore" className="block text-white/80 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Explore Farms</Link>
          <Link to="/about" className="block text-white/80 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Our Mission</Link>
          <Link to="/host" className="block text-white/80 hover:text-white py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>Become a Host</Link>
          <div className="pt-2 flex gap-3">
            <Button variant="outline" onClick={() => { navigate('/auth'); setMenuOpen(false); }} className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent text-sm h-9">Sign in</Button>
            <Button onClick={() => { navigate('/auth?mode=signup'); setMenuOpen(false); }} className="flex-1 bg-white text-primary hover:bg-white/90 text-sm h-9">Get started</Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
