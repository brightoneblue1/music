import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Code } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'marketing' | 'web' | 'other';
  price: string;
}

const iconOptions = [
  { value: 'camera', label: 'Camera' },
  { value: 'trending', label: 'Trending' },
  { value: 'code', label: 'Code' },
  { value: 'palette', label: 'Palette' },
  { value: 'video', label: 'Video' },
  { value: 'megaphone', label: 'Megaphone' },
  { value: 'cloud', label: 'Cloud' },
];

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'code',
    category: 'web' as 'marketing' | 'web' | 'other',
    price: '',
  });

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
      
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/services`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setFormData({
          name: '',
          description: '',
          icon: 'code',
          category: 'web',
          price: '',
        });
        setShowForm(false);
        fetchServices();
      } else {
        alert('Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Error adding service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/services/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Services</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Service</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 rounded-lg p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Service Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Design"
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., $999"
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="marketing">Digital Marketing</option>
                <option value="web">Web Services</option>
                <option value="other">Other Services</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the service..."
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-6 py-2 rounded-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Add Service</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Current Services ({services.length})</h3>
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white/5 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-all"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{service.name}</h4>
                <p className="text-sm text-gray-400">{service.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                    {service.category}
                  </span>
                  <span className="text-sm font-bold text-purple-400">{service.price}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(service.id)}
              className="text-red-400 hover:text-red-300 transition-colors ml-4"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {services.length === 0 && (
          <p className="text-gray-400 text-center py-8">No services added yet</p>
        )}
      </div>
    </div>
  );
}
