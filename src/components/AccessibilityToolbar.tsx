import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Type, Contrast, ZoomIn, ZoomOut, SkipForward } from 'lucide-react';

interface AccessibilityToolbarProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function AccessibilityToolbar({ theme, onThemeChange }: AccessibilityToolbarProps) {
  const [fontSize, setFontSize] = useState(100); // percentage
  const [highContrast, setHighContrast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Apply font size to root element
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Close toolbar when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  const increaseFontSize = () => {
    if (fontSize < 150) {
      setFontSize(fontSize + 10);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 80) {
      setFontSize(fontSize - 10);
    }
  };

  const resetFontSize = () => {
    setFontSize(100);
  };

  const skipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Skip to Content Link (for screen readers and keyboard users) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:border-2 focus:border-black focus:rounded"
      >
        Skip to main content
      </a>

      {/* Accessibility Toolbar */}
      <div
        className="fixed right-4 top-24 z-50"
        role="toolbar"
        aria-label="Accessibility controls"
      >
        <div
          className={`bg-black/90 backdrop-blur-lg border-2 border-white/20 rounded-lg shadow-xl transition-all ${
            isExpanded ? 'w-64' : 'w-12'
          }`}
          ref={toolbarRef}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-3 flex items-center justify-center hover:bg-white/10 transition-colors rounded-t-lg"
            aria-label={isExpanded ? 'Collapse accessibility toolbar' : 'Expand accessibility toolbar'}
            aria-expanded={isExpanded}
          >
            <Type className="w-5 h-5 text-white" />
          </button>

          {/* Controls */}
          {isExpanded && (
            <div className="p-4 space-y-4 border-t border-white/10">
              {/* Theme Toggle */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Theme</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 transition-all ${
                      theme === 'light'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    aria-label="Light theme"
                    aria-pressed={theme === 'light'}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-xs">Light</span>
                  </button>
                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 transition-all ${
                      theme === 'dark'
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    aria-label="Dark theme"
                    aria-pressed={theme === 'dark'}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-xs">Dark</span>
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Font Size: {fontSize}%
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={decreaseFontSize}
                    disabled={fontSize <= 80}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    aria-label="Decrease font size"
                  >
                    <ZoomOut className="w-4 h-4" />
                    <span className="text-xs">A-</span>
                  </button>
                  <button
                    onClick={resetFontSize}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors text-xs"
                    aria-label="Reset font size"
                  >
                    Reset
                  </button>
                  <button
                    onClick={increaseFontSize}
                    disabled={fontSize >= 150}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    aria-label="Increase font size"
                  >
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-xs">A+</span>
                  </button>
                </div>
              </div>

              {/* High Contrast */}
              <div>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-full px-3 py-2 rounded flex items-center justify-center gap-2 transition-all ${
                    highContrast
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  aria-label="Toggle high contrast mode"
                  aria-pressed={highContrast}
                >
                  <Contrast className="w-4 h-4" />
                  <span className="text-xs">High Contrast</span>
                </button>
              </div>

              {/* Skip to Content */}
              <div>
                <button
                  onClick={skipToContent}
                  className="w-full px-3 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  aria-label="Skip to main content"
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="text-xs">Skip to Content</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}