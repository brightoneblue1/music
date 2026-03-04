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
import shhmaartLogo from "figma:asset/ac8308735979e996faf7b23f237b7e08b280f281.png";

export default function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Set favicon and page title
  useEffect(() => {
    // Update favicon - support multiple icon types for better browser compatibility
    const updateFavicon = (rel: string, type?: string) => {
      let link: HTMLLinkElement | null = document.querySelector(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (type) link.type = type;
        document.head.appendChild(link);
      }
      link.href = shhmaartLogo;
    };

    // Set multiple favicon formats for cross-browser support
    updateFavicon('icon');
    updateFavicon('shortcut icon');
    updateFavicon('apple-touch-icon');
    
    // Update page title
    document.title = 'shhmaart - Professional Music & Digital Marketing';
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