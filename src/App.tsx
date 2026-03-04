import { useState, useEffect } from "react";
import { Hero } from "./components/Hero";
import { MusicSection } from "./components/MusicSection";
import { ServicesSection } from "./components/ServicesSection";
import { AboutSection } from "./components/AboutSection";
import { FAQSection } from "./components/FAQSection";
import { AdminDashboard } from "./components/AdminDashboard";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { AccessibilityToolbar } from "./components/AccessibilityToolbar";
import shhmaartLogo from "figma:asset/752e3867204e01d9cd9312e2a5ecbc27f9afe447.png";

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Set favicon and page title
  useEffect(() => {
    // Create rounded favicon
    const createRoundedFavicon = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = shhmaartLogo;
      
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw rounded rectangle
          const radius = size * 0.2; // 20% rounded corners
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(size - radius, 0);
          ctx.quadraticCurveTo(size, 0, size, radius);
          ctx.lineTo(size, size - radius);
          ctx.quadraticCurveTo(size, size, size - radius, size);
          ctx.lineTo(radius, size);
          ctx.quadraticCurveTo(0, size, 0, size - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.clip();
          
          // Draw image
          ctx.drawImage(img, 0, 0, size, size);
          
          // Convert to data URL and set as favicon
          const roundedIconUrl = canvas.toDataURL('image/png');
          
          const updateFavicon = (rel: string) => {
            let link: HTMLLinkElement | null = document.querySelector(`link[rel='${rel}']`);
            if (!link) {
              link = document.createElement('link');
              link.rel = rel;
              link.type = 'image/png';
              document.head.appendChild(link);
            }
            link.href = roundedIconUrl;
          };

          // Set multiple favicon formats for cross-browser support
          updateFavicon('icon');
          updateFavicon('shortcut icon');
          updateFavicon('apple-touch-icon');
        }
      };
    };

    createRoundedFavicon();
    
    // Update page title
    document.title = 'shhmaart - Music & Digital Solutions';
  }, []);

  // Auto-detect system theme preference on mount
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div className={`min-h-screen bg-black ${theme}`} id="main-content" tabIndex={-1}>
      {!isAdminMode ? (
        <>
          <Navigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onAdminClick={() => setIsAdminMode(true)}
          />

          <AccessibilityToolbar theme={theme} onThemeChange={setTheme} />

          {activeSection === "home" && (
            <Hero setActiveSection={setActiveSection} />
          )}
          {activeSection === "music" && <MusicSection />}
          {activeSection === "services" && <ServicesSection />}
          {activeSection === "about" && <AboutSection />}
          {activeSection === "faq" && <FAQSection />}

          <Footer setActiveSection={setActiveSection} />
        </>
      ) : (
        <AdminDashboard onExit={() => setIsAdminMode(false)} />
      )}
    </div>
  );
}