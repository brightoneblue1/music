import { useState } from 'react';
import { Save, Info } from 'lucide-react';

export function HeroEditor() {
  const [heroText, setHeroText] = useState({
    title: 'Premium Beats & Digital Solutions',
    subtitle: 'Elevate your sound with professional beats and remixes. Scale your business with cutting-edge digital marketing and web services.',
  });

  const handleSave = () => {
    // In a real implementation, this would save to the database
    alert('Hero section updated! (Note: This is a demo - changes will reset on page refresh)');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Edit Hero Section</h2>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Note:</p>
          <p>
            Changes made here will update the homepage hero section. In a production environment, 
            this would be stored in the database and persist across sessions.
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hero Title
          </label>
          <input
            type="text"
            value={heroText.title}
            onChange={(e) => setHeroText({ ...heroText, title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
            placeholder="Enter hero title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hero Subtitle
          </label>
          <textarea
            value={heroText.subtitle}
            onChange={(e) => setHeroText({ ...heroText, subtitle: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
            placeholder="Enter hero subtitle..."
          />
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-lg p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {heroText.title || 'Premium Beats & Digital Solutions'}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {heroText.subtitle || 'Elevate your sound with professional beats and remixes. Scale your business with cutting-edge digital marketing and web services.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
