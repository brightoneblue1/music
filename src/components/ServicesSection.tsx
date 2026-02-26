import { useState, useEffect } from 'react';
import { 
  Camera, 
  TrendingUp, 
  Code, 
  Palette, 
  Video, 
  Megaphone,
  Calendar,
  Cloud
} from 'lucide-react';
import { BookingModal } from './BookingModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'marketing' | 'web' | 'other';
  price: string;
}

const iconMap: { [key: string]: any } = {
  camera: Camera,
  trending: TrendingUp,
  code: Code,
  palette: Palette,
  video: Video,
  megaphone: Megaphone,
  cloud: Cloud,
};

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'marketing' | 'web' | 'other'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/services`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch services:', await response.text());
        return;
      }
      
      const data = await response.json();
      setServices(data.services || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setIsLoading(false);
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const filteredServices = filter === 'all' 
    ? services 
    : services.filter(service => service.category === filter);

  // Remove duplicates based on service name
  const uniqueServices = filteredServices.filter((service, index, self) =>
    index === self.findIndex((s) => s.name.toLowerCase() === service.name.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">Our Services</h2>
          <p className="text-xl text-gray-300">
            Professional solutions to grow your brand and business
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center flex-wrap gap-4 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All Services
          </button>
          <button
            onClick={() => setFilter('marketing')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'marketing'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Digital Marketing
          </button>
          <button
            onClick={() => setFilter('web')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'web'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Web Services
          </button>
          <button
            onClick={() => setFilter('other')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'other'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Other Services
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-20">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">Loading services...</p>
            </div>
          ) : uniqueServices.length > 0 ? (
            uniqueServices.map((service) => {
              const IconComponent = iconMap[service.icon] || Code;
              
              return (
                <div
                  key={service.id}
                  className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-xl p-6 hover:bg-white/10 transition-all group"
                >
                  <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{service.name}</h3>
                  <p className="text-gray-400 mb-6 min-h-[60px]">{service.description}</p>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleBookService(service)}
                      className="flex items-center space-x-2 bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">No services available in this category yet.</p>
            </div>
          )}
        </div>
      </div>

      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
        />
      )}
    </div>
  );
}