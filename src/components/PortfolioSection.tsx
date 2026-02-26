import { useState } from 'react';
import { Play, ExternalLink, Music, Video, Globe, Camera } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  category: 'music' | 'marketing' | 'web' | 'video';
  description: string;
  image: string;
  link?: string;
  stats?: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Urban Trap Collection',
    category: 'music',
    description: 'A series of hard-hitting trap beats with melodic elements. Featured in multiple projects.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    stats: '10K+ Streams',
  },
  {
    id: '2',
    title: 'Hip-Hop Remix Package',
    category: 'music',
    description: 'Modern hip-hop remixes bringing fresh energy to classic tracks.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    stats: '25K+ Views',
  },
  {
    id: '3',
    title: 'Brand Launch Campaign',
    category: 'marketing',
    description: 'Complete digital marketing campaign for a fashion startup, including social media and ads.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    stats: '300% ROI',
  },
  {
    id: '4',
    title: 'E-Commerce Website',
    category: 'web',
    description: 'Modern, responsive online store with seamless checkout experience.',
    image: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&q=80',
    stats: '50K+ Monthly Visitors',
  },
  {
    id: '5',
    title: 'Music Video Production',
    category: 'video',
    description: 'Professional music video shoot and edit for emerging artist.',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
    stats: '100K+ Views',
  },
  {
    id: '6',
    title: 'Social Media Content',
    category: 'marketing',
    description: 'Monthly content creation for multiple brands across Instagram, TikTok, and YouTube.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
    stats: '500K+ Reach',
  },
  {
    id: '7',
    title: 'Producer Portfolio Site',
    category: 'web',
    description: 'Sleek portfolio website for music producer showcasing beats and services.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    stats: 'Featured Design',
  },
  {
    id: '8',
    title: 'Lo-Fi Chill Beats',
    category: 'music',
    description: 'Smooth, atmospheric lo-fi beats perfect for studying and relaxation.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    stats: '15K+ Downloads',
  },
];

const categories = [
  { value: 'all', label: 'All Work', icon: null },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'marketing', label: 'Marketing', icon: Camera },
  { value: 'web', label: 'Web Design', icon: Globe },
  { value: 'video', label: 'Video', icon: Video },
];

export function PortfolioSection() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredItems = activeFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">Portfolio</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A showcase of our best work in music production, digital marketing, and web development
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.value}
                onClick={() => setActiveFilter(category.value)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all ${
                  activeFilter === category.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Portfolio Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 backdrop-blur-lg border border-purple-500/20 rounded-xl overflow-hidden hover:bg-white/10 transition-all group"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.category === 'music' ? 'bg-purple-600' :
                      item.category === 'marketing' ? 'bg-pink-600' :
                      item.category === 'web' ? 'bg-blue-600' :
                      'bg-green-600'
                    }`}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-400 font-semibold text-sm">{item.stats}</span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Create Something Amazing?</h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Let's collaborate on your next project. Whether it's a beat, a campaign, or a website, 
            we're here to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.youtube.com/@shhmaart"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-full font-semibold transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5" />
              <span>View YouTube Channel</span>
            </a>
            <a 
              href="mailto:shhmaart@gmail.com"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold border border-white/20 transition-all"
            >
              <span>Get in Touch</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}