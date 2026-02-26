import { Music, Code, TrendingUp } from 'lucide-react';
import logo from 'figma:asset/752e3867204e01d9cd9312e2a5ecbc27f9afe447.png';

export function AboutSection() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">About shhmaart</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Where creativity meets technology. Music production and digital excellence.
          </p>
        </div>

        {/* Main Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <img src={logo} alt="shhmaart logo" className="w-32 h-32 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4 text-center">Our Story</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                shhmaart is a creative powerhouse dedicated to pushing the boundaries of music production 
                and digital innovation. What started as a passion for creating unique beats and remixes has 
                evolved into a full-service creative agency.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">What We Do</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-white rounded-lg p-3 flex-shrink-0">
                    <Music className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Music Production</h4>
                    <p className="text-gray-400 text-sm">
                      Original beats, custom remixes, and sound design that captures your unique style
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gray-300 rounded-lg p-3 flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Digital Marketing</h4>
                    <p className="text-gray-400 text-sm">
                      Strategic campaigns, content creation, and brand growth across all platforms
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-gray-400 rounded-lg p-3 flex-shrink-0">
                    <Code className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Web Development</h4>
                    <p className="text-gray-400 text-sm">
                      Modern, responsive websites that convert visitors into customers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
