import { Play, TrendingUp, Code } from 'lucide-react';
import logo from 'figma:asset/752e3867204e01d9cd9312e2a5ecbc27f9afe447.png';
import banner from 'figma:asset/26524a26cf53ae68bc88a82b6bd0e09c980899ee.png';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

export function Hero({ setActiveSection }: HeroProps) {
  return (
    <div className="pt-16 min-h-screen">
      {/* Banner Section - Full Width like YouTube/Spotify */}
      <div className="w-full overflow-hidden">
        <img 
          src={banner} 
          alt="shhmaart" 
          className="w-full h-48 md:h-64 lg:h-80 object-cover object-center" 
        />
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Music &
            <span className="text-white">
              {' '}Digital Solutions
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Elevate your sound with professional beats and remixes. 
            Scale your business with cutting-edge digital marketing and web services.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button 
              onClick={() => setActiveSection('music')}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-full font-semibold transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5" />
              <span>Explore Beats</span>
            </button>
            <button 
              onClick={() => setActiveSection('services')}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white rounded-full font-semibold border-2 border-white transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Our Services</span>
            </button>
          </div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <button 
              onClick={() => setActiveSection('music')}
              className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-all text-left cursor-pointer"
            >
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Premium Beats</h3>
              <p className="text-gray-300">
                Stream and download high-quality beats and remixes for your projects
              </p>
            </button>
            
            <button 
              onClick={() => setActiveSection('services')}
              className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-all text-left cursor-pointer"
            >
              <div className="bg-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Digital Marketing</h3>
              <p className="text-gray-300">
                Content creation, ad campaigns, and marketing strategies that convert
              </p>
            </button>
            
            <button 
              onClick={() => setActiveSection('services')}
              className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-2xl p-8 hover:bg-white/10 transition-all text-left cursor-pointer"
            >
              <div className="bg-gray-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Web Services</h3>
              <p className="text-gray-300">
                Professional website design, development, and maintenance solutions
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}