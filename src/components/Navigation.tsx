import { Music, Briefcase, Home, Lock, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from 'figma:asset/752e3867204e01d9cd9312e2a5ecbc27f9afe447.png';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onAdminClick: () => void;
}

export function Navigation({ activeSection, setActiveSection, onAdminClick }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  // Secret keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        onAdminClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onAdminClick]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => setActiveSection('home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-white/5 flex items-center justify-center">
              <img src={logo} alt="shhmaart" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-white">shhmaart</span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setActiveSection('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === 'home' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => setActiveSection('music')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === 'music' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Music</span>
            </button>
            
            <button
              onClick={() => setActiveSection('services')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === 'services' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveSection('about')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === 'about' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>About</span>
            </button>

            <button
              onClick={() => setActiveSection('faq')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === 'faq' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>FAQ</span>
            </button>
            
            {/* Admin Login - Hidden but accessible via secret key combination */}
            {/* Press Ctrl+Shift+A to access admin panel */}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setActiveSection('home')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                activeSection === 'home' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <button
              onClick={() => handleNavClick('music')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === 'music' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Music className="w-5 h-5" />
              <span>Music</span>
            </button>
            
            <button
              onClick={() => handleNavClick('services')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === 'services' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Services</span>
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === 'about' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>About</span>
            </button>

            <button
              onClick={() => handleNavClick('faq')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === 'faq' 
                  ? 'bg-white text-black' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>FAQ</span>
            </button>

            {/* Admin login removed from mobile menu for security */}
          </div>
        </div>
      )}
    </nav>
  );
}