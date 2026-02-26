import { Mail, Youtube, Instagram, Disc3, Video } from 'lucide-react';
import logo from 'figma:asset/752e3867204e01d9cd9312e2a5ecbc27f9afe447.png';

interface FooterProps {
  setActiveSection: (section: string) => void;
}

export function Footer({ setActiveSection }: FooterProps) {
  return (
    <footer className="bg-black/90 backdrop-blur-lg border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden bg-white/5 flex items-center justify-center">
                <img src={logo} alt="shhmaart" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-white">shhmaart</span>
            </div>
            <p className="text-gray-400 mb-4">
              Music & Digital Solutions - Premium beats, professional digital marketing, and cutting-edge web services. 
              Your one-stop shop for creative and technical excellence.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.youtube.com/@shhmaart" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="YouTube"
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a 
                href="https://open.spotify.com/artist/6nIsLjLEDuhdbJjpWGhQvn?si=8Cu_4NtkQDGKCUEg4iTsvA" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="Spotify"
              >
                <Disc3 className="w-6 h-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@shhmaart" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="TikTok"
              >
                <Video className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/shhmaart" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                title="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveSection('about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('services')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('music')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Music
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('faq')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <Youtube className="w-4 h-4" />
                <a 
                  href="https://www.youtube.com/@shhmaart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @shhmaart
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <a 
                  href="mailto:shhmaart@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  shhmaart@gmail.com
                </a>
              </li>
              <li className="text-gray-400 text-sm">
                Response within 24 hours
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 shhmaart. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            {' • '}
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}